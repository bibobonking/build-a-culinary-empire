export type Season =
  | 'spring'
  | 'summer'
  | 'autumn'
  | 'winter'
  | 'tet'
  | 'midAutumn'
  | 'halloween'
  | 'christmas';
export type TimeOfDay = 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'night';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type StaffRole = 'chef' | 'server' | 'cashier' | 'manager';
export type SupplierType = 'market' | 'supermarket' | 'premium';

export type RecipeRarity = 'Rare' | 'Epic' | 'Legendary' | 'Mythical' | 'Secret';
export type IngredientRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical';

export interface IngredientItem {
  id: string;
  name: string;
  category: 'produce' | 'meat' | 'seafood' | 'dry' | 'spice' | 'special';
  icon: string;
  basePrice: number; // Unit price in $
  unit: string;
  rarity: IngredientRarity;
  luckBonus: number; // Additional % luck when combined in crafting
  description: string;
  stock: number;
  freshness: number;
}

export interface ShopIngredient extends IngredientItem {
  currentStock: number;
  maxStock: number;
  inStock: boolean;
  discountPercent?: number; // e.g. 15 for 15% off
}

export type FoodBoxId =
  | 'box_street'
  | 'box_asian'
  | 'box_royal'
  | 'box_secret_vault'
  | 'box_celestial'
  | 'box_galaxy';

export interface FoodBoxInfo {
  id: FoodBoxId;
  name: string;
  subtitle: string;
  icon: string;
  description: string;
  costCash: number;
  costCp: number;
  theme: 'street' | 'asian' | 'royal' | 'secret' | 'celestial' | 'galaxy';
  color: string;
  borderClass: string;
  bgGradient: string;
  currentStock: number;
  maxStock: number;
}

export interface RecipeRequirement {
  ingredientId: string;
  amount: number;
}

export interface Recipe {
  id: string;
  name: string;
  customName?: string;
  rarity: RecipeRarity;
  category: 'street' | 'traditional' | 'western' | 'asian' | 'gourmet' | 'michelin' | 'celestial';
  icon: string;
  description: string;
  cookTime: number; // in seconds
  costPrice: number; // 0 since cooking is FREE once unlocked!
  sellPrice: number; // Lucrative income per plate
  unlocked: boolean;
  count?: number; // Số lượng bản vẽ / công thức trùng đã sở hữu (>= 1)
  source?: 'crafted' | 'foodbox' | 'initial';
  combinedIngredients?: string[]; // IDs or names of ingredients used to craft it
  flavorNotes?: string;
  isSignature?: boolean;
  signatureBonus?: number;
  timesCooked?: number;
  timesServed?: number;
}

export interface CookingBatch {
  id: string;
  recipeId: string;
  recipeName: string;
  recipeIcon: string;
  recipeRarity?: RecipeRarity;
  amount: number; // Number of plates
  totalTime: number;
  remainingTime: number;
  progress: number; // 0 to 100
  isManual: boolean;
}

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  avatar: string;
  skill: number; // 1 to 100
  speed: number; // 1 to 100
  morale: number; // 0 to 100
  fatigue: number; // 0 to 100
  salary: number; // daily salary in $
  hiredAtDay: number;
  status: 'working' | 'resting' | 'quit';
}

export interface CustomerArchetype {
  id: string;
  name: string;
  type: 'student' | 'office' | 'family' | 'blogger' | 'critic' | 'vip';
  icon: string;
  budgetMultiplier: number;
  patience: number; // seconds willing to wait
  strictness: number; // 1 to 5
  description: string;
  preferredDishes?: string[];
}

export interface Review {
  id: string;
  customerName: string;
  customerType: string;
  avatar: string;
  dishName: string;
  dishIcon: string;
  rarity?: RecipeRarity;
  rating: number; // 1 to 5
  comment: string;
  tip: number;
  timestamp: string;
  day: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  customerName: string;
  customerType: string;
  customerAvatar: string;
  recipeId: string;
  recipeName: string;
  recipeIcon: string;
  recipeRarity?: RecipeRarity;
  sellPrice: number;
  status: 'waiting_for_food' | 'cooking' | 'eating' | 'paying' | 'served';
  patience?: number; // 0 to 100
  progress?: number;
  remainingTime?: number;
  totalTime?: number;
  satisfaction: number;
}

export interface RestaurantTier {
  level: number;
  name: string;
  title: string;
  icon: string;
  maxSeats: number;
  baseVisitors: number;
  requiredCash: number;
  /** Số nhiệm vụ đã hoàn thành (claimed) yêu cầu để nâng cấp */
  requiredQuests: number;
  requiredReputation: number;
  requiredExp?: number;
  luckBonus: number; // % bonus luck for all crafts
  cookingSlots: number;
  description: string;
  visualStyle: string;
}

export interface KitchenEquipment {
  id: string;
  name: string;
  icon: string;
  category: 'stove' | 'prep' | 'storage' | 'luxury';
  cost: number;
  speedBonus: number; // cooking speed boost in %
  luckBonus: number; // additional crafting luck %
  unlocked: boolean;
  requiredTier: number;
  description: string;
}

export interface MarketTrend {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  boostRarity?: RecipeRarity;
  boostCategory: string;
  revenueMultiplier: number;
  visitorMultiplier: number;
  daysRemaining: number;
}

