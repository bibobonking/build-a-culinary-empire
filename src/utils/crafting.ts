import {
  IngredientItem,
  Recipe,
  RecipeRarity,
  FoodBoxId,
  ShopIngredient,
  KitchenEquipment,
  GameState,
} from '../types';
import { ALL_RECIPE_CATALOG } from '../data/recipeDatabase';
import { INGREDIENTS } from '../data/gameData';

// Calculate total luck percentage
export function calculateTotalLuck(
  selectedIngredients: IngredientItem[],
  equipmentList: KitchenEquipment[],
  restaurantTierLevel: number,
  extraLuck: number = 0
): {
  baseLuck: number;
  ingredientLuck: number;
  equipmentLuck: number;
  tierLuck: number;
  seasonLuck: number;
  totalLuck: number;
} {
  const baseLuck = 5; // 5% base luck
  const ingredientLuck = selectedIngredients.reduce((acc, ing) => acc + (ing.luckBonus || 0), 0);
  const equipmentLuck = equipmentList
    .filter((e) => e.unlocked)
    .reduce((acc, e) => acc + (e.luckBonus || 0), 0);
  const tierLuck = (restaurantTierLevel - 1) * 4; // +4% luck per restaurant tier
  const seasonLuck = Math.max(0, Math.round(extraLuck)); // boost từ mùa/lễ hội

  const totalLuck = Math.min(100, Math.round(baseLuck + ingredientLuck + equipmentLuck + tierLuck + seasonLuck));

  return {
    baseLuck,
    ingredientLuck,
    equipmentLuck,
    tierLuck,
    seasonLuck,
    totalLuck,
  };
}

// Calculate dynamic probabilities for Crafting based on Luck %
export function getCraftingProbabilities(luckPercent: number): {
  rare: number;
  epic: number;
  legendary: number;
  mythical: number;
  secret: number;
} {
  const l = Math.max(0, Math.min(100, luckPercent)) / 100;

  const secret = Math.round((0.005 + l * 0.045) * 1000) / 10;
  const mythical = Math.round((0.025 + l * 0.16) * 1000) / 10;
  const legendary = Math.round((0.09 + l * 0.23) * 1000) / 10;
  const epic = Math.round((0.28 + l * 0.05) * 1000) / 10;
  const rare = Math.max(0, Math.round((100 - secret - mythical - legendary - epic) * 10) / 10);

  return {
    rare,
    epic,
    legendary,
    mythical,
    secret,
  };
}

// Roll Rarity for Crafting
export function rollCraftingRarity(luckPercent: number): RecipeRarity {
  const probs = getCraftingProbabilities(luckPercent);
  const roll = Math.random() * 100;

  let cumulative = 0;
  cumulative += probs.secret;
  if (roll < cumulative) return 'Secret';

  cumulative += probs.mythical;
  if (roll < cumulative) return 'Mythical';

  cumulative += probs.legendary;
  if (roll < cumulative) return 'Legendary';

  cumulative += probs.epic;
  if (roll < cumulative) return 'Epic';

  return 'Rare';
}

// Open FoodBox with exact gacha rates:
// Rare: 50% | Epic: 30% | Legendary: 14% | Mythical: 5% | Secret: 1%
export function rollFoodBoxRarity(): RecipeRarity {
  const roll = Math.random(); // 0 to 1

  let cumulative = 0;
  // Secret: 1% (0.01)
  cumulative += 0.01;
  if (roll < cumulative) return 'Secret';

  // Mythical: 5% (0.05)
  cumulative += 0.05;
  if (roll < cumulative) return 'Mythical';

  // Legendary: 14% (0.14)
  cumulative += 0.14;
  if (roll < cumulative) return 'Legendary';

  // Epic: 30% (0.30)
  cumulative += 0.30;
  if (roll < cumulative) return 'Epic';

  // Rare: 50% (0.50)
  return 'Rare';
}

// Find or generate recipe for FoodBox opening
export function openFoodBoxOutcome(
  boxId: FoodBoxId,
  currentUnlockedRecipesOrState: Recipe[] | GameState
): {
  recipe: Recipe;
  rarity: RecipeRarity;
  isNew: boolean;
  duplicateCpReward: number;
} {
  const currentUnlockedRecipes = Array.isArray(currentUnlockedRecipesOrState)
    ? currentUnlockedRecipesOrState
    : currentUnlockedRecipesOrState.recipes;

  const rolledRarity = rollFoodBoxRarity();
  const unlockedIds = new Set(currentUnlockedRecipes.filter((r) => r.unlocked).map((r) => r.id));

  // Find all recipes of this rolled rarity in the global catalog (independent of player inventory)
  const matchingRecipes = ALL_RECIPE_CATALOG.filter((r) => r.rarity === rolledRarity);

  let chosenRecipe: Recipe;
  let isNew = true;
  let duplicateCpReward = 0;

  if (matchingRecipes.length > 0) {
    const base = matchingRecipes[Math.floor(Math.random() * matchingRecipes.length)];
    const alreadyOwned = unlockedIds.has(base.id);

    chosenRecipe = {
      ...base,
      unlocked: true,
      source: 'foodbox',
    };

    if (alreadyOwned) {
      isNew = false;
      duplicateCpReward =
        rolledRarity === 'Secret'
          ? 200
          : rolledRarity === 'Mythical'
          ? 100
          : rolledRarity === 'Legendary'
          ? 50
          : rolledRarity === 'Epic'
          ? 25
          : 10;
    }
  } else {
    chosenRecipe = {
      id: `rec_synth_${Date.now()}`,
      name: `Mỹ Vị ${rolledRarity} Đặc Quyền ${Math.floor(Math.random() * 900 + 100)}`,
      rarity: rolledRarity,
      category: 'gourmet',
      icon: rolledRarity === 'Secret' ? '🌌' : rolledRarity === 'Mythical' ? '✨' : '🍱',
      description: 'Công thức thần thánh tuyệt đỉnh vừa được khai mở từ Hộp Bí Ẩn Hoàng Kim!',
      cookTime: 6,
      costPrice: 0,
      sellPrice:
        rolledRarity === 'Secret'
          ? 1500000
          : rolledRarity === 'Mythical'
          ? 25000
          : rolledRarity === 'Legendary'
          ? 2000
          : rolledRarity === 'Epic'
          ? 580
          : 110,
      unlocked: true,
      source: 'foodbox',
    };
  }

  return {
    recipe: chosenRecipe,
    rarity: rolledRarity,
    isNew,
    duplicateCpReward,
  };
}

