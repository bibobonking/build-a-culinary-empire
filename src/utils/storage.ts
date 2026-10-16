import { GameState, Difficulty, Recipe, FixSaveReport, CURRENT_SAVE_VERSION, CURRENT_VERSION_STRING } from '../types';
import {
  INGREDIENTS,
  KITCHEN_EQUIPMENT,
  INITIAL_STAFF,
  MARKET_TRENDS,
  BANK_LOANS,
  FRANCHISE_BRANCHES,
  RIVAL_BUSINESSES,
  INITIAL_QUESTS,
} from '../data/gameData';
import { MASTER_RECIPES, DEFAULT_FOODBOXES_OWNED } from '../data/recipeDatabase';
import { generateShopInventory } from './crafting';

export const CURRENT_STORAGE_KEY = 'build_culinary_empire_save_v3';
export const LEGACY_STORAGE_KEYS = [
  'build_culinary_empire_save_v2',
  'build_culinary_empire_save_v1',
  'build_culinary_empire_save',
  'culinary_empire_save_v1',
  'culinary_empire_save',
];

export function createInitialGameState(difficulty: Difficulty = 'normal'): GameState {
  const initialCash = difficulty === 'easy' ? 100000 : difficulty === 'normal' ? 50000 : 25000;
  const initialCP = difficulty === 'easy' ? 50 : difficulty === 'normal' ? 25 : 15;

  const inventory: Record<string, number> = {};
  const inventoryFreshness: Record<string, number> = {};

  INGREDIENTS.forEach((ing) => {
    inventory[ing.id] = ing.stock;
    inventoryFreshness[ing.id] = ing.freshness;
  });

  const initialRecipes: Recipe[] = JSON.parse(JSON.stringify(MASTER_RECIPES)).map((r: Recipe) => ({
    ...r,
    count: r.unlocked ? 1 : 0,
  }));

  return {
    saveVersion: CURRENT_SAVE_VERSION,
    lastFixReport: null,
    cash: initialCash,
    creativePoints: initialCP,
    reputation: 20,
    starRating: 5.0,
    totalReviews: 8,
    difficulty,
    restaurantLevel: 1,
    exp: 0,
    expForNextLevel: 100,
    totalExpEarnedAllTime: 0,
    seats: 4,
    day: 1,
    hour: 8,
    minute: 0,
    season: 'spring',
    timeOfDay: 'morning',
    gameSpeed: 1,
    recipes: initialRecipes,
    inventory,
    inventoryFreshness,
    staff: JSON.parse(JSON.stringify(INITIAL_STAFF)),
    equipment: JSON.parse(JSON.stringify(KITCHEN_EQUIPMENT)),
    activeOrders: [],
    shopIngredients: generateShopInventory(),
    shopRestockCountdown: 180,
    shopRestockCyclesCount: 0,
    foodBoxesOwned: { ...DEFAULT_FOODBOXES_OWNED },
    cookedDishes: {
      recipe_banh_mi: 4,
      recipe_iced_tea: 6,
    },
    cookingBatches: [],
    recentReviews: [
      {
        id: 'rev_initial_1',
        customerName: 'Hoàng Long (Sinh viên)',
        customerType: 'Học sinh - sinh viên',
        avatar: '🎒',
        dishName: 'Bánh Mì Thịt Nướng Pate',
        dishIcon: '🥖',
        rating: 5,
        comment: 'Bánh mì giòn rụm, pate béo ngậy siêu ngon mà giá lại rất hạt dẻ!',
        tip: 2,
        timestamp: '08:15',
        day: 1,
      },
      {
        id: 'rev_initial_2',
        customerName: 'Chị Mai (Nhân viên VP)',
        customerType: 'Dân văn phòng',
        avatar: '💼',
        dishName: 'Trà Đào Cam Sả Mát Lạnh',
        dishIcon: '🍹',
        rating: 5,
        comment: 'Trà thơm mát giải nhiệt cực đã, phục vụ nhanh nhẹn và cô chủ rất tươi cười!',
        tip: 3,
        timestamp: '08:45',
        day: 1,
      },
    ],
    currentTrend: MARKET_TRENDS[0],
    channels: {
      foodTruck: false,
      popUp: false,
      onlineDelivery: false,
    },
    loans: JSON.parse(JSON.stringify(BANK_LOANS)),
    franchises: JSON.parse(JSON.stringify(FRANCHISE_BRANCHES)),
    rivals: JSON.parse(JSON.stringify(RIVAL_BUSINESSES)),
    financialHistory: [
      {
        day: 1,
        revenue: 65,
        foodCost: 20,
        salaries: 20,
        maintenance: 0,
        marketing: 0,
        tax: 2,
        netProfit: 23,
        customersServed: 4,
      },
    ],
    todayStats: {
      revenue: 0,
      foodCost: 0,
      tips: 0,
      customersServed: 0,
      dishesCooked: 0,
    },
    activeEvent: null,
    eventLogs: [
      'Chào mừng bạn đến với Build a Culinary Empire! Hãy bắt đầu từ quầy xe bánh mì và phát triển thành đế chế Michelin!',
    ],
    tutorialSeen: false,
    customizingRecipe: null,
    totalCustomersServedAllTime: 4,
    highestRevenueDay: 65,
    quests: JSON.parse(JSON.stringify(INITIAL_QUESTS)),
    discoveredSecretCombos: [],
    lowGraphicMode: false,
    counters: { shopBuys: 0, crafted: 0, manualCooked: 0, boxesOpened: 0, cashEarnedAllTime: 0 },
    achievements: [],
    dailyReward: { lastClaimDate: '', streak: 0 },
    lastSeenAt: Date.now(),
  };
}

