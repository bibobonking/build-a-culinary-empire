import React, { useState, useEffect, useRef, useCallback, useDeferredValue, lazy, Suspense } from 'react';
import {
  GameState,
  Order,
  Review,
  Difficulty,
  RandomEventChoice,
  Recipe,
  FoodBoxId,
  FoodBoxInfo,
  RecipeRarity,
  CookingBatch,
  FixSaveReport,
  OfflineReport,
} from './types';
import {
  INGREDIENTS,
  CUSTOMER_ARCHETYPES,
  RESTAURANT_TIERS,
  AVAILABLE_STAFF_CANDIDATES,
  BANK_LOANS,
  SEASONAL_EVENTS,
} from './data/gameData';
import {
  FOODBOX_DEFINITIONS,
  MASTER_RECIPES,
} from './data/recipeDatabase';
import {
  createInitialGameState,
  saveGameState,
  loadGameState,
  manualAutoFix,
} from './utils/storage';
import {
  generateShopInventory,
  rollCraftingOutcome,
  openFoodBoxOutcome,
} from './utils/crafting';
import { sound } from './utils/audio';
import { fx } from './utils/fx';
import { tickGame, tickSecond, applyProgress, simulateOffline, bump } from './game/engine';
import { DAILY_REWARDS, localDateKey } from './game/achievements';
import confetti from './utils/confettiFx';

import { Header } from './components/Header';
import { VisualRestaurant } from './components/VisualRestaurant';
import { NavigationTabBar, TabItem } from './components/NavigationTabBar';

// Tabs are code-split: only the active tab's code is downloaded/parsed
const ShopTab = lazy(() => import('./components/tabs/ShopTab').then((m) => ({ default: m.ShopTab })));
const CraftingTab = lazy(() => import('./components/tabs/CraftingTab').then((m) => ({ default: m.CraftingTab })));
const CookingTab = lazy(() => import('./components/tabs/CookingTab').then((m) => ({ default: m.CookingTab })));
const KitchenTab = lazy(() => import('./components/tabs/KitchenTab').then((m) => ({ default: m.KitchenTab })));
const StaffTab = lazy(() => import('./components/tabs/StaffTab').then((m) => ({ default: m.StaffTab })));
const CustomersTab = lazy(() => import('./components/tabs/CustomersTab').then((m) => ({ default: m.CustomersTab })));
const MarketTab = lazy(() => import('./components/tabs/MarketTab').then((m) => ({ default: m.MarketTab })));
const FinanceTab = lazy(() => import('./components/tabs/FinanceTab').then((m) => ({ default: m.FinanceTab })));
const EventsTab = lazy(() => import('./components/tabs/EventsTab').then((m) => ({ default: m.EventsTab })));
const QuestsTab = lazy(() => import('./components/tabs/QuestsTab').then((m) => ({ default: m.QuestsTab })));
const AchievementsTab = lazy(() => import('./components/tabs/AchievementsTab').then((m) => ({ default: m.AchievementsTab })));

import { ToastHost } from './components/ToastHost';
import { OfflineEarningsModal } from './components/modals/OfflineEarningsModal';
import { HiddenLoader } from './loader/HiddenLoader';
import { TutorialModal } from './components/modals/TutorialModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { EventModal } from './components/modals/EventModal';
import { FoodBoxModal } from './components/modals/FoodBoxModal';
import BootSplash from './components/BootSplash';
import { RecipeDiscoveredModal } from './components/modals/RecipeDiscoveredModal';
import { AutoFixSaveModal } from './components/modals/AutoFixSaveModal';
import { LevelUpModal } from './components/modals/LevelUpModal';

function TabSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      <div className="skeleton h-24 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="skeleton h-40 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl hidden lg:block" />
      </div>
    </div>
  );
}