export interface RandomEventChoice {
  text: string;
  costCash?: number;
  gainCash?: number;
  moraleChange?: number;
  reputationChange?: number;
  creativePointsGain?: number;
  foodBoxReward?: FoodBoxId;
  outcomeText: string;
}

export interface RandomEvent {
  id: string;
  title: string;
  icon: string;
  description: string;
  choices: RandomEventChoice[];
}

export interface BankLoan {
  id: string;
  name: string;
  amount: number;
  dailyInterest: number;
  remainingDays: number;
  taken: boolean;
}

export interface FranchiseBranch {
  id: string;
  name: string;
  location: string;
  icon: string;
  cost: number;
  dailyRoyalty: number;
  owned: boolean;
}

export interface RivalBusiness {
  id: string;
  name: string;
  cuisine: string;
  icon: string;
  cost: number;
  marketShareBoost: number;
  acquired: boolean;
}

export interface DailyFinancialRecord {
  day: number;
  revenue: number;
  foodCost: number;
  salaries: number;
  maintenance: number;
  marketing: number;
  tax: number;
  netProfit: number;
  customersServed: number;
}

export type QuestCategory = 'daily' | 'milestone' | 'culinary';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  icon: string;
  progress: number;
  target: number;
  unit: string;
  rewardExp?: number;
  rewardCash: number;
  rewardCp: number;
  rewardFoodBox?: FoodBoxId;
  completed: boolean;
  claimed: boolean;
}

export const CURRENT_SAVE_VERSION = 3;
export const CURRENT_VERSION_STRING = 'v3.0.0';

export interface FixSaveReport {
  timestamp: number;
  fromVersion: string | number;
  toVersion: number;
  wasMigrated: boolean;
  changes: string[];
  preservedDataSummary: {
    cash: number;
    creativePoints: number;
    level: number;
    totalRecipesOwned: number;
    unlockedRecipesCount: number;
    inventoryItemsCount: number;
    dishesOnCounter: number;
    day: number;
  };
}

export interface GameState {
  saveVersion?: number;
  lastFixReport?: FixSaveReport | null;
  cash: number;
  creativePoints: number;
  reputation: number; // 0 to 100
  starRating: number; // 1.0 to 5.0
  totalReviews: number;
  difficulty: Difficulty;
  restaurantLevel: number; // 1 to 6 (Restaurant Tier)
  exp?: number;
  expForNextLevel?: number;
  totalExpEarnedAllTime?: number;
  seats: number;
  day: number;
  hour: number; // 8 to 22
  minute: number;
  season: Season;
  timeOfDay: TimeOfDay;
  gameSpeed: number; // 0, 1, 2, 5, 10
  
  // Ingredients & Shop (3-min restock cycle)
  inventory: Record<string, number>; // ingredientId -> amount
  inventoryFreshness?: Record<string, number>;
  shopIngredients: ShopIngredient[];
  shopRestockCountdown: number; // in seconds (out of 180s = 3 mins)
  shopRestockCyclesCount: number;

  // FoodBox System (5 types, 50/30/14/5/1% rarity drop rates)
  foodBoxesOwned: Record<string, number>; // FoodBoxId -> count
  foodBoxShop?: FoodBoxInfo[];

  // Recipes, Free Cooking & Serving Buffet Counter
  recipes: Recipe[];
  cookedDishes: Record<string, number>; // recipeId -> number of plates ready on counter
  cookingBatches: CookingBatch[]; // currently in progress
  totalDishesCookedAllTime?: number;

  // Staff & Kitchen
  staff: Staff[];
  equipment: KitchenEquipment[];
  activeOrders: Order[];
  recentReviews: Review[];
  currentTrend: MarketTrend;
  
  channels: {
    foodTruck: boolean;
    popUp: boolean;
    onlineDelivery: boolean;
  };
  loans: BankLoan[];
  franchises: FranchiseBranch[];
  rivals: RivalBusiness[];
  financialHistory: DailyFinancialRecord[];
  todayStats: {
    revenue: number;
    foodCost: number;
    tips: number;
    customersServed: number;
    dishesCooked: number;
  };
  activeEvent: RandomEvent | null;
  eventLogs: string[];
  tutorialSeen: boolean;
  totalCustomersServedAllTime: number;
  highestRevenueDay: number;
  quests: Quest[];
  discoveredSecretCombos?: string[];
  customizingRecipe?: Recipe | null;
  lowGraphicMode?: boolean;

  // --- v3.1 additions ---
  counters?: GameCounters;
  achievements?: string[]; // unlocked achievement ids
  dailyReward?: DailyRewardState;
  lastSeenAt?: number; // epoch ms, used for offline earnings
}

export interface GameCounters {
  shopBuys: number;
  crafted: number;
  manualCooked: number;
  boxesOpened: number;
  cashEarnedAllTime: number;
}

export interface DailyRewardState {
  lastClaimDate: string; // YYYY-MM-DD (local)
  streak: number;
}

export interface OfflineReport {
  awayMs: number;
  cappedMs: number;
  cash: number;
  creativePoints: number;
  customers: number;
  dishesFinished: number;
  restocked: boolean;
}