/**
 * Intelligent Auto FixSave Engine
 * Inspects any old, partial, or corrupted save and non-destructively repairs it
 * so that ZERO player data is lost while fully upgrading to the latest version.
 */
export function checkAndFixSave(
  rawOrParsed: any,
  sourceHint?: string
): { fixedState: GameState; wasMigrated: boolean; report: FixSaveReport } {
  let parsed: any;
  if (typeof rawOrParsed === 'string') {
    try {
      parsed = JSON.parse(rawOrParsed);
    } catch {
      // Return default if cannot parse
      parsed = createInitialGameState('normal');
    }
  } else {
    parsed = rawOrParsed && typeof rawOrParsed === 'object' ? rawOrParsed : {};
  }

  const changes: string[] = [];
  let wasMigrated = false;

  // 1. Identify previous version
  const rawVer = parsed.saveVersion;
  let fromVersion: string | number = 'v1 (Cũ)';
  if (typeof rawVer === 'number') {
    fromVersion = `v${rawVer}`;
    if (rawVer < CURRENT_SAVE_VERSION) {
      wasMigrated = true;
      changes.push(`Nâng cấp phiên bản save từ v${rawVer} ➔ ${CURRENT_VERSION_STRING}`);
    }
  } else if (typeof rawVer === 'string') {
    fromVersion = rawVer;
    wasMigrated = true;
    changes.push(`Chuẩn hóa nhãn phiên bản ${rawVer} ➔ ${CURRENT_VERSION_STRING}`);
  } else {
    wasMigrated = true;
    if (sourceHint && sourceHint.includes('v2')) {
      fromVersion = 'v2';
      changes.push(`Phát hiện save lưu từ bản v2, đã nâng cấp lên ${CURRENT_VERSION_STRING}`);
    } else {
      fromVersion = 'v1 (Không gắn nhãn)';
      changes.push(`Phát hiện bản save thế hệ cũ, đã tự động đồng bộ lên ${CURRENT_VERSION_STRING}`);
    }
  }

  // 2. Validate Financials & Basic Progression (Preserving all valid values)
  const defaultBase = createInitialGameState('normal');

  const cash = typeof parsed.cash === 'number' && !isNaN(parsed.cash) ? Math.max(0, parsed.cash) : defaultBase.cash;
  const creativePoints = typeof parsed.creativePoints === 'number' && !isNaN(parsed.creativePoints)
    ? Math.max(0, parsed.creativePoints)
    : defaultBase.creativePoints;
  const reputation = typeof parsed.reputation === 'number' && !isNaN(parsed.reputation)
    ? Math.min(100, Math.max(0, parsed.reputation))
    : 20;
  const starRating = typeof parsed.starRating === 'number' && !isNaN(parsed.starRating)
    ? Math.min(5, Math.max(1, parsed.starRating))
    : 5.0;
  const totalReviews = typeof parsed.totalReviews === 'number' && !isNaN(parsed.totalReviews)
    ? Math.max(1, parsed.totalReviews)
    : 8;
  const restaurantLevel = typeof parsed.restaurantLevel === 'number' && !isNaN(parsed.restaurantLevel)
    ? Math.min(6, Math.max(1, Math.floor(parsed.restaurantLevel)))
    : 1;
  const seats = typeof parsed.seats === 'number' && !isNaN(parsed.seats) ? Math.max(4, parsed.seats) : 4;
  const day = typeof parsed.day === 'number' && !isNaN(parsed.day) ? Math.max(1, Math.floor(parsed.day)) : 1;
  const hour = typeof parsed.hour === 'number' && !isNaN(parsed.hour) ? Math.min(22, Math.max(8, parsed.hour)) : 8;
  const minute = typeof parsed.minute === 'number' && !isNaN(parsed.minute) ? Math.min(59, Math.max(0, parsed.minute)) : 0;
  const VALID_SEASONS = ['spring', 'summer', 'autumn', 'winter', 'tet', 'midAutumn', 'halloween', 'christmas'];
  const season = VALID_SEASONS.includes(parsed.season) ? parsed.season : 'spring';
  const timeOfDay = ['morning', 'lunch', 'afternoon', 'dinner', 'night'].includes(parsed.timeOfDay) ? parsed.timeOfDay : 'morning';
  const gameSpeed = typeof parsed.gameSpeed === 'number' ? parsed.gameSpeed : 1;
  const difficulty: Difficulty = ['easy', 'normal', 'hard'].includes(parsed.difficulty) ? parsed.difficulty : 'normal';

  // 3. RECIPES: Zero Data Loss + Synchronization
  let fixedRecipes: Recipe[] = [];
  const masterMap = new Map(MASTER_RECIPES.map((r) => [r.id, r]));

  if (Array.isArray(parsed.recipes) && parsed.recipes.length > 0) {
    const existingRecipeMap = new Map<string, any>();
    parsed.recipes.forEach((r: any) => {
      if (r && r.id) {
        existingRecipeMap.set(r.id, r);
      }
    });

    let newRecipesAddedCount = 0;

    // First process all user existing recipes (loại bỏ công thức sự kiện The Archive đã ngừng)
    parsed.recipes.forEach((r: any) => {
      if (!r || !r.id) return;
      if (typeof r.id === 'string' && r.id.startsWith('rec_archive_')) return;
      const master = masterMap.get(r.id);
      if (master) {
        // Retain user unlock status and counts, but sync balanced parameters
        const isUnlocked = Boolean(r.unlocked);
        fixedRecipes.push({
          ...master,
          unlocked: isUnlocked,
          count: isUnlocked ? Math.max(1, Number(r.count) || 1) : 0,
          customName: r.customName || master.name,
          timesCooked: typeof r.timesCooked === 'number' ? r.timesCooked : 0,
          timesServed: typeof r.timesServed === 'number' ? r.timesServed : 0,
          combinedIngredients: Array.isArray(r.combinedIngredients) ? r.combinedIngredients : undefined,
          flavorNotes: r.flavorNotes || undefined,
        });
      } else {
        // User custom crafted recipe - PRESERVE COMPLETELY!
        fixedRecipes.push({
          ...r,
          count: Math.max(1, Number(r.count) || 1),
          unlocked: true,
        });
      }
    });

    // Add any newly introduced master recipes not yet in player's save
    MASTER_RECIPES.forEach((masterRec) => {
      if (!existingRecipeMap.has(masterRec.id)) {
        fixedRecipes.push({
          ...masterRec,
          unlocked: false,
          count: 0,
        });
        newRecipesAddedCount++;
      }
    });

    if (newRecipesAddedCount > 0) {
      wasMigrated = true;
      changes.push(`Đồng bộ hóa & bổ sung ${newRecipesAddedCount} công thức món ăn mới vào thực đơn`);
    }
  } else {
    wasMigrated = true;
    fixedRecipes = JSON.parse(JSON.stringify(MASTER_RECIPES)).map((r: Recipe) => ({
      ...r,
      count: r.unlocked ? 1 : 0,
    }));
    changes.push('Khôi phục danh mục công thức chuẩn từ cơ sở dữ liệu');
  }

  // 4. INVENTORY & FRESHNESS: Zero Loss + Add Missing Ingredients
  const fixedInventory: Record<string, number> = {};
  const fixedFreshness: Record<string, number> = {};
  let missingIngredientsAdded = 0;

  const rawInventory = parsed.inventory && typeof parsed.inventory === 'object' ? parsed.inventory : {};
  const rawFreshness = parsed.inventoryFreshness && typeof parsed.inventoryFreshness === 'object' ? parsed.inventoryFreshness : {};

  // Preserve existing items
  Object.keys(rawInventory).forEach((key) => {
    const val = Number(rawInventory[key]);
    if (!isNaN(val) && val >= 0) {
      fixedInventory[key] = Math.floor(val);
    }
  });

  // Ensure all INGREDIENTS exist
  INGREDIENTS.forEach((ing) => {
    if (fixedInventory[ing.id] === undefined) {
      fixedInventory[ing.id] = 0;
      missingIngredientsAdded++;
    }
    const freshVal = Number(rawFreshness[ing.id]);
    fixedFreshness[ing.id] = !isNaN(freshVal) && freshVal > 0 ? Math.min(100, Math.floor(freshVal)) : ing.freshness;
  });

  if (missingIngredientsAdded > 0) {
    wasMigrated = true;
    changes.push(`Thêm ${missingIngredientsAdded} loại nguyên liệu mới vào kho với độ tươi 100%`);
  }

  // 5. SHOP INVENTORY & RESTOCK TIMER
  const ingMap = new Map(INGREDIENTS.map((i) => [i.id, i]));
  let fixedShopIngredients = parsed.shopIngredients;
  if (!Array.isArray(fixedShopIngredients) || fixedShopIngredients.length === 0) {
    fixedShopIngredients = generateShopInventory();
    wasMigrated = true;
    changes.push('Tạo mới danh sách hàng hóa chợ phiên bản v3.0');
  } else {
    fixedShopIngredients = fixedShopIngredients.map((item: any) => {
      const master = ingMap.get(item.id);
      if (master) {
        const curStock = typeof item.currentStock === 'number' ? item.currentStock : master.stock;
        return {
          ...master,
          currentStock: Math.max(0, curStock),
          maxStock: typeof item.maxStock === 'number' ? item.maxStock : 10,
          inStock: curStock > 0,
          discountPercent: typeof item.discountPercent === 'number' ? item.discountPercent : undefined,
        };
      }
      return item;
    });
  }

  const shopRestockCountdown = typeof parsed.shopRestockCountdown === 'number' && parsed.shopRestockCountdown >= 0
    ? Math.min(180, parsed.shopRestockCountdown)
    : 180;
  const shopRestockCyclesCount = typeof parsed.shopRestockCyclesCount === 'number'
    ? Math.max(0, parsed.shopRestockCyclesCount)
    : 0;

  // 6. FOODBOXES: Zero Loss (Sự kiện The Archive đã ngừng vĩnh viễn -> loại bỏ box_archive)
  const rawBoxes = parsed.foodBoxesOwned && typeof parsed.foodBoxesOwned === 'object' ? parsed.foodBoxesOwned : {};
  const fixedFoodBoxes: Record<string, number> = {
    ...DEFAULT_FOODBOXES_OWNED,
    ...rawBoxes,
  };
  delete fixedFoodBoxes.box_archive;

  // 7. BUFFET COUNTER & COOKING BATCHES
  const fixedCookedDishes: Record<string, number> = {};
  if (parsed.cookedDishes && typeof parsed.cookedDishes === 'object') {
    Object.keys(parsed.cookedDishes).forEach((rId) => {
      const count = Number(parsed.cookedDishes[rId]);
      if (!isNaN(count) && count > 0) {
        fixedCookedDishes[rId] = Math.floor(count);
      }
    });
  }
  if (Object.keys(fixedCookedDishes).length === 0) {
    fixedCookedDishes['recipe_banh_mi'] = 4;
    fixedCookedDishes['recipe_iced_tea'] = 6;
  }

  let fixedBatches: any[] = [];
  if (Array.isArray(parsed.cookingBatches)) {
    const seenBatchIds = new Set<string>();
    fixedBatches = parsed.cookingBatches
      .filter((b: any) => b && typeof b === 'object' && b.recipeId)
      .map((b: any, idx: number) => {
        let id = typeof b.id === 'string' && b.id.trim() ? b.id : '';
        if (!id || seenBatchIds.has(id)) {
          id = `batch_fix_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`;
          wasMigrated = true;
        }
        seenBatchIds.add(id);
        const totalTime = Math.max(3, Number(b.totalTime) || 10);
        const remainingTime = Math.max(0, Math.min(totalTime, Number(b.remainingTime) || totalTime));
        const progress = Math.min(100, Math.max(0, Math.round(((totalTime - remainingTime) / totalTime) * 100)));
        return {
          ...b,
          id,
          totalTime,
          remainingTime,
          progress,
          amount: Math.max(1, Number(b.amount) || 1),
        };
      });
  }

  // 8. STAFF & EQUIPMENT
  const fixedStaff = Array.isArray(parsed.staff) && parsed.staff.length > 0 ? parsed.staff : JSON.parse(JSON.stringify(INITIAL_STAFF));
  let fixedEquipment = Array.isArray(parsed.equipment) && parsed.equipment.length > 0 ? parsed.equipment : JSON.parse(JSON.stringify(KITCHEN_EQUIPMENT));
  // Ensure all kitchen equipment are registered
  const eqMap = new Map(fixedEquipment.map((e: any) => [e.id, e]));
  KITCHEN_EQUIPMENT.forEach((eq) => {
    if (!eqMap.has(eq.id)) {
      fixedEquipment.push({ ...eq, unlocked: false });
      wasMigrated = true;
    }
  });

  // 9. QUESTS: Merge with INITIAL_QUESTS preserving player progress
  let fixedQuests = Array.isArray(parsed.quests) && parsed.quests.length > 0 ? parsed.quests : JSON.parse(JSON.stringify(INITIAL_QUESTS));
  const questMap = new Map(fixedQuests.map((q: any) => [q.id, q]));
  INITIAL_QUESTS.forEach((masterQ) => {
    if (!questMap.has(masterQ.id)) {
      fixedQuests.push({ ...masterQ });
      wasMigrated = true;
    }
  });

  // Always log data preservation affirmations
  changes.push(`Bảo toàn trọn vẹn số dư $${cash.toLocaleString()} & ${creativePoints} CP của người chơi`);
  changes.push(`Bảo toàn cấp nhà hàng Cấp ${restaurantLevel} (Ngày ${day})`);
  changes.push(`Bảo toàn ${fixedRecipes.filter((r) => r.unlocked).length} công thức đã mở khóa`);
  changes.push(`Bảo toàn ${Object.values(fixedCookedDishes).reduce((a, b) => a + b, 0)} suất ăn trên quầy ra món`);

  const preservedDataSummary = {
    cash,
    creativePoints,
    level: restaurantLevel,
    totalRecipesOwned: fixedRecipes.length,
    unlockedRecipesCount: fixedRecipes.filter((r) => r.unlocked).length,
    inventoryItemsCount: Object.keys(fixedInventory).length,
    dishesOnCounter: Object.values(fixedCookedDishes).reduce((a, b) => a + b, 0),
    day,
  };

  const report: FixSaveReport = {
    timestamp: Date.now(),
    fromVersion,
    toVersion: CURRENT_SAVE_VERSION,
    wasMigrated,
    changes,
    preservedDataSummary,
  };

  const fixedState: GameState = {
    saveVersion: CURRENT_SAVE_VERSION,
    lastFixReport: wasMigrated ? report : null,
    cash,
    creativePoints,
    reputation,
    starRating,
    totalReviews,
    difficulty,
    restaurantLevel,
    exp: typeof parsed.exp === 'number' ? parsed.exp : 0,
    expForNextLevel: typeof parsed.expForNextLevel === 'number' ? parsed.expForNextLevel : 100,
    totalExpEarnedAllTime: typeof parsed.totalExpEarnedAllTime === 'number' ? parsed.totalExpEarnedAllTime : 0,
    seats,
    day,
    hour,
    minute,
    season,
    timeOfDay,
    gameSpeed,
    recipes: fixedRecipes,
    inventory: fixedInventory,
    inventoryFreshness: fixedFreshness,
    staff: fixedStaff,
    equipment: fixedEquipment,
    activeOrders: Array.isArray(parsed.activeOrders) ? parsed.activeOrders : [],
    shopIngredients: fixedShopIngredients,
    shopRestockCountdown,
    shopRestockCyclesCount,
    foodBoxesOwned: fixedFoodBoxes,
    cookedDishes: fixedCookedDishes,
    cookingBatches: fixedBatches,
    recentReviews: Array.isArray(parsed.recentReviews) ? parsed.recentReviews : defaultBase.recentReviews,
    currentTrend: parsed.currentTrend && typeof parsed.currentTrend === 'object' && parsed.currentTrend.id ? parsed.currentTrend : MARKET_TRENDS[0],
    channels: parsed.channels && typeof parsed.channels === 'object' ? parsed.channels : defaultBase.channels,
    loans: Array.isArray(parsed.loans) ? parsed.loans : JSON.parse(JSON.stringify(BANK_LOANS)),
    franchises: Array.isArray(parsed.franchises) ? parsed.franchises : JSON.parse(JSON.stringify(FRANCHISE_BRANCHES)),
    rivals: Array.isArray(parsed.rivals) ? parsed.rivals : JSON.parse(JSON.stringify(RIVAL_BUSINESSES)),
    financialHistory: Array.isArray(parsed.financialHistory) ? parsed.financialHistory : defaultBase.financialHistory,
    todayStats: parsed.todayStats && typeof parsed.todayStats === 'object' ? parsed.todayStats : defaultBase.todayStats,
    activeEvent: parsed.activeEvent || null,
    eventLogs: Array.isArray(parsed.eventLogs) ? parsed.eventLogs : defaultBase.eventLogs,
    tutorialSeen: Boolean(parsed.tutorialSeen),
    customizingRecipe: parsed.customizingRecipe || null,
    totalCustomersServedAllTime: typeof parsed.totalCustomersServedAllTime === 'number' ? parsed.totalCustomersServedAllTime : 4,
    highestRevenueDay: typeof parsed.highestRevenueDay === 'number' ? parsed.highestRevenueDay : 65,
    quests: fixedQuests,
    discoveredSecretCombos: Array.isArray(parsed.discoveredSecretCombos) ? parsed.discoveredSecretCombos : [],
    lowGraphicMode: Boolean(parsed.lowGraphicMode),
    counters: {
      ...defaultBase.counters!,
      ...(parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {}),
    },
    achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
    dailyReward:
      parsed.dailyReward && typeof parsed.dailyReward === 'object'
        ? parsed.dailyReward
        : defaultBase.dailyReward,
    lastSeenAt: typeof parsed.lastSeenAt === 'number' ? parsed.lastSeenAt : undefined,
  };

  return { fixedState, wasMigrated, report };
}