// Craft Recipe from Selected Ingredients
export function craftRecipeOutcome(
  selectedIngredients: IngredientItem[],
  currentUnlockedRecipes: Recipe[],
  luckPercent: number
): {
  recipe: Recipe;
  rarity: RecipeRarity;
  isNew: boolean;
  duplicateCpReward: number;
} {
  const rolledRarity = rollCraftingRarity(luckPercent);
  const unlockedIds = new Set(currentUnlockedRecipes.filter((r) => r.unlocked).map((r) => r.id));

  // Find all recipes of this rolled rarity from global catalog
  const matchingRecipes = ALL_RECIPE_CATALOG.filter((r) => r.rarity === rolledRarity);

  let chosenRecipe: Recipe;
  let isNew = true;
  let duplicateCpReward = 0;

  const ingredientNames = selectedIngredients.map((i) => i.name).join(', ');

  if (matchingRecipes.length > 0) {
    const base = matchingRecipes[Math.floor(Math.random() * matchingRecipes.length)];
    const alreadyOwned = unlockedIds.has(base.id);

    chosenRecipe = {
      ...base,
      unlocked: true,
      source: 'crafted',
      combinedIngredients: selectedIngredients.map((i) => `${i.icon} ${i.name}`),
    };

    if (alreadyOwned) {
      isNew = false;
      duplicateCpReward =
        rolledRarity === 'Secret'
          ? 250
          : rolledRarity === 'Mythical'
          ? 120
          : rolledRarity === 'Legendary'
          ? 60
          : rolledRarity === 'Epic'
          ? 30
          : 15;
    }
  } else {
    const mainIng = selectedIngredients[0];
    chosenRecipe = {
      id: `rec_crafted_${Date.now()}`,
      name: `Sáng Chế: ${mainIng.name} Tuyệt Phẩm ${rolledRarity}`,
      rarity: rolledRarity,
      category: 'gourmet',
      icon: mainIng.icon || '🍲',
      description: `Món ăn sáng tạo đỉnh cao kết hợp từ: ${ingredientNames}.`,
      cookTime: 5,
      costPrice: 0,
      sellPrice:
        rolledRarity === 'Secret'
          ? 1500000
          : rolledRarity === 'Mythical'
          ? 25000
          : rolledRarity === 'Legendary'
          ? 2000
          : rolledRarity === 'Epic'
          ? 580
          : 110,
      unlocked: true,
      source: 'crafted',
      combinedIngredients: selectedIngredients.map((i) => `${i.icon} ${i.name}`),
    };
  }

  return {
    recipe: chosenRecipe,
    rarity: rolledRarity,
    isNew,
    duplicateCpReward,
  };
}

// Convenient helper combining luck calculation and craft outcome
export function rollCraftingOutcome(
  selectedIngredients: IngredientItem[],
  equipmentList: KitchenEquipment[],
  restaurantTierLevel: number,
  currentUnlockedRecipes: Recipe[],
  seasonLuck: number = 0
) {
  const { totalLuck } = calculateTotalLuck(
    selectedIngredients,
    equipmentList,
    restaurantTierLevel,
    seasonLuck
  );
  return craftRecipeOutcome(selectedIngredients, currentUnlockedRecipes, totalLuck);
}

// Generate Restocked Shop Inventory (Called every 3 minutes)
export function generateShopInventory(
  allIngredients: IngredientItem[] = INGREDIENTS,
  cycleCount: number = 0
): ShopIngredient[] {
  return allIngredients.map((item) => {
    // Random stock limit per item
    const maxStock =
      item.rarity === 'Mythical'
        ? Math.floor(Math.random() * 3) + 1 // 1-3 for Mythical
        : item.rarity === 'Legendary'
        ? Math.floor(Math.random() * 5) + 2 // 2-6 for Legendary
        : item.rarity === 'Epic'
        ? Math.floor(Math.random() * 8) + 4 // 4-11 for Epic
        : Math.floor(Math.random() * 12) + 8; // 8-19 for Rare & Common

    // Chance to be out of stock on higher rarity items
    const isOutStock =
      item.rarity === 'Mythical'
        ? Math.random() < 0.35
        : item.rarity === 'Legendary'
        ? Math.random() < 0.20
        : Math.random() < 0.08;

    const currentStock = isOutStock ? 0 : maxStock;

    // Random flash discount (10% to 25% off) for some in-stock items
    const hasDiscount = !isOutStock && Math.random() < 0.25;
    const discountPercent = hasDiscount ? (Math.random() < 0.5 ? 15 : 25) : 0;

    return {
      ...item,
      currentStock,
      maxStock,
      inStock: currentStock > 0,
      discountPercent: discountPercent > 0 ? discountPercent : undefined,
    };
  });
}
