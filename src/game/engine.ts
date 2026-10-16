import type { GameState, Order, Recipe, CookingBatch, OfflineReport, GameCounters } from '../types';
import {
  CUSTOMER_ARCHETYPES,
  RANDOM_EVENTS,
  MARKET_TRENDS,
  RESTAURANT_TIERS,
  BANK_LOANS,
  SEASON_CYCLE,
  SEASONAL_EVENTS,
} from '../data/gameData';
import { generateShopInventory } from '../utils/crafting';
import { sound } from '../utils/audio';
import { fx } from '../utils/fx';
import { ACHIEVEMENTS } from './achievements';

export const bump = (
  c: GameCounters | undefined,
  key: keyof GameCounters,
  n = 1
): GameCounters => ({ ...DEFAULT_COUNTERS, ...c, [key]: ((c && c[key]) || 0) + n });

export const DEFAULT_COUNTERS: GameCounters = {
  shopBuys: 0,
  crafted: 0,
  manualCooked: 0,
  boxesOpened: 0,
  cashEarnedAllTime: 0,
};

/** Once per real second: shop restock, cooking batches. */
export function tickSecond(prev: GameState): GameState {
    let nextRestockCountdown = prev.shopRestockCountdown - 1;
    let nextShopIngredients = prev.shopIngredients;
    let nextCyclesCount = prev.shopRestockCyclesCount;

    // Trigger 3-Minute (180s) Restock
    if (nextRestockCountdown <= 0) {
      nextRestockCountdown = 180;
      nextCyclesCount += 1;
      nextShopIngredients = generateShopInventory();
      sound.playCookSizzle();
    }

    // Process in-flight cooking batches
    const nextCookingBatches: CookingBatch[] = [];
    const nextCookedDishes = { ...prev.cookedDishes };
    let anyBatchFinished = false;

    for (const batch of prev.cookingBatches) {
      const newRemaining = batch.remainingTime - 1;
      const nextProgress = Math.min(
        100,
        Math.round(((batch.totalTime - newRemaining) / batch.totalTime) * 100)
      );

      if (newRemaining <= 0) {
        // Batch complete -> add cooked plates to serving buffet
        anyBatchFinished = true;
        nextCookedDishes[batch.recipeId] =
          (nextCookedDishes[batch.recipeId] || 0) + batch.amount;
      } else {
        nextCookingBatches.push({
          ...batch,
          remainingTime: newRemaining,
          progress: nextProgress,
        });
      }
    }

    if (anyBatchFinished) {
      sound.playCookSizzle();
    }

    return {
      ...prev,
      shopRestockCountdown: nextRestockCountdown,
      shopIngredients: nextShopIngredients,
      shopRestockCyclesCount: nextCyclesCount,
      cookingBatches: nextCookingBatches,
      cookedDishes: nextCookedDishes,
      eventLogs: prev.eventLogs,
    };
}