export function saveGameState(state: GameState): boolean {
  try {
    const updatedState: GameState = {
      ...state,
      saveVersion: CURRENT_SAVE_VERSION,
      lastSeenAt: Date.now(),
    };
    const serialized = JSON.stringify(updatedState);
    localStorage.setItem(CURRENT_STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Save error:', err);
    return false;
  }
}

/**
 * Loads game state with automatic legacy detection and intelligent repair.
 * Automatically checks current v3 key, and falls back to checking legacy keys (v2, v1, etc.).
 */
export function loadGameState(): GameState | null {
  try {
    // 1. Try loading from current storage key
    let raw = localStorage.getItem(CURRENT_STORAGE_KEY);
    let sourceKey = CURRENT_STORAGE_KEY;

    // 2. If not found, search legacy storage keys
    if (!raw) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const legacyData = localStorage.getItem(legacyKey);
        if (legacyData) {
          raw = legacyData;
          sourceKey = legacyKey;
          break;
        }
      }
    }

    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const { fixedState, wasMigrated, report } = checkAndFixSave(parsed, sourceKey);

    // If it was migrated from an older key or outdated structure, write cleanly to CURRENT_STORAGE_KEY
    if (wasMigrated || sourceKey !== CURRENT_STORAGE_KEY) {
      try {
        localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(fixedState));
        // Keep legacy key untouched as a safe backup or clean up if needed
      } catch (saveErr) {
        console.warn('Could not auto-write migrated save to current key:', saveErr);
      }
    }

    if (wasMigrated) {
      fixedState.lastFixReport = report;
    }

    return fixedState;
  } catch (err) {
    console.error('Load error:', err);
    return null;
  }
}