export default function App() {
  // Boot: load save, then grant offline earnings for the time the player was away
  const [boot] = useState<{ st: GameState; report: OfflineReport | null }>(() => {
    const saved = loadGameState();
    let st = saved || createInitialGameState('normal');
    let report: OfflineReport | null = null;
    if (saved && saved.lastSeenAt) {
      const sim = simulateOffline(st, Date.now() - saved.lastSeenAt);
      if (sim) {
        st = sim.state;
        report = sim.report;
      }
    }
    return { st, report };
  });

  const [gameState, setGameStateRaw] = useState<GameState>(boot.st);
  // Boot splash: che khoảng trắng khi bundle + font đang tải
  const [booting, setBooting] = useState(true);
  // Source of truth for game logic: always the latest state, readable from any callback.
  const stateRef = useRef<GameState>(boot.st);
  const setGameState = useCallback(
    (u: GameState | ((p: GameState) => GameState)) => {
      const next = typeof u === 'function' ? (u as (p: GameState) => GameState)(stateRef.current) : u;
      if (next === stateRef.current) return;
      stateRef.current = next;
      setGameStateRaw(next);
    },
    []
  );
  const [offlineReport, setOfflineReport] = useState<OfflineReport | null>(boot.report);
  // The tab panel renders at lower priority so ticks never block clicks
  const tabState = useDeferredValue(gameState);

  const [activeTab, setActiveTab] = useState<string>('shop');
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(!gameState.tutorialSeen);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [cheerCooldown, setCheerCooldown] = useState<boolean>(false);

  // FoodBox modal state
  const [foodBoxModalData, setFoodBoxModalData] = useState<{
    isOpen: boolean;
    foodBox: FoodBoxInfo | null;
    recipe: Recipe | null;
    rarity: RecipeRarity | null;
    isNew: boolean;
    duplicateCpReward: number;
  }>({
    isOpen: false,
    foodBox: null,
    recipe: null,
    rarity: null,
    isNew: false,
    duplicateCpReward: 0,
  });

  // Crafting discovery modal state
  const [discoveredModalData, setDiscoveredModalData] = useState<{
    isOpen: boolean;
    recipe: Recipe | null;
    rarity: RecipeRarity | null;
    isNew: boolean;
    duplicateCpReward: number;
  }>({
    isOpen: false,
    recipe: null,
    rarity: null,
    isNew: false,
    duplicateCpReward: 0,
  });

  // Level-Up celebration modal state
  const [levelUpModalData, setLevelUpModalData] = useState<{
    isOpen: boolean;
    newLevel: number;
    bonusCash: number;
    bonusCp: number;
  }>({
    isOpen: false,
    newLevel: 1,
    bonusCash: 0,
    bonusCp: 0,
  });

  // Auto FixSave modal state (automatically opens if old save was detected and migrated on load)
  const [fixReportModalData, setFixReportModalData] = useState<{
    isOpen: boolean;
    report: FixSaveReport | null;
  }>(() => {
    if (gameState.lastFixReport && gameState.lastFixReport.wasMigrated) {
      return {
        isOpen: true,
        report: gameState.lastFixReport,
      };
    }
    return {
      isOpen: false,
      report: null,
    };
  });

  const handleTriggerManualFixSave = () => {
    const { fixedState, report } = manualAutoFix(gameState);
    setGameState(fixedState);
    setFixReportModalData({
      isOpen: true,
      report,
    });
    setSaveMessage('Đã FixSave!');
    setTimeout(() => setSaveMessage(null), 2500);
  };

  // Synchronize low graphic mode CSS class on body
  useEffect(() => {
    if (gameState.lowGraphicMode) {
      document.body.classList.add('low-graphic-mode');
    } else {
      document.body.classList.remove('low-graphic-mode');
    }
  }, [gameState.lowGraphicMode]);

  const handleSetLowGraphic = (enabled: boolean) => {
    sound.playTap();
    setGameState((prev) => {
      const updated = { ...prev, lowGraphicMode: enabled };
      saveGameState(updated);
      return updated;
    });
  };

  // --- 1. SINGLE GAME LOOP -------------------------------------------------
  // One timer drives both the real-time (1s) systems and the in-game clock, so at
  // 1x speed React renders once per second instead of twice.
  useEffect(() => {
    const speed = gameState.gameSpeed;
    const interval = speed > 1 ? Math.max(50, Math.round(1000 / speed)) : 1000;
    let acc = 0;
    const id = setInterval(() => {
      acc += interval;
      const doSecond = acc >= 1000;
      if (doSecond) acc -= 1000;
      let next = stateRef.current;
      if (speed > 0) next = tickGame(next);
      if (doSecond) next = applyProgress(tickSecond(next));
      setGameState(next);
    }, interval);
    return () => clearInterval(id);
  }, [gameState.gameSpeed, setGameState]);

  // --- 2. AUTOSAVE (outside the render path) -------------------------------
  useEffect(() => {
    const save = () => saveGameState(stateRef.current);
    save(); // stamps lastSeenAt so a quick reload can't re-grant offline earnings
    const id = setInterval(save, 15000);
    const onHide = () => {
      if (document.visibilityState === 'hidden') save();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', save);
    window.addEventListener('beforeunload', save);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', save);
      window.removeEventListener('beforeunload', save);
    };
  }, []);


  // --- KEYBOARD SHORTCUTS --------------------------------------------------
  // Space: pause/resume • F: 1x/2x • 1-9,0: switch tab • T: tea • C: invite guest • M: mute • Ctrl+S: save
  const shortcutRef = useRef<{ tabIds: string[] }>({ tabIds: [] });
  const handleEarnQuickCashRef = useRef<() => void>(() => {});
  const handleCallCustomerRef = useRef<() => void>(() => {});
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (document.querySelector('.fixed.inset-0')) return;
      const key = e.key.toLowerCase();

      if ((e.ctrlKey || e.metaKey) && key === 's' && !e.shiftKey) {
        e.preventDefault();
        saveGameState(stateRef.current);
        setSaveMessage('Đã lưu!');
        setTimeout(() => setSaveMessage(null), 2000);
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (key === ' ') {
        e.preventDefault();
        setGameState((p) => ({ ...p, gameSpeed: p.gameSpeed === 0 ? 1 : 0 }));
      } else if (key === 'f') {
        setGameState((p) => ({ ...p, gameSpeed: p.gameSpeed === 2 ? 1 : 2 }));
      } else if (key === 'm') {
        sound.toggleMute();
      } else if (key === 't') {
        handleEarnQuickCashRef.current();
      } else if (key === 'c') {
        handleCallCustomerRef.current();
      } else if (/^[0-9]$/.test(key)) {
        const idx = key === '0' ? 9 : Number(key) - 1;
        const id = shortcutRef.current.tabIds[idx];
        if (id) {
          sound.playTap();
          setActiveTab(id);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setGameState]);

  // --- 3. CORE GAMEPLAY HANDLERS ---

  // Manual Quick Hustle: Bán Trà Đá Vỉa Hè (+$10)
  const handleEarnQuickCash = () => {
    sound.playCashRegister();
    const earned = 10;
    setGameState((prev) => ({
      ...prev,
      cash: Math.round((prev.cash + earned) * 10) / 10,
      todayStats: {
        ...prev.todayStats,
        revenue: prev.todayStats.revenue + earned,
        customersServed: prev.todayStats.customersServed + 1,
      },
      eventLogs: [
        `🥤 [Bán Trà Đá Vỉa Hè] Phục vụ trà đá giải khát cho khách qua đường, nhận nóng +$${earned}!`,
        ...prev.eventLogs,
      ].slice(0, 30),
    }));
  };

  // Buy Ingredient from 3-Minute Restock Shop
  const handleBuyIngredient = (ingredientId: string, amount: number) => {
    setGameState((prev) => {
      const shopItem = prev.shopIngredients.find((i) => i.id === ingredientId);
      if (!shopItem || shopItem.currentStock <= 0) return prev;

      const purchaseAmount = Math.min(amount, shopItem.currentStock);
      const unitPrice = shopItem.discountPercent
        ? Math.round(shopItem.basePrice * (1 - shopItem.discountPercent / 100))
        : shopItem.basePrice;
      const totalCost = unitPrice * purchaseAmount;

      if (prev.cash < totalCost) return prev;

      sound.playCashRegister();

      const updatedShopIngredients = prev.shopIngredients.map((i) =>
        i.id === ingredientId ? { ...i, currentStock: i.currentStock - purchaseAmount } : i
      );

      return {
        ...prev,
        cash: Math.round((prev.cash - totalCost) * 10) / 10,
        inventory: {
          ...prev.inventory,
          [ingredientId]: (prev.inventory[ingredientId] || 0) + purchaseAmount,
        },
        shopIngredients: updatedShopIngredients,
        counters: bump(prev.counters, 'shopBuys'),
        eventLogs: [
          `🛒 Đã mua ${purchaseAmount} ${shopItem.unit} ${shopItem.name} với giá -$${totalCost}!`,
          ...prev.eventLogs,
        ].slice(0, 30),
      };
    });
  };

  // Sell ingredient back at 75% base price
  const handleSellIngredient = (ingredientId: string, amount: number) => {
    const item = INGREDIENTS.find((i) => i.id === ingredientId);
    if (!item) return;

    setGameState((prev) => {
      const currentOwned = prev.inventory[ingredientId] || 0;
      if (currentOwned <= 0) return prev;

      const sellCount = Math.min(amount, currentOwned);
      const unitRefund = Math.round(item.basePrice * 0.75);
      const totalRefund = unitRefund * sellCount;

      sound.playCashRegister();

      return {
        ...prev,
        cash: Math.round((prev.cash + totalRefund) * 10) / 10,
        inventory: {
          ...prev.inventory,
          [ingredientId]: currentOwned - sellCount,
        },
        eventLogs: [
          `💰 Đã thanh lý ${sellCount} ${item.unit} ${item.name} thu về +$${totalRefund}!`,
          ...prev.eventLogs,
        ].slice(0, 30),
      };
    });
  };

  // Buy Mystery FoodBox from Shop
  const handleBuyFoodBox = (boxId: FoodBoxId) => {
    const boxInfo = FOODBOX_DEFINITIONS.find((b) => b.id === boxId);
    if (!boxInfo || stateRef.current.cash < boxInfo.costCash) return;

    sound.playCashRegister();
    setGameState((prev) => ({
      ...prev,
      cash: prev.cash - boxInfo.costCash,
      foodBoxesOwned: {
        ...prev.foodBoxesOwned,
        [boxId]: (prev.foodBoxesOwned[boxId] || 0) + 1,
      },
      eventLogs: [
        `🎁 Đã mua thành công 1 ${boxInfo.name} trong shop!`,
        ...prev.eventLogs,
      ].slice(0, 30),
    }));

    // Trigger open immediately
    handleOpenFoodBox(boxId);
  };

  // Open Owned FoodBox (Gacha)
  const handleOpenFoodBox = (boxId: FoodBoxId) => {
    const boxInfo = FOODBOX_DEFINITIONS.find((b) => b.id === boxId);
    const cur = stateRef.current;
    if (!boxInfo || (cur.foodBoxesOwned[boxId] || 0) <= 0) return;

    const outcome = openFoodBoxOutcome(boxId, cur);

    setGameState((prev) => {
      const updatedBoxes = {
        ...prev.foodBoxesOwned,
        [boxId]: Math.max(0, (prev.foodBoxesOwned[boxId] || 0) - 1),
      };

      const existing = prev.recipes.find((r) => r.id === outcome.recipe.id);
      const isAlreadyUnlocked = existing ? existing.unlocked : false;
      let updatedRecipes: Recipe[];

      if (existing) {
        if (isAlreadyUnlocked) {
          // Exactly the same dish was already unlocked -> increment duplicate count on this card
          updatedRecipes = prev.recipes.map((r) =>
            r.id === outcome.recipe.id
              ? {
                  ...r,
                  unlocked: true,
                  count: (r.count || 1) + 1,
                }
              : r
          );
        } else {
          // Different dish being unlocked for the first time -> create/enable new separate card with count 1
          updatedRecipes = prev.recipes.map((r) =>
            r.id === outcome.recipe.id
              ? {
                  ...r,
                  unlocked: true,
                  count: 1,
                }
              : r
          );
        }
      } else {
        // Brand new synthetic/custom dish -> add as separate card
        updatedRecipes = [
          ...prev.recipes,
          {
            ...outcome.recipe,
            unlocked: true,
            count: 1,
          },
        ];
      }

      return {
        ...prev,
        foodBoxesOwned: updatedBoxes,
        recipes: updatedRecipes,
        counters: bump(prev.counters, 'boxesOpened'),
        creativePoints: prev.creativePoints + (outcome.isNew ? 10 : outcome.duplicateCpReward),
        eventLogs: [
          `📦 Mở ${boxInfo.name}: ${
            outcome.isNew
              ? `Khai mở món mới [${outcome.rarity}] "${outcome.recipe.name}"!`
              : `Nhận thêm 1 bản trùng món [${outcome.rarity}] "${outcome.recipe.name}" (+${outcome.duplicateCpReward} CP)!`
          }`,
          ...prev.eventLogs,
        ].slice(0, 30),
      };
    });

    // Show celebratory unboxing modal
    setFoodBoxModalData({
      isOpen: true,
      foodBox: boxInfo,
      recipe: outcome.recipe,
      rarity: outcome.rarity,
      isNew: outcome.isNew,
      duplicateCpReward: outcome.duplicateCpReward,
    });
  };

  // Crafting / Fusion Recipe Discovery
  const handleCraftRecipe = (selectedIngredientIds: string[]) => {
    if (selectedIngredientIds.length < 2) return;

    const selectedItems = selectedIngredientIds
      .map((id) => INGREDIENTS.find((i) => i.id === id))
      .filter((i): i is typeof INGREDIENTS[0] => Boolean(i));

    // Deduct ingredients used
    const cur = stateRef.current;
    const updatedInventory = { ...cur.inventory };
    selectedIngredientIds.forEach((id) => {
      updatedInventory[id] = Math.max(0, (updatedInventory[id] || 0) - 1);
    });

    const outcome = rollCraftingOutcome(
      selectedItems,
      cur.equipment,
      cur.restaurantLevel,
      cur.recipes,
      // Boost may mắn sáng chế theo mùa/lễ hội đang diễn ra
      (SEASONAL_EVENTS[cur.season] || SEASONAL_EVENTS.spring).craftingLuck
    );

    setGameState((prev) => {
      const existing = prev.recipes.find((r) => r.id === outcome.recipe.id);
      const isAlreadyUnlocked = existing ? existing.unlocked : false;
      let updatedRecipes: Recipe[];

      if (existing) {
        if (isAlreadyUnlocked) {
          // Exactly the same dish was already unlocked -> increment duplicate count on this card
          updatedRecipes = prev.recipes.map((r) =>
            r.id === outcome.recipe.id
              ? {
                  ...r,
                  unlocked: true,
                  count: (r.count || 1) + 1,
                }
              : r
          );
        } else {
          // Different dish being unlocked for the first time -> create/enable new separate card with count 1
          updatedRecipes = prev.recipes.map((r) =>
            r.id === outcome.recipe.id
              ? {
                  ...r,
                  unlocked: true,
                  count: 1,
                }
              : r
          );
        }
      } else {
        // Brand new synthetic/custom dish -> add as separate card
        updatedRecipes = [
          ...prev.recipes,
          {
            ...outcome.recipe,
            unlocked: true,
            count: 1,
          },
        ];
      }

      return {
        ...prev,
        inventory: updatedInventory,
        recipes: updatedRecipes,
        counters: bump(prev.counters, 'crafted'),
        creativePoints: prev.creativePoints + (outcome.isNew ? 15 : outcome.duplicateCpReward),
        reputation: Math.min(100, prev.reputation + 2),
        eventLogs: [
          `⚗️ [Bếp Sáng Chế] ${
            outcome.isNew
              ? `Sáng chế thành công món mới [${outcome.rarity}] "${outcome.recipe.name}"!`
              : `Nhận thêm 1 bản trùng món [${outcome.rarity}] "${outcome.recipe.name}" (+${outcome.duplicateCpReward} CP)!`
          }`,
          ...prev.eventLogs,
        ].slice(0, 30),
      };
    });

    // Show discovery modal
    setDiscoveredModalData({
      isOpen: true,
      recipe: outcome.recipe,
      rarity: outcome.rarity,
      isNew: outcome.isNew,
      duplicateCpReward: outcome.duplicateCpReward,
    });
  };

  // Delete / Discard Recipe (Clean up unwanted recipes & refund CP / Cash)
  const handleDeleteRecipe = (recipeId: string) => {
    const rec = stateRef.current.recipes.find((r) => r.id === recipeId);
    if (!rec) return;

    sound.playTap();

    const cpRefund =
      rec.rarity === 'Secret'
        ? 150
        : rec.rarity === 'Mythical'
        ? 75
        : rec.rarity === 'Legendary'
        ? 35
        : rec.rarity === 'Epic'
        ? 15
        : 6;

    const cashRefund = Math.round(rec.sellPrice * 0.25);

    setGameState((prev) => {
      const existing = prev.recipes.find((r) => r.id === recipeId);
      if (!existing) return prev;

      const currentCount = existing.count || 1;
      let updatedRecipes: Recipe[];

      if (currentCount > 1) {
        updatedRecipes = prev.recipes.map((r) =>
          r.id === recipeId ? { ...r, count: currentCount - 1 } : r
        );
      } else {
        updatedRecipes = prev.recipes.map((r) =>
          r.id === recipeId ? { ...r, unlocked: false, count: 0 } : r
        );
      }

      return {
        ...prev,
        recipes: updatedRecipes,
        creativePoints: prev.creativePoints + cpRefund,
        cash: prev.cash + cashRefund,
        eventLogs: [
          `🗑️ Đã thu dọn 1 bản công thức [${rec.rarity}] "${rec.name}"! Nhận hoàn lại +${cpRefund} CP & +$${cashRefund.toLocaleString()}!`,
          ...prev.eventLogs,
        ].slice(0, 30),
      };
    });
  };

  // Dọn toàn bộ bản trùng: giữ lại 1 bản mỗi món, hoàn tiền & CP cho các bản dư
  const handleCleanDuplicates = () => {
    setGameState((prev) => {
      let gainedCash = 0;
      let gainedCp = 0;
      let removed = 0;

      const cpByRarity = (r: string) =>
        r === 'Secret' ? 150 : r === 'Mythical' ? 75 : r === 'Legendary' ? 35 : r === 'Epic' ? 15 : 6;

      const updatedRecipes = prev.recipes.map((r) => {
        const extra = (r.count || 1) - 1;
        if (!r.unlocked || extra <= 0) return r;
        removed += extra;
        gainedCash += Math.round(r.sellPrice * 0.25) * extra;
        gainedCp += cpByRarity(r.rarity) * extra;
        return { ...r, count: 1 };
      });

      if (removed === 0) return prev;

      return {
        ...prev,
        recipes: updatedRecipes,
        cash: prev.cash + gainedCash,
        creativePoints: prev.creativePoints + gainedCp,
        eventLogs: [
          `🧺 Dọn ${removed} bản trùng công thức — hoàn lại $${gainedCash.toLocaleString()} & ${gainedCp} CP!`,
          ...prev.eventLogs,
        ].slice(0, 30),
      };
    });
  };

  // Manual Free Cook Batch
  const handleManualCook = (recipeId: string, amount: number) => {
    const rec = gameState.recipes.find((r) => r.id === recipeId && r.unlocked);
    if (!rec) return;

    sound.playCookSizzle();

    const newBatch: CookingBatch = {
      id: `batch_man_${Date.now()}_${Math.random()}`,
      recipeId: rec.id,
      recipeName: rec.name,
      recipeIcon: rec.icon,
      amount,
      totalTime: rec.cookTime,
      remainingTime: rec.cookTime,
      progress: 0,
      isManual: true,
    };

    setGameState((prev) => ({
      ...prev,
      cookingBatches: [...prev.cookingBatches, newBatch],
      counters: bump(prev.counters, 'manualCooked', amount),
      eventLogs: [
        `🍳 Bắt đầu nấu ${amount} suất "${rec.name}" hoàn toàn MIỄN PHÍ!`,
        ...prev.eventLogs,
      ].slice(0, 30),
    }));
  };

  // Restaurant Tier Upgrade: nâng cấp bằng TIỀN + SỐ NHIỆM VỤ ĐÃ NHẬN THƯỞNG (không còn yêu cầu số công thức)
  const handleUpgradeTier = () => {
    const cur = stateRef.current;
    const nextTier = RESTAURANT_TIERS.find((t) => t.level === cur.restaurantLevel + 1);
    if (!nextTier) return;

    const claimedQuests = cur.quests.filter((q) => q.claimed).length;
    if (cur.cash < nextTier.requiredCash) {
      fx.toast({ kind: 'warn', icon: '💰', title: 'Chưa đủ tiền nâng cấp', text: `Cần $${nextTier.requiredCash.toLocaleString()}` });
      return;
    }
    if (cur.reputation < nextTier.requiredReputation) {
      fx.toast({ kind: 'warn', icon: '⭐', title: 'Danh tiếng chưa đủ', text: `Cần ${nextTier.requiredReputation}% danh tiếng` });
      return;
    }
    if (claimedQuests < nextTier.requiredQuests) {
      fx.toast({ kind: 'warn', icon: '🏆', title: 'Chưa hoàn thành đủ nhiệm vụ', text: `Cần nhận thưởng ${nextTier.requiredQuests} nhiệm vụ (đang có ${claimedQuests})` });
      return;
    }

    sound.playCelebration();
    if (!cur.lowGraphicMode) {
      confetti({ particleCount: 100, spread: 80 });
    }

    // Thưởng khích lệ khi thăng cấp
    const bonusCash = nextTier.level * 2000;
    const bonusCp = nextTier.level * 20;

    setGameState((prev) => ({
      ...prev,
      cash: prev.cash - nextTier.requiredCash + bonusCash,
      creativePoints: prev.creativePoints + bonusCp,
      restaurantLevel: nextTier.level,
      seats: Math.max(prev.seats, Math.round(nextTier.maxSeats * 0.7)),
      reputation: Math.min(100, prev.reputation + 8),
      eventLogs: [
        `🏰 CHÚC MỪNG! Cơ sở của bạn đã nâng cấp lên Cấp ${nextTier.level}: ${nextTier.name}! (+$${bonusCash.toLocaleString()}, +${bonusCp} CP)`,
        ...prev.eventLogs,
      ].slice(0, 30),
    }));

    setLevelUpModalData({ isOpen: true, newLevel: nextTier.level, bonusCash, bonusCp });
  };

  // Buy Kitchen Equipment
  const handleBuyEquipment = (eqId: string) => {
    setGameState((prev) => {
      const eq = prev.equipment.find((e) => e.id === eqId);
      if (!eq || prev.cash < eq.cost) return prev;

      sound.playCashRegister();

      return {
        ...prev,
        cash: prev.cash - eq.cost,
        equipment: prev.equipment.map((e) => (e.id === eqId ? { ...e, unlocked: true } : e)),
        eventLogs: [
          `🔥 Lắp đặt trang bị cao cấp: "${eq.name}" (+${eq.speedBonus}% Tốc độ, +${eq.luckBonus}% May Mắn)!`,
          ...prev.eventLogs,
        ].slice(0, 30),
      };
    });
  };

  // Expand Dining Seats
  const handleExpandSeats = () => {
    const currentTier =
      RESTAURANT_TIERS.find((t) => t.level === gameState.restaurantLevel) || RESTAURANT_TIERS[0];
    const cost = Math.round(gameState.seats * 25 + 50);
    if (gameState.cash < cost || gameState.seats >= currentTier.maxSeats) return;

    sound.playCashRegister();

    setGameState((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      seats: prev.seats + 2,
      eventLogs: [
        `🪑 Đã mở rộng thêm 2 ghế ngồi ăn cho thực khách!`,
        ...prev.eventLogs,
      ].slice(0, 30),
    }));
  };

  // Staff Management Handlers
  const handleBonusStaff = (staffId: string) => {
    if (gameState.cash < 20) return;
    sound.playCashRegister();
    setGameState((prev) => ({
      ...prev,
      cash: prev.cash - 20,
      staff: prev.staff.map((s) =>
        s.id === staffId ? { ...s, morale: Math.min(100, s.morale + 30) } : s
      ),
    }));
  };

  const handleRestStaff = (staffId: string) => {
    setGameState((prev) => ({
      ...prev,
      staff: prev.staff.map((s) =>
        s.id === staffId ? { ...s, status: 'resting', fatigue: 0 } : s
      ),
    }));
  };

  const handleFireStaff = (staffId: string) => {
    if (gameState.staff.length <= 1) return;
    setGameState((prev) => ({
      ...prev,
      staff: prev.staff.filter((s) => s.id !== staffId),
    }));
  };

  const handleHireStaff = (candidateIndex: number) => {
    const cand = AVAILABLE_STAFF_CANDIDATES[candidateIndex];
    if (!cand || gameState.cash < cand.salary) return;

    sound.playCashRegister();
    if (!stateRef.current.lowGraphicMode) {
      confetti({ particleCount: 40, spread: 50 });
    }

    const newStaff = {
      ...cand,
      id: `staff_${Date.now()}_${candidateIndex}`,
      hiredAtDay: gameState.day,
      status: 'working' as const,
    };

    setGameState((prev) => ({
      ...prev,
      cash: prev.cash - cand.salary,
      staff: [...prev.staff, newStaff],
      eventLogs: [`🎉 Đã tuyển dụng nhân sự: ${cand.name}!`, ...prev.eventLogs].slice(0, 30),
    }));
  };

  const handleAdjustSalary = (staffId: string, amount: number) => {
    setGameState((prev) => ({
      ...prev,
      staff: prev.staff.map((s) =>
        s.id === staffId ? { ...s, salary: Math.max(10, s.salary + amount) } : s
      ),
    }));
  };

  // Quick Cheer Staff
  const handleCheerStaff = () => {
    if (cheerCooldown) return;
    setCheerCooldown(true);
    sound.playCelebration();

    setGameState((prev) => ({
      ...prev,
      creativePoints: prev.creativePoints + 2,
      staff: prev.staff.map((s) => ({
        ...s,
        morale: Math.min(100, s.morale + 10),
      })),
    }));

    setTimeout(() => setCheerCooldown(false), 5000);
  };

  // Wave to Invite Customer
  const handleCallCustomer = () => {
    if (gameState.activeOrders.length >= gameState.seats) return;

    const unlocked = gameState.recipes.filter((r) => r.unlocked);
    if (unlocked.length === 0) return;

    const chosen = unlocked[Math.floor(Math.random() * unlocked.length)];
    const chosenArchetype =
      CUSTOMER_ARCHETYPES[Math.floor(Math.random() * CUSTOMER_ARCHETYPES.length)];

    sound.playTap();

    const newOrder: Order = {
      id: `ord_inst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      tableNumber: gameState.activeOrders.length + 1,
      customerName: chosenArchetype.name,
      customerType: chosenArchetype.name,
      customerAvatar: chosenArchetype.icon,
      recipeId: chosen.id,
      recipeName: chosen.customName || chosen.name,
      recipeIcon: chosen.icon,
      sellPrice: chosen.sellPrice,
      status: 'cooking',
      progress: 0,
      totalTime: chosen.cookTime,
      remainingTime: chosen.cookTime,
      satisfaction: 100,
    };

    setGameState((prev) => ({
      ...prev,
      activeOrders: [...prev.activeOrders, newOrder],
    }));
  };

  // Quests & Missions
  const handleClaimQuest = (questId: string) => {
    setGameState((prev) => {
      const q = prev.quests.find((item) => item.id === questId);
      if (!q || !q.completed || q.claimed) return prev;

      sound.playCelebration();

      return {
        ...prev,
        cash: prev.cash + q.rewardCash,
        creativePoints: prev.creativePoints + q.rewardCp,
        foodBoxesOwned: q.rewardFoodBox
          ? {
              ...prev.foodBoxesOwned,
              [q.rewardFoodBox]: (prev.foodBoxesOwned[q.rewardFoodBox] || 0) + 1,
            }
          : prev.foodBoxesOwned,
        quests: prev.quests.map((item) =>
          item.id === questId ? { ...item, claimed: true } : item
        ),
        eventLogs: [
          `🏆 Nhận thưởng nhiệm vụ "${q.title}": +$${q.rewardCash}, +${q.rewardCp} CP!`,
          ...prev.eventLogs,
        ].slice(0, 30),
      };
    });
  };

  const handleClaimAllQuests = () => {
    setGameState((prev) => {
      const claimable = prev.quests.filter((q) => q.completed && !q.claimed);
      if (claimable.length === 0) return prev;

      sound.playCelebration();
      let bonusCash = 0;
      let bonusCp = 0;
      const boxes = { ...prev.foodBoxesOwned };

      claimable.forEach((q) => {
        bonusCash += q.rewardCash;
        bonusCp += q.rewardCp;
        if (q.rewardFoodBox) boxes[q.rewardFoodBox] = (boxes[q.rewardFoodBox] || 0) + 1;
      });

      return {
        ...prev,
        cash: prev.cash + bonusCash,
        creativePoints: prev.creativePoints + bonusCp,
        foodBoxesOwned: boxes,
        quests: prev.quests.map((q) =>
          q.completed ? { ...q, claimed: true } : q
        ),
        eventLogs: [
          `🏆 Nhận toàn bộ thưởng nhiệm vụ: +$${bonusCash}, +${bonusCp} CP!`,
          ...prev.eventLogs,
        ].slice(0, 30),
      };
    });
  };

  // Market & Channels
  const handleToggleChannel = (channel: 'foodTruck' | 'popUp' | 'onlineDelivery') => {
    const costs = { foodTruck: 800, popUp: 2200, onlineDelivery: 4500 };
    const cost = costs[channel];
    if (gameState.cash < cost) return;

    sound.playCelebration();
    setGameState((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      channels: {
        ...prev.channels,
        [channel]: true,
      },
      eventLogs: [`🚀 Mở rộng kênh kinh doanh mới!`, ...prev.eventLogs].slice(0, 30),
    }));
  };

  const handleRunCampaign = (type: 'flyer' | 'tiktoker' | 'tv') => {
    const campaigns = {
      flyer: { cost: 45, rep: 4 },
      tiktoker: { cost: 180, rep: 12 },
      tv: { cost: 850, rep: 25 },
    };
    const c = campaigns[type];
    if (gameState.cash < c.cost) return;

    setGameState((prev) => ({
      ...prev,
      cash: prev.cash - c.cost,
      reputation: Math.min(100, prev.reputation + c.rep),
      eventLogs: [`📢 Chạy chiến dịch truyền thông thành công (+${c.rep}% Danh tiếng)!`, ...prev.eventLogs].slice(0, 30),
    }));
  };

  // Loans & Franchises
  const handleTakeLoan = (loanId: string) => {
    setGameState((prev) => {
      const loan = prev.loans.find((l) => l.id === loanId);
      if (!loan || loan.taken) return prev;

      return {
        ...prev,
        cash: prev.cash + loan.amount,
        loans: prev.loans.map((l) => (l.id === loanId ? { ...l, taken: true } : l)),
        eventLogs: [`🏦 Đã nhận khoản vay vốn $${loan.amount}!`, ...prev.eventLogs].slice(0, 30),
      };
    });
  };

  // Early payoff: pay the remaining installments with a 10% discount
  const handleRepayLoan = (loanId: string) => {
    setGameState((prev) => {
      const loan = prev.loans.find((l) => l.id === loanId);
      if (!loan || !loan.taken) return prev;
      const payoff = Math.round(loan.dailyInterest * loan.remainingDays * 0.9);
      if (prev.cash < payoff) {
        fx.toast({ kind: 'warn', icon: '🏦', title: 'Không đủ tiền tất toán', text: `Cần $${payoff.toLocaleString()}` });
        return prev;
      }
      const orig = BANK_LOANS.find((b) => b.id === loanId);
      sound.playCashRegister();
      return {
        ...prev,
        cash: prev.cash - payoff,
        loans: prev.loans.map((l) =>
          l.id === loanId ? { ...l, taken: false, remainingDays: orig ? orig.remainingDays : 30 } : l
        ),
        eventLogs: [`🏦 Tất toán sớm "${loan.name}" với $${payoff.toLocaleString()} (giảm 10%)!`, ...prev.eventLogs].slice(0, 30),
      };
    });
  };

  // Daily gift (real-world day, with a 7-day streak)
  const handleClaimDaily = () => {
    setGameState((prev) => {
      const today = localDateKey();
      const dr = prev.dailyReward || { lastClaimDate: '', streak: 0 };
      if (dr.lastClaimDate === today) return prev;
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const streak = dr.lastClaimDate === localDateKey(y) ? dr.streak + 1 : 1;
      const reward = DAILY_REWARDS[(streak - 1) % DAILY_REWARDS.length];
      sound.playCelebration();
      if (!prev.lowGraphicMode) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 } });
      }
      fx.toast({ kind: 'success', icon: '🎁', title: `Quà ngày ${streak}!`, text: `+$${reward.cash.toLocaleString()} • +${reward.cp} CP` });
      return {
        ...prev,
        cash: prev.cash + reward.cash,
        creativePoints: prev.creativePoints + reward.cp,
        dailyReward: { lastClaimDate: today, streak },
        eventLogs: [`🎁 Nhận quà đăng nhập chuỗi ${streak} ngày: +$${reward.cash.toLocaleString()}, +${reward.cp} CP`, ...prev.eventLogs].slice(0, 30),
      };
    });
  };

  const handleBuyFranchise = (branchId: string) => {
    setGameState((prev) => {
      const b = prev.franchises.find((f) => f.id === branchId);
      if (!b || prev.cash < b.cost) return prev;

      return {
        ...prev,
        cash: prev.cash - b.cost,
        franchises: prev.franchises.map((f) => (f.id === branchId ? { ...f, owned: true } : f)),
        eventLogs: [`🏪 Khai trương chi nhánh nhượng quyền "${b.name}"!`, ...prev.eventLogs].slice(0, 30),
      };
    });
  };

  const handleAcquireRival = (rivalId: string) => {
    setGameState((prev) => {
      const r = prev.rivals.find((item) => item.id === rivalId);
      if (!r || prev.cash < r.cost) return prev;

      return {
        ...prev,
        cash: prev.cash - r.cost,
        reputation: Math.min(100, prev.reputation + 15),
        rivals: prev.rivals.map((item) => (item.id === rivalId ? { ...item, acquired: true } : item)),
        eventLogs: [`🤝 Đã sáp nhập đối thủ "${r.name}"!`, ...prev.eventLogs].slice(0, 30),
      };
    });
  };

  // Random Event Choice
  const handleEventChoice = (choice: RandomEventChoice) => {
    setGameState((prev) => {
      const nextCash = prev.cash - (choice.costCash || 0) + (choice.gainCash || 0);
      const nextRep = Math.min(100, Math.max(0, prev.reputation + (choice.reputationChange || 0)));
      const nextCP = prev.creativePoints + (choice.creativePointsGain || 0);
      // Một số lựa chọn sự kiện tặng kèm FoodBox
      const nextBoxes = choice.foodBoxReward
        ? {
            ...prev.foodBoxesOwned,
            [choice.foodBoxReward]: (prev.foodBoxesOwned[choice.foodBoxReward] || 0) + 1,
          }
        : prev.foodBoxesOwned;

      return {
        ...prev,
        cash: Math.round(nextCash * 10) / 10,
        reputation: nextRep,
        creativePoints: nextCP,
        foodBoxesOwned: nextBoxes,
        activeEvent: null,
        eventLogs: [
          `Sự kiện: ${choice.outcomeText}${choice.foodBoxReward ? ' 🎁 Nhận kèm 1 Hộp FoodBox!' : ''}`,
          ...prev.eventLogs,
        ].slice(0, 30),
      };
    });
  };

  const handleQuickSave = () => {
    saveGameState(gameState);
    setSaveMessage('Đã lưu!');
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleResetGame = (diff: Difficulty) => {
    const fresh = createInitialGameState(diff);
    fresh.tutorialSeen = true;
    setGameState(fresh);
    saveGameState(fresh);
  };

  // Main Tabs Configuration with dynamic notification badges
  const claimableQuestsCount = gameState.quests.filter((q) => q.completed && !q.claimed).length;
  const totalFoodBoxesOwned = Object.values(gameState.foodBoxesOwned).reduce((a, b) => a + b, 0);
  const totalCookedPlates = Object.values(gameState.cookedDishes).reduce((a, b) => a + b, 0);
  const dailyAvailable = (gameState.dailyReward?.lastClaimDate || '') !== localDateKey();

  const tabs: TabItem[] = [
    {
      id: 'shop',
      label: 'Chợ & FoodBox',
      icon: '🛒',
      badge: totalFoodBoxesOwned > 0 ? `${totalFoodBoxesOwned} Hộp` : null,
    },
    { id: 'crafting', label: 'Bếp Sáng Chế', icon: '⚗️' },
    {
      id: 'cooking',
      label: 'Nấu Món & Quầy Ra Món',
      icon: '🍳',
      badge: totalCookedPlates > 0 ? `${totalCookedPlates} Dĩa` : null,
    },
    { id: 'kitchen', label: 'Cấp Bậc & Thiết Bị', icon: '🏰' },
    {
      id: 'quests',
      label: 'Nhiệm Vụ',
      icon: '🏆',
      badge: claimableQuestsCount > 0 ? claimableQuestsCount : null,
    },
    { id: 'staff', label: 'Nhân Sự', icon: '👥' },
    { id: 'customers', label: 'Thực Khách', icon: '⭐' },
    { id: 'market', label: 'Thị Trường', icon: '📈' },
    { id: 'finance', label: 'Tài Chính & Đế Chế', icon: '💰' },
    {
      id: 'achievements',
      label: 'Thành Tựu & Quà',
      icon: '🏅',
      badge: dailyAvailable ? '🎁' : null,
    },
    { id: 'events', label: 'Nhật Ký', icon: '📰' },
  ];

  shortcutRef.current.tabIds = tabs.map((t) => t.id);
  handleEarnQuickCashRef.current = handleEarnQuickCash;
  handleCallCustomerRef.current = handleCallCustomer;

  return (
    <div className={`min-h-screen flex flex-col bg-[#FAF3E0] text-[#4A2E18] tier-theme tier-${gameState.restaurantLevel}`}>
      {/* Màn hình khởi động */}
      {booting && (
        <BootSplash
          isLowGraphic={!!gameState.lowGraphicMode}
          onDone={() => setBooting(false)}
        />
      )}

      {/* Header */}
      <Header
        gameState={gameState}
        onUpdateSpeed={(s) => setGameState((p) => ({ ...p, gameSpeed: s }))}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onQuickSave={handleQuickSave}
        saveMessage={saveMessage}
        onOpenCrafting={() => setActiveTab('crafting')}
        onOpenQuests={() => setActiveTab('quests')}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4 sm:space-y-5">
        {/* Animated Visual Restaurant Diorama */}
        <VisualRestaurant
          gameState={gameState}
          onCallCustomer={handleCallCustomer}
          onCheerStaff={handleCheerStaff}
          cheerCooldown={cheerCooldown}
          onEarnQuickCash={handleEarnQuickCash}
        />

        {/* Interactive Tab Navigation Shelf for PC and Mobile */}
        <NavigationTabBar
          tabs={tabs}
          activeTab={activeTab}
          onSelectTab={(tabId) => setActiveTab(tabId)}
        />

        {/* Active Tab Panel */}
        <div key={activeTab} className="tab-panel">
          <Suspense fallback={<TabSkeleton />}>
          {activeTab === 'shop' && (
            <ShopTab
              gameState={tabState}
              onBuyIngredient={handleBuyIngredient}
              onSellIngredient={handleSellIngredient}
              onOpenFoodBox={handleOpenFoodBox}
              onBuyFoodBox={handleBuyFoodBox}
              onEarnQuickCash={handleEarnQuickCash}
            />
          )}

          {activeTab === 'crafting' && (
            <CraftingTab
              gameState={gameState}
              onCraftRecipe={handleCraftRecipe}
            />
          )}

          {activeTab === 'cooking' && (
            <CookingTab
              gameState={gameState}
              onManualCook={handleManualCook}
              onDeleteRecipe={handleDeleteRecipe}
              onCleanDuplicates={handleCleanDuplicates}
              onOpenCraftingTab={() => setActiveTab('crafting')}
            />
          )}

          {activeTab === 'kitchen' && (
            <KitchenTab
              gameState={gameState}
              onUpgradeTier={handleUpgradeTier}
              onBuyEquipment={handleBuyEquipment}
              onExpandSeats={handleExpandSeats}
            />
          )}

          {activeTab === 'quests' && (
            <QuestsTab
              gameState={gameState}
              onClaimQuest={handleClaimQuest}
              onClaimAllQuests={handleClaimAllQuests}
              onOpenCulinaryLab={() => setActiveTab('crafting')}
            />
          )}

          {activeTab === 'staff' && (
            <StaffTab
              gameState={tabState}
              onBonusStaff={handleBonusStaff}
              onRestStaff={handleRestStaff}
              onFireStaff={handleFireStaff}
              onHireStaff={handleHireStaff}
              onAdjustSalary={handleAdjustSalary}
            />
          )}

          {activeTab === 'customers' && <CustomersTab gameState={tabState} />}

          {activeTab === 'market' && (
            <MarketTab
              gameState={tabState}
              onToggleChannel={handleToggleChannel}
              onRunCampaign={handleRunCampaign}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceTab
              gameState={tabState}
              onTakeLoan={handleTakeLoan}
              onRepayLoan={handleRepayLoan}
              onBuyFranchise={handleBuyFranchise}
              onAcquireRival={handleAcquireRival}
              onClaimEmergencyRelief={handleEarnQuickCash}
              onEarnQuickCash={handleEarnQuickCash}
            />
          )}

          {activeTab === 'achievements' && (
            <AchievementsTab
              gameState={tabState}
              dailyAvailable={dailyAvailable}
              onClaimDaily={handleClaimDaily}
            />
          )}

          {activeTab === 'events' && <EventsTab gameState={tabState} />}
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-[#A08875] border-t border-[#E6D5BC] bg-[#FAF3E0] mt-8">
        <p className="font-medium">
          Build a Culinary Empire &bull; Khởi nghiệp ẩm thực vươn tầm thế giới
        </p>
        <p className="mt-1 hidden sm:block opacity-70">
          Phím tắt: <kbd>Space</kbd> tạm dừng · <kbd>F</kbd> tăng tốc · <kbd>1</kbd>–<kbd>0</kbd> đổi tab · <kbd>T</kbd> trà đá · <kbd>C</kbd> mời khách · <kbd>M</kbd> tắt tiếng · <kbd>Ctrl</kbd>+<kbd>S</kbd> lưu
        </p>
      </footer>

      <ToastHost />
      <HiddenLoader
        getState={() => stateRef.current}
        setState={setGameState}
      />
      <OfflineEarningsModal report={offlineReport} onClose={() => setOfflineReport(null)} />

      {/* Modals */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => {
          setIsTutorialOpen(false);
          setGameState((prev) => ({ ...prev, tutorialSeen: true }));
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        gameState={gameState}
        onChangeDifficulty={(diff) => setGameState((prev) => ({ ...prev, difficulty: diff }))}
        onSetLowGraphic={handleSetLowGraphic}
        onSave={handleQuickSave}
        onReset={handleResetGame}
        onLoadImported={(st, report) => {
          setGameState(st);
          saveGameState(st);
          if (report && report.wasMigrated) {
            setFixReportModalData({
              isOpen: true,
              report,
            });
          }
        }}
        onTriggerFixSave={handleTriggerManualFixSave}
      />

      <AutoFixSaveModal
        isOpen={fixReportModalData.isOpen}
        report={fixReportModalData.report}
        onClose={() => setFixReportModalData((p) => ({ ...p, isOpen: false }))}
      />

      <EventModal
        event={gameState.activeEvent}
        onChoose={handleEventChoice}
      />

      <FoodBoxModal
        isOpen={foodBoxModalData.isOpen}
        onClose={() => setFoodBoxModalData((p) => ({ ...p, isOpen: false }))}
        foodBox={foodBoxModalData.foodBox}
        unlockedRecipe={foodBoxModalData.recipe}
        rarity={foodBoxModalData.rarity}
        isNew={foodBoxModalData.isNew}
        duplicateCpReward={foodBoxModalData.duplicateCpReward}
        isLowGraphic={!!gameState.lowGraphicMode}
      />

      <RecipeDiscoveredModal
        isOpen={discoveredModalData.isOpen}
        onClose={() => setDiscoveredModalData((p) => ({ ...p, isOpen: false }))}
        recipe={discoveredModalData.recipe}
        rarity={discoveredModalData.rarity}
        isNew={discoveredModalData.isNew}
        duplicateCpReward={discoveredModalData.duplicateCpReward}
        isLowGraphic={!!gameState.lowGraphicMode}
      />

      <LevelUpModal
        isOpen={levelUpModalData.isOpen}
        newLevel={levelUpModalData.newLevel}
        bonusCash={levelUpModalData.bonusCash}
        bonusCp={levelUpModalData.bonusCp}
        isLowGraphic={!!gameState.lowGraphicMode}
        onClose={() => setLevelUpModalData((p) => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