/** One in-game tick (5 in-game minutes): clock, customers, payments, auto-chef. */
export function tickGame(prev: GameState): GameState {
    let { hour, minute, day, season, timeOfDay } = prev;

    // Advance clock by 5 minutes per tick
    minute += 5;
    if (minute >= 60) {
      minute = 0;
      hour += 1;
    }

    // Time of day classification
    if (hour >= 6 && hour < 11) timeOfDay = 'morning';
    else if (hour >= 11 && hour < 14) timeOfDay = 'lunch';
    else if (hour >= 14 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'dinner';
    else timeOfDay = 'night';

    let nextDay = day;
    let nextCash = prev.cash;
    let nextCreativePoints = prev.creativePoints;
    const nextEventLogs = [...prev.eventLogs];
    const nextFinancialHistory = [...prev.financialHistory];

    // End of day (close at 22:00, reopen at 08:00 next day)
    if (hour >= 22) {
      hour = 8;
      minute = 0;
      nextDay += 1;

      // Season cycle every 15 days (8 seasons incl. festivals: 120-day full cycle)
      const seasonIdx = Math.floor((nextDay - 1) / 15) % SEASON_CYCLE.length;
      const newSeason = SEASON_CYCLE[seasonIdx];
      if (newSeason !== season) {
        const evt = SEASONAL_EVENTS[newSeason];
        nextEventLogs.unshift(
          `${evt.icon} Mùa mới: **${evt.name}** — ${evt.description}`
        );
      }
      season = newSeason;

      // Pay staff salaries
      const dailySalaries = prev.staff.reduce((acc, s) => acc + s.salary, 0);

      // Passive income from owned franchises
      const franchiseIncome = prev.franchises
        .filter((f) => f.owned)
        .reduce((acc, f) => acc + f.dailyRoyalty, 0);
      nextCash += franchiseIncome;

      // Daily loan payment deductions
      let loanDeductions = 0;
      const updatedLoans = prev.loans.map((l) => {
        if (l.taken && l.remainingDays > 0) {
          loanDeductions += l.dailyInterest;
          const rem = l.remainingDays - 1;
          if (rem <= 0) {
            // Fully repaid -> loan becomes available again
            const orig = BANK_LOANS.find((b) => b.id === l.id);
            nextEventLogs.unshift(`🏦 Đã tất toán khoản vay "${l.name}"!`);
            return { ...l, taken: false, remainingDays: orig ? orig.remainingDays : 30 };
          }
          return { ...l, remainingDays: rem };
        }
        return l;
      });

      // Debt Safeguard: Keep cash positive or at minimum $0
      const totalDailyExpenses = dailySalaries + loanDeductions;
      if (nextCash < totalDailyExpenses) {
        nextCash = Math.max(0, nextCash - totalDailyExpenses);
        nextEventLogs.unshift(
          `⚠️ [Bảo Hộ Tài Chính] Quỹ tiền mặt không đủ trả toàn bộ lương và nợ. Phần thiếu hụt được gia hạn tự động!`
        );
      } else {
        nextCash -= totalDailyExpenses;
      }

      // Calculate daily net profit
      const dailyProfit =
        prev.todayStats.revenue +
        prev.todayStats.tips +
        franchiseIncome -
        prev.todayStats.foodCost -
        dailySalaries -
        loanDeductions;

      nextFinancialHistory.unshift({
        day: prev.day,
        revenue: prev.todayStats.revenue,
        foodCost: prev.todayStats.foodCost,
        salaries: dailySalaries,
        maintenance: 0,
        marketing: 0,
        tax: Math.round(prev.todayStats.revenue * 0.08),
        netProfit: dailyProfit,
        customersServed: prev.todayStats.customersServed,
      });

      if (nextFinancialHistory.length > 14) nextFinancialHistory.pop();

      nextEventLogs.unshift(
        `Kết thúc Ngày ${prev.day}: Phục vụ ${prev.todayStats.customersServed} khách, doanh thu $${prev.todayStats.revenue}, lợi nhuận $${dailyProfit}.`
      );

      // Staff fatigue recovery during night
      const refreshedStaff = prev.staff.map((st) => ({
        ...st,
        fatigue: Math.max(0, st.fatigue - 35),
        morale: Math.min(100, st.morale + 5),
        status: st.status === 'resting' ? 'working' : st.status,
      }));

      // Trend duration decrement
      let updatedTrend = { ...prev.currentTrend };
      if (updatedTrend.daysRemaining <= 1) {
        const nextTrendIndex = (nextDay % MARKET_TRENDS.length);
        updatedTrend = MARKET_TRENDS[nextTrendIndex];
        nextEventLogs.unshift(`📈 Xu Hướng Thị Trường Mới: "${updatedTrend.name}"!`);
      } else {
        updatedTrend.daysRemaining -= 1;
      }

      // Random event trigger chance
      let triggeredEvent = prev.activeEvent;
      if (!triggeredEvent && Math.random() < 0.35) {
        const randomEvt = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
        triggeredEvent = randomEvt;
      }

      return {
        ...prev,
        day: nextDay,
        hour,
        minute,
        season,
        timeOfDay,
        cash: Math.round(nextCash * 10) / 10,
        staff: refreshedStaff,
        loans: updatedLoans,
        currentTrend: updatedTrend,
        financialHistory: nextFinancialHistory,
        eventLogs: nextEventLogs.slice(0, 30),
        todayStats: {
          revenue: 0,
          foodCost: 0,
          tips: 0,
          customersServed: 0,
          dishesCooked: 0,
        },
        activeEvent: triggeredEvent,
      };
    }

    // --- CUSTOMER DINING & BUFFET COUNTER SERVING LOOP ---
    const activeChefs = prev.staff.filter((s) => s.role === 'chef' && s.status === 'working');
    const activeServers = prev.staff.filter((s) => s.role === 'server' && s.status === 'working');

    // Speed multipliers
    const totalCookBonus = prev.equipment
      .filter((e) => e.unlocked)
      .reduce((sum, e) => sum + e.speedBonus, 0);
    const chefSkillAverage =
      activeChefs.length > 0
        ? activeChefs.reduce((s, c) => s + c.speed, 0) / activeChefs.length
        : 50;
    const cookingRate = 12 + (chefSkillAverage * 0.15) + (totalCookBonus * 0.2);

    let updatedCash = prev.cash;
    let updatedTodayRevenue = prev.todayStats.revenue;
    let updatedTodayTips = prev.todayStats.tips;
    let updatedTodayServed = prev.todayStats.customersServed;
    let updatedTotalServedAllTime = prev.totalCustomersServedAllTime;
    let updatedReputation = prev.reputation;
    let paidThisTick = 0;
    let updatedStarRating = prev.starRating;
    let updatedTotalReviews = prev.totalReviews;
    const newReviews = [...prev.recentReviews];
    const nextCookedDishes = { ...prev.cookedDishes };
    const nextActiveOrders: Order[] = [];

    for (const order of prev.activeOrders) {
      const currentProgress = order.progress ?? 0;
      if (order.status === 'cooking') {
        const nextProgress = Math.min(100, currentProgress + cookingRate);
        if (nextProgress >= 100) {
          sound.playCookSizzle();
          nextActiveOrders.push({
            ...order,
            progress: 100,
            status: 'eating',
            remainingTime: 5,
          });
        } else {
          nextActiveOrders.push({ ...order, progress: nextProgress });
        }
      } else if (order.status === 'eating') {
        const currentRemaining = order.remainingTime ?? 3;
        const nextRemaining = currentRemaining - 1;
        if (nextRemaining <= 0) {
          // Finished meal -> customer pays!
          sound.playCashRegister();
          const payment = order.sellPrice;
          const tip = Math.random() < 0.65 ? Math.round(order.sellPrice * 0.15) : 0;

          updatedCash += payment + tip;
          paidThisTick += payment + tip;
          updatedTodayRevenue += payment;
          updatedTodayTips += tip;
          updatedTodayServed += 1;
          updatedTotalServedAllTime += 1;

          const ratingStars = Math.min(5, Math.max(4, Math.round(4.4 + Math.random() * 0.8)));

          // Moving average reviews
          updatedTotalReviews += 1;
          updatedStarRating =
            (updatedStarRating * (updatedTotalReviews - 1) + ratingStars) / updatedTotalReviews;
          updatedReputation = Math.min(100, updatedReputation + (ratingStars >= 4 ? 1 : 0));

          const comments = [
            'Món ăn thơm nức mũi, chuẩn vị hảo hạng! ⭐⭐⭐⭐⭐',
            'Quầy phục vụ lên món nhanh như chớp, rất hài lòng!',
            'Hương vị tuyệt hảo khó quên, xứng đáng đẳng cấp Michelin!',
            'Không gian ấm cúng, đồ ăn siêu ngon miệng!',
            'Tuyệt đỉnh mỹ vị, nhất định sẽ dẫn bạn bè ghé lại!',
          ];

          newReviews.unshift({
            id: `rev_${Date.now()}_${Math.random()}`,
            customerName: order.customerName,
            customerType: order.customerType,
            avatar: order.customerAvatar,
            dishName: order.recipeName,
            dishIcon: order.recipeIcon,
            rating: ratingStars,
            comment: comments[Math.floor(Math.random() * comments.length)],
            tip,
            timestamp: `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`,
            day: prev.day,
          });

          if (newReviews.length > 20) newReviews.pop();
        } else {
          nextActiveOrders.push({ ...order, remainingTime: nextRemaining });
        }
      }
    }

    // --- CUSTOMER ARRIVAL LOGIC ---
    // Mùa hiện tại apply boost: tỉ lệ khách & doanh thu
    const seasonDef = SEASONAL_EVENTS[prev.season] || SEASONAL_EVENTS.spring;
    const freeSeats = Math.max(0, prev.seats - nextActiveOrders.length);
    const currentTier =
      RESTAURANT_TIERS.find((t) => t.level === prev.restaurantLevel) || RESTAURANT_TIERS[0];
    const visitorChance = Math.min(
      1,
      ((prev.reputation / 100) * 0.5 +
        (currentTier.baseVisitors / 100) * 0.4 +
        0.2 +
        (prev.channels.onlineDelivery ? 0.25 : 0)) *
        seasonDef.visitorMultiplier
    );
    // Spawn tới tối đa 3 khách mỗi tick khi còn trống bàn (không bị "nguội" khách)
    const maxNewArrivals = Math.min(freeSeats, 1 + Math.floor(currentTier.baseVisitors / 40));

    for (let arrival = 0; arrival < maxNewArrivals; arrival++) {
      if (Math.random() >= visitorChance) break;
      const unlockedRecipes = prev.recipes.filter((r) => r.unlocked);
      if (unlockedRecipes.length === 0) break;
      // First check if we have any ready cooked dish on the heated serving counter!
      const dishesOnCounter = unlockedRecipes.filter(
        (r) => (nextCookedDishes[r.id] || 0) > 0
      );

      let chosenRecipe: Recipe;
      let isInstantFromCounter = false;

      if (dishesOnCounter.length > 0 && Math.random() < 0.85) {
        chosenRecipe = dishesOnCounter[Math.floor(Math.random() * dishesOnCounter.length)];
        nextCookedDishes[chosenRecipe.id] -= 1;
        isInstantFromCounter = true;
      } else {
        chosenRecipe = unlockedRecipes[Math.floor(Math.random() * unlockedRecipes.length)];
      }

      const chosenArchetype =
        CUSTOMER_ARCHETYPES[Math.floor(Math.random() * CUSTOMER_ARCHETYPES.length)];

      const isTrendBoosted = prev.currentTrend.boostCategory === chosenRecipe.category;
      const finalSellPrice = Math.round(
        chosenRecipe.sellPrice *
          (isTrendBoosted ? prev.currentTrend.revenueMultiplier : 1) *
          seasonDef.revenueMultiplier
      );

      nextActiveOrders.push({
        id: `ord_${Date.now()}_${Math.random()}_${arrival}`,
        tableNumber: nextActiveOrders.length + 1,
        customerName: chosenArchetype.name,
        customerType: chosenArchetype.name,
        customerAvatar: chosenArchetype.icon,
        recipeId: chosenRecipe.id,
        recipeName: chosenRecipe.customName || chosenRecipe.name,
        recipeIcon: chosenRecipe.icon,
        sellPrice: finalSellPrice,
        status: isInstantFromCounter ? 'eating' : 'cooking',
        progress: isInstantFromCounter ? 100 : 0,
        totalTime: chosenRecipe.cookTime,
        remainingTime: isInstantFromCounter ? 5 : chosenRecipe.cookTime,
        satisfaction: 100,
      });
    }

    // Auto-Chef automated cooking: If counter is empty, idle chefs automatically prep unlocked dishes!
    const nextCookingBatches = [...prev.cookingBatches];
    if (activeChefs.length > 0 && nextCookingBatches.length < currentTier.cookingSlots) {
      const unlocked = prev.recipes.filter((r) => r.unlocked);
      if (unlocked.length > 0) {
        // Pick recipe with lowest stock on counter
        const lowestDish = unlocked.reduce((min, cur) =>
          (nextCookedDishes[cur.id] || 0) < (nextCookedDishes[min.id] || 0) ? cur : min
        );

        if ((nextCookedDishes[lowestDish.id] || 0) < 5) {
          const alreadyCooking = nextCookingBatches.some((b) => b.recipeId === lowestDish.id);
          if (!alreadyCooking) {
            nextCookingBatches.push({
              id: `batch_auto_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              recipeId: lowestDish.id,
              recipeName: lowestDish.name,
              recipeIcon: lowestDish.icon,
              amount: 2,
              totalTime: Math.max(3, Math.round(lowestDish.cookTime * 0.7)),
              remainingTime: Math.max(3, Math.round(lowestDish.cookTime * 0.7)),
              progress: 0,
              isManual: false,
            });
          }
        }
      }
    }

    // Periodic Creative Points generation (every 15 ticks = +1 CP)
    if (minute % 15 === 0) {
      nextCreativePoints += 1;
    }

    if (paidThisTick > 0) fx.cash(paidThisTick);

    return {
      ...prev,
      counters: {
        ...DEFAULT_COUNTERS,
        ...prev.counters,
        cashEarnedAllTime: (prev.counters?.cashEarnedAllTime || 0) + paidThisTick,
      },
      hour,
      minute,
      cash: Math.round(updatedCash * 10) / 10,
      creativePoints: nextCreativePoints,
      reputation: updatedReputation,
      starRating: Math.round(updatedStarRating * 10) / 10,
      totalReviews: updatedTotalReviews,
      activeOrders: nextActiveOrders,
      cookedDishes: nextCookedDishes,
      cookingBatches: nextCookingBatches,
      recentReviews: newReviews,
      totalCustomersServedAllTime: updatedTotalServedAllTime,
      todayStats: {
        revenue: updatedTodayRevenue,
        foodCost: prev.todayStats.foodCost,
        tips: updatedTodayTips,
        customersServed: updatedTodayServed,
        dishesCooked: prev.todayStats.dishesCooked || 0,
      },
    };
}

// ---------------------------------------------------------------------------
// Progress: quests + achievements (run once per second, returns same ref if unchanged)
// ---------------------------------------------------------------------------


function questMetric(id: string, s: GameState): number | null {
  const c = s.counters || DEFAULT_COUNTERS;
  switch (id) {
    case 'q_buy_shop': return c.shopBuys;
    case 'q_craft_first_dish': return c.crafted;
    case 'q_manual_cook_5': return c.manualCooked;
    case 'q_serve_10_customers': return Math.max(0, s.totalCustomersServedAllTime - 4);
    case 'q_open_foodbox': return c.boxesOpened;
    case 'q_unlock_epic_or_higher':
      return s.recipes.filter((r) => r.unlocked && r.rarity !== 'Rare').length;
    case 'q_upgrade_tier_2': return s.restaurantLevel >= 2 ? 1 : 0;
    case 'q_reach_1000_cash': return s.cash;
    case 'q_hire_3_staff': return s.staff.length;
    case 'q_expand_seats_12': return s.seats;
    case 'q_buy_equipment_1': return s.equipment.filter((e) => e.unlocked).length;
    case 'q_serve_100_customers': return s.totalCustomersServedAllTime;
    case 'q_craft_10_times': return c.crafted;
    default: return null;
  }
}

export function applyProgress(prev: GameState): GameState {
  let next = prev;

  // Quests
  let questsChanged = false;
  const quests = prev.quests.map((q) => {
    if (q.completed) return q;
    const m = questMetric(q.id, prev);
    if (m === null) return q;
    const progress = Math.min(q.target, Math.floor(m));
    const completed = progress >= q.target;
    if (progress === q.progress && completed === q.completed) return q;
    questsChanged = true;
    if (completed) {
      fx.toast({ kind: 'success', icon: q.icon, title: 'Nhiệm vụ hoàn thành!', text: q.title });
      sound.playBellDing();
    }
    return { ...q, progress, completed };
  });
  if (questsChanged) next = { ...next, quests };

  // Achievements
  const have = new Set(prev.achievements || []);
  let gainCash = 0;
  let gainCp = 0;
  const newlyUnlocked: string[] = [];
  const logs: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (have.has(a.id)) continue;
    if (a.metric(prev) >= a.target) {
      have.add(a.id);
      newlyUnlocked.push(a.id);
      gainCash += a.rewardCash;
      gainCp += a.rewardCp;
      fx.toast({
        kind: 'achievement',
        icon: a.icon,
        title: `Thành tựu: ${a.title}`,
        text: `+$${a.rewardCash.toLocaleString()} • +${a.rewardCp} CP`,
      });
      logs.push(`🏅 Thành tựu "${a.title}" mở khóa! +$${a.rewardCash.toLocaleString()}, +${a.rewardCp} CP`);
    }
  }
  if (newlyUnlocked.length) {
    sound.playCelebration();
    next = {
      ...next,
      achievements: [...(prev.achievements || []), ...newlyUnlocked],
      cash: Math.round((next.cash + gainCash) * 10) / 10,
      creativePoints: next.creativePoints + gainCp,
      eventLogs: [...logs, ...next.eventLogs].slice(0, 30),
    };
  }
  return next;
}

// ---------------------------------------------------------------------------
// Offline earnings
// ---------------------------------------------------------------------------

const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000;

export function simulateOffline(
  state: GameState,
  awayMs: number
): { state: GameState; report: OfflineReport } | null {
  if (!Number.isFinite(awayMs) || awayMs < 90_000) return null;
  const unlocked = state.recipes.filter((r) => r.unlocked);
  if (unlocked.length === 0) return null;

  const cappedMs = Math.min(awayMs, OFFLINE_CAP_MS);
  const secs = cappedMs / 1000;

  const tier = RESTAURANT_TIERS.find((t) => t.level === state.restaurantLevel) || RESTAURANT_TIERS[0];
  const hasChef = state.staff.some((s) => s.role === 'chef' && s.status === 'working');
  const offSeason = SEASONAL_EVENTS[state.season] || SEASONAL_EVENTS.spring;
  const visitorChance = Math.min(
    0.95,
    ((state.reputation / 100) * 0.5 +
      (tier.baseVisitors / 100) * 0.4 +
      0.2 +
      (state.channels.onlineDelivery ? 0.25 : 0)) * offSeason.visitorMultiplier
  );
  const seatCap = state.seats / 9; // a guest occupies a seat ~9s
  const perSec = Math.min(visitorChance, seatCap);
  const efficiency = hasChef ? 0.45 : 0.2; // offline is deliberately less lucrative than playing
  const customers = Math.floor(secs * perSec * efficiency);
  const avgPrice = unlocked.reduce((a, r) => a + r.sellPrice, 0) / unlocked.length;
  const cash = Math.round(customers * avgPrice * 1.08);
  const creativePoints = Math.floor(secs / 40);

  // Finish cooking batches
  const cookedDishes = { ...state.cookedDishes };
  let dishesFinished = 0;
  for (const b of state.cookingBatches) {
    cookedDishes[b.recipeId] = (cookedDishes[b.recipeId] || 0) + b.amount;
    dishesFinished += b.amount;
  }

  // Shop restock
  let restocked = false;
  let shopIngredients = state.shopIngredients;
  let shopRestockCountdown = state.shopRestockCountdown;
  let shopRestockCyclesCount = state.shopRestockCyclesCount;
  if (secs >= shopRestockCountdown) {
    restocked = true;
    shopIngredients = generateShopInventory();
    shopRestockCyclesCount += 1 + Math.floor((secs - shopRestockCountdown) / 180);
    shopRestockCountdown = 180 - Math.floor((secs - shopRestockCountdown) % 180);
  } else {
    shopRestockCountdown = Math.max(1, Math.floor(shopRestockCountdown - secs));
  }

  const next: GameState = {
    ...state,
    cash: Math.round((state.cash + cash) * 10) / 10,
    creativePoints: state.creativePoints + creativePoints,
    totalCustomersServedAllTime: state.totalCustomersServedAllTime + customers,
    counters: {
      ...DEFAULT_COUNTERS,
      ...state.counters,
      cashEarnedAllTime: (state.counters?.cashEarnedAllTime || 0) + cash,
    },
    cookedDishes,
    cookingBatches: [],
    shopIngredients,
    shopRestockCountdown,
    shopRestockCyclesCount,
    eventLogs: [
      `🌙 Khi bạn vắng mặt, quán vẫn phục vụ ${customers} khách và thu về +$${cash.toLocaleString()}.`,
      ...state.eventLogs,
    ].slice(0, 30),
  };
  return {
    state: next,
    report: { awayMs, cappedMs, cash, creativePoints, customers, dishesFinished, restocked },
  };
}