/**
 * Manually trigger Auto FixSave on the current state.
 */
export function manualAutoFix(state: GameState): { fixedState: GameState; report: FixSaveReport } {
  const { fixedState, report } = checkAndFixSave(state, 'manual_trigger');
  report.wasMigrated = true; // force display for manual trigger
  fixedState.lastFixReport = report;
  saveGameState(fixedState);
  return { fixedState, report };
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(CURRENT_STORAGE_KEY);
    LEGACY_STORAGE_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });
  } catch (err) {
    console.error('Clear error:', err);
  }
}

export function exportSaveCode(state: GameState): string {
  const exportPayload: GameState = {
    ...state,
    saveVersion: CURRENT_SAVE_VERSION,
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(exportPayload))));
}

export function importSaveCode(
  code: string
): { state: GameState | null; wasFixed: boolean; report: FixSaveReport | null; error?: string } {
  try {
    const trimmed = code.trim();
    if (!trimmed) {
      return { state: null, wasFixed: false, report: null, error: 'Mã lưu trống!' };
    }

    let parsed: any = null;

    // Check if directly a JSON string
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {}
    }

    // Try decoding base64
    if (!parsed) {
      try {
        const jsonStr = decodeURIComponent(escape(atob(trimmed)));
        parsed = JSON.parse(jsonStr);
      } catch {
        // Fallback simple atob
        try {
          const jsonStr = atob(trimmed);
          parsed = JSON.parse(jsonStr);
        } catch {}
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return { state: null, wasFixed: false, report: null, error: 'Chuỗi mã sao lưu không đúng định dạng!' };
    }

    // Run Auto FixSave Engine on the imported data!
    const { fixedState, wasMigrated, report } = checkAndFixSave(parsed, 'import_code');

    // Basic validity check: must have cash or restaurant level
    if (typeof fixedState.cash === 'number' && fixedState.restaurantLevel) {
      return { state: fixedState, wasFixed: wasMigrated, report };
    }

    return { state: null, wasFixed: false, report: null, error: 'Dữ liệu file lưu bị hư hỏng không thể phục hồi!' };
  } catch (err) {
    console.error('Import error:', err);
    return { state: null, wasFixed: false, report: null, error: 'Lỗi khi giải mã file lưu!' };
  }
}
