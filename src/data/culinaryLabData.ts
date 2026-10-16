export interface CookingMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  cookTime: number; // in seconds
  statBonus: {
    umami: number;
    aroma: number;
    crunch: number;
    sweet: number;
    spicy: number;
  };
  bestWith: string[]; // ingredient categories or ids
}

export interface SeasoningBase {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number;
  flavorImpact: {
    sweet: number;
    salty: number;
    sour: number;
    spicy: number;
    umami: number;
    aroma: number;
  };
}

export interface PlatingStyle {
  id: string;
  name: string;
  icon: string;
  cost: number;
  prestigeMultiplier: number;
  description: string;
}

export interface SecretRecipeCombo {
  id: string;
  name: string;
  icon: string;
  category: 'street' | 'traditional' | 'western' | 'asian' | 'gourmet' | 'michelin';
  requiredIngredientIds: string[]; // all must be present
  requiredMethodId?: string;
  requiredSeasoningId?: string;
  bonusExp: number;
  bonusCp: number;
  description: string;
  tastingNote: string;
}

export const COOKING_METHODS: CookingMethod[] = [
  {
    id: 'wok_stirfry',
    name: 'Xào Chảo Wok Lửa Lớn',
    icon: '🍳',
    description: 'Nhiệt độ cực cao tạo mùi thơm khói Wok Hei đặc trưng, rau củ giữ trọn màu xanh giòn ngọt.',
    cookTime: 5,
    statBonus: { umami: 25, aroma: 30, crunch: 15, sweet: 5, spicy: 10 },
    bestWith: ['produce', 'meat', 'noodles', 'rice_porkchop'],
  },
  {
    id: 'charcoal_grill',
    name: 'Nướng Than Hoa Hồng',
    icon: '🔥',
    description: 'Thịt chín xém cạnh vàng nâu, mỡ tơ thơm nức mũi, lớp vỏ ngoài giòn giòn bên trong mọng nước.',
    cookTime: 6,
    statBonus: { umami: 30, aroma: 35, crunch: 20, sweet: 10, spicy: 5 },
    bestWith: ['meat', 'bread', 'rice_porkchop', 'spices'],
  },
  {
    id: 'pressure_stew',
    name: 'Hầm Áp Suất Ninh Nhừ',
    icon: '🥘',
    description: 'Chiết xuất toàn bộ chất ngọt tủy xương và củ quả, nước dùng sánh đậm, thịt mềm tan trong miệng.',
    cookTime: 8,
    statBonus: { umami: 40, aroma: 20, crunch: -10, sweet: 20, spicy: 0 },
    bestWith: ['meat', 'beef', 'noodles', 'herbs'],
  },
  {
    id: 'pan_sear',
    name: 'Áp Chảo Bơ Tỏi Thảo Mộc',
    icon: '🧈',
    description: 'Mặt ngoài xém vàng óng ánh quyện bơ thơm lừng, giữ độ ẩm mọng tươi ngon tối đa của thịt và cá.',
    cookTime: 5,
    statBonus: { umami: 30, aroma: 30, crunch: 10, sweet: 10, spicy: 0 },
    bestWith: ['wagyu_steak', 'salmon_seafood', 'lobster', 'meat'],
  },
  {
    id: 'bamboo_steam',
    name: 'Hấp Cách Thủy Xửng Tre',
    icon: '🥟',
    description: 'Giữ trọn 100% vị ngọt thanh tự nhiên và dưỡng chất của hải sản tươi sống mà không hề dầu mỡ.',
    cookTime: 5,
    statBonus: { umami: 20, aroma: 15, crunch: 5, sweet: 15, spicy: 0 },
    bestWith: ['seafood', 'salmon_seafood', 'lobster', 'produce'],
  },
  {
    id: 'golden_fry',
    name: 'Chiên Giòn Xù Hoàng Kim',
    icon: '🍗',
    description: 'Lớp bột xù vàng rực rỡ, âm thanh giòn rụm khi cắn cực kỳ đã tai, thỏa mãn mọi giác quan.',
    cookTime: 4,
    statBonus: { umami: 20, aroma: 20, crunch: 45, sweet: 0, spicy: 5 },
    bestWith: ['seafood', 'egg', 'cheese_flour', 'bread'],
  },
];

export const SEASONING_BASES: SeasoningBase[] = [
  {
    id: 'sate_chili',
    name: 'Sa Tế Ớt Hiểm & Sả Phi Thơm',
    icon: '🌶️',
    description: 'Vị cay nồng bùng nổ, màu đỏ óng ánh từ ớt tươi và sả đập dập thơm lừng kích thích vị giác.',
    cost: 3,
    flavorImpact: { sweet: 5, salty: 15, sour: 5, spicy: 45, umami: 20, aroma: 30 },
  },
  {
    id: 'fish_sauce_pepper',
    name: 'Nước Mắm Cốt Nhĩ & Tiêu Rừng Phú Quốc',
    icon: '🧂',
    description: 'Vị đậm đà tinh túy biển khơi, thơm nồng hạt tiêu đen giã dập tạo hậu vị ngọt hậu lắng sâu.',
    cost: 4,
    flavorImpact: { sweet: 10, salty: 35, sour: 0, spicy: 15, umami: 40, aroma: 25 },
  },
  {
    id: 'herb_garlic_butter',
    name: 'Bơ Tỏi Thảo Mộc & Tiêu Đen Xay',
    icon: '🧄',
    description: 'Bơ béo ngậy thơm nức quyện tỏi phi vàng và lá xạ hương rosemary phong cách Âu châu.',
    cost: 5,
    flavorImpact: { sweet: 10, salty: 15, sour: 5, spicy: 10, umami: 35, aroma: 40 },
  },
  {
    id: 'honey_oyster',
    name: 'Sốt Mật Ong Rừng & Dầu Hào Thượng Hạng',
    icon: '🍯',
    description: 'Độ óng ánh mượt mà, vị ngọt thanh tự nhiên của mật ong hoa rừng hòa hợp mặn mòi dầu hào.',
    cost: 4,
    flavorImpact: { sweet: 35, salty: 20, sour: 5, spicy: 5, umami: 30, aroma: 20 },
  },
  {
    id: 'melted_cheese',
    name: 'Sốt Phô Mai Tan Chảy Kéo Sợi',
    icon: '🧀',
    description: 'Lớp phô mai vàng ươm kéo dài béo ngậy, kết hợp kem tươi thơm lừng cực kỳ hút mắt thực khách.',
    cost: 6,
    flavorImpact: { sweet: 15, salty: 20, sour: 0, spicy: 0, umami: 35, aroma: 25 },
  },
  {
    id: 'truffle_wine',
    name: 'Dầu Nấm Truffle Đen & Vang Đỏ Giảm Chậm',
    icon: '✨',
    description: 'Hương vị quý tộc đắt giá bậc nhất thế giới, đem đến chiều sâu hương thơm bí ẩn khó quên.',
    cost: 15,
    flavorImpact: { sweet: 10, salty: 15, sour: 10, spicy: 5, umami: 45, aroma: 50 },
  },
];

export const PLATING_STYLES: PlatingStyle[] = [
  {
    id: 'street_kraft',
    name: 'Bao Gói Kraft Thân Thiện Đường Phố',
    icon: '📦',
    cost: 1,
    prestigeMultiplier: 1.0,
    description: 'Nhanh gọn, tiện mang đi, thân thiện môi trường rất được lòng sinh viên và giới văn phòng.',
  },
  {
    id: 'bamboo_leaf',
    name: 'Mẹt Tre Lót Lá Chuối Mộc Mạc',
    icon: '🍃',
    cost: 2,
    prestigeMultiplier: 1.15,
    description: 'Đậm đà phong vị làng quê cổ truyền, tôn vinh nguồn cội nguyên liệu tươi sạch.',
  },
  {
    id: 'ceramic_vintage',
    name: 'Đĩa Sứ Men Rạn Bát Tràng Hoa Văn Cổ',
    icon: '🍽️',
    cost: 5,
    prestigeMultiplier: 1.3,
    description: 'Đĩa sứ dày dặn sang trọng, rắc mè rang và hoa ớt tỉa nghệ thuật chuẩn chỉnh.',
  },
  {
    id: 'fine_dining_stone',
    name: 'Đĩa Đá Cẩm Thạch Fine Dining Tinh Hoa',
    icon: '👑',
    cost: 12,
    prestigeMultiplier: 1.55,
    description: 'Hun khói gỗ sồi, vẽ sốt nghệ thuật trừu tượng xứng tầm nhà hàng sao Michelin.',
  },
];

export const SECRET_RECIPES: SecretRecipeCombo[] = [
  {
    id: 'secret_banh_mi_flame',
    name: 'Bánh Mì Thập Cẩm Sa Tế Lửa',
    icon: '🥖',
    category: 'street',
    requiredIngredientIds: ['bread', 'pork', 'spices'],
    requiredSeasoningId: 'sate_chili',
    bonusExp: 100,
    bonusCp: 20,
    description: 'Sự kết hợp hoàn hảo giữa vỏ bánh mì giòn tan, pate béo ngậy và sốt sa tế cay nồng đánh thức mọi giác quan!',
    tastingNote: 'Vị cay nồng của sa tế làm bật lên độ béo bùi của pate, hòa quyện với rau đồ chua giòn sần sật tuyệt đối!',
  },
  {
    id: 'secret_com_tam_royal',
    name: 'Cơm Tấm Sườn Cốt Lết Mật Ong Nướng Than',
    icon: '🍖',
    category: 'traditional',
    requiredIngredientIds: ['rice_porkchop', 'egg', 'herbs'],
    requiredMethodId: 'charcoal_grill',
    bonusExp: 130,
    bonusCp: 25,
    description: 'Sườn cốt lết dày thịt ướp mật ong rừng thơm nức khói than, trứng ốp la lòng đào chảy vàng óng ả.',
    tastingNote: 'Hương khói than hoa đượm vào từng thớ thịt mềm ngọt, mỡ sườn tơ chảy quyện cùng hạt cơm tấm nở đều thơm lừng.',
  },
  {
    id: 'secret_pizza_skillet',
    name: 'Chảo Pizza Phô Mai Kéo Sợi Đút Lò',
    icon: '🍕',
    category: 'western',
    requiredIngredientIds: ['cheese_flour', 'beef', 'spices'],
    requiredSeasoningId: 'melted_cheese',
    bonusExp: 150,
    bonusCp: 25,
    description: 'Bột mì ủ chậm cán xốp mềm, phủ đầy ắp phô mai Mozzarella dẻo thơm và thịt bò băm sốt đậm đà.',
    tastingNote: 'Phô mai kéo sợi thơm ngậy ngút ngàn, vỏ bánh xốp giòn viền ngoài làm nức lòng thực khách trẻ tuổi.',
  },
  {
    id: 'secret_pho_tho_da',
    name: 'Phở Bò Thố Đá Ninh Nhừ Bát Tràng',
    icon: '🍜',
    category: 'traditional',
    requiredIngredientIds: ['beef', 'noodles', 'herbs'],
    requiredMethodId: 'pressure_stew',
    bonusExp: 160,
    bonusCp: 30,
    description: 'Nước phở sôi sùng sục trong thố đá giữ nhiệt, thả bò tái mềm hồng tươi, rắc hoa hồi quế chi ngào ngạt.',
    tastingNote: 'Nước dùng trong vắt ngọt sâu từ tủy xương bò, lát gầu giòn sần sật tan trong miệng để lại hậu vị ngọt thanh khó tả.',
  },
  {
    id: 'secret_wagyu_truffle',
    name: 'Bò Wagyu A5 Áp Chảo Bơ Nấm Truffle Đen',
    icon: '🥩',
    category: 'michelin',
    requiredIngredientIds: ['wagyu_steak', 'truffle_caviar', 'spices'],
    requiredMethodId: 'pan_sear',
    requiredSeasoningId: 'truffle_wine',
    bonusExp: 260,
    bonusCp: 45,
    description: 'Đỉnh cao ẩm thực xa xỉ: Từng vân mỡ hoa cẩm thạch của bò Wagyu A5 tan chảy ở 32 độ C, hòa quyện hương nấm Truffle đen quý giá.',
    tastingNote: 'Một kiệt tác ẩm thực làm rung động mọi nhà phê bình khó tính nhất! Độ mềm mọng tựa như mây, hương vị xa xỉ bao trùm vòm họng.',
  },
  {
    id: 'secret_lobster_cheese',
    name: 'Tôm Hùm Đút Lò Phô Mai Bơ Tỏi Đẳng Cấp',
    icon: '🦞',
    category: 'gourmet',
    requiredIngredientIds: ['lobster', 'cheese_flour', 'spices'],
    requiredSeasoningId: 'melted_cheese',
    bonusExp: 220,
    bonusCp: 35,
    description: 'Thịt tôm hùm đại dương ngọt lịm săn chắc, phủ ngập sốt bơ tỏi và lớp phô mai nướng xém vàng rộm.',
    tastingNote: 'Thớ thịt tôm hùm dai giòn ngọt tự nhiên đối trọng hoàn hảo với lớp phô mai béo ngậy đút lò, mang lại cảm giác hưởng thụ tột đỉnh.',
  },
  {
    id: 'secret_salmon_steam',
    name: 'Cá Hồi Na Uy Hấp Xửng Tre Thảo Mộc',
    icon: '🐟',
    category: 'gourmet',
    requiredIngredientIds: ['salmon_seafood', 'herbs', 'spices'],
    requiredMethodId: 'bamboo_steam',
    bonusExp: 180,
    bonusCp: 30,
    description: 'Cá hồi Na Uy giữ trọn màu cam óng ả và axit béo Omega-3 quý giá qua làn hơi nước tre ngát hương gừng sả.',
    tastingNote: 'Thịt cá hồi béo mềm như bơ, không một chút tanh, thoang thoảng mùi thảo mộc thiên nhiên thanh khiết vô ngần.',
  },
  {
    id: 'secret_golden_egg_rice',
    name: 'Cơm Chiên Trứng Hoàng Kim Chảo Wok',
    icon: '🍛',
    category: 'asian',
    requiredIngredientIds: ['egg', 'rice_porkchop', 'herbs'],
    requiredMethodId: 'wok_stirfry',
    bonusExp: 120,
    bonusCp: 20,
    description: 'Từng hạt cơm được bao bọc bởi lớp lòng đỏ trứng gà vàng óng ánh, đảo bay trên chảo Wok bốc khói nghi ngút.',
    tastingNote: 'Hạt cơm tơi xốp giòn rụm bên ngoài, mềm dẻo bên trong, thơm nức mùi trứng chiên và hành lá phi giòn.',
  },
  {
    id: 'secret_tea_wild_honey',
    name: 'Trà Đào Cam Sả Mật Ong Hoa Nhãn Rừng',
    icon: '🍹',
    category: 'street',
    requiredIngredientIds: ['tea_peach', 'herbs', 'spices'],
    requiredSeasoningId: 'honey_oyster',
    bonusExp: 110,
    bonusCp: 20,
    description: 'Trà thảo mộc thơm lành ủ lạnh, kết hợp tép cam mọng nước, miếng đào giòn ngọt và mật ong hoa nhãn ngọt thanh giải nhiệt.',
    tastingNote: 'Vị chát nhẹ của trà đen được làm dịu bởi mật ong rừng, sả tươi nồng nàn và đào giòn rôm rốp làm bừng tỉnh tinh thần.',
  },
];

// Helper evaluation engine
export interface EvaluationResult {
  costPrice: number;
  rawIngredientsCost: number;
  seasoningCost: number;
  platingCost: number;
  creationFee: number;
  suggestedSellPrice: number;
  harmonyScore: number; // 0 to 100
  flavorProfile: {
    sweet: number;
    salty: number;
    sour: number;
    spicy: number;
    umami: number;
    crunch: number;
    aroma: number;
  };
  cookTime: number;
  discoveredSecret?: SecretRecipeCombo;
  suggestedName: string;
  suggestedIcon: string;
  suggestedCategory: 'street' | 'traditional' | 'western' | 'asian' | 'gourmet' | 'michelin';
  tastingReview: string;
}

export function evaluateCombination(
  selectedIngredientIds: string[],
  allIngredients: { id: string; name: string; basePrice: number; category: string; icon: string }[],
  methodId: string,
  seasoningId: string,
  platingId: string,
  ingredientAmounts: Record<string, number> = {}
): EvaluationResult {
  const method = COOKING_METHODS.find((m) => m.id === methodId) || COOKING_METHODS[0];
  const seasoning = SEASONING_BASES.find((s) => s.id === seasoningId) || SEASONING_BASES[0];
  const plating = PLATING_STYLES.find((p) => p.id === platingId) || PLATING_STYLES[0];

  const chosenIngs = allIngredients.filter((i) => selectedIngredientIds.includes(i.id));

  // 1. Calculate Base Cost with specific quantities
  const rawIngredientsCost = chosenIngs.reduce((sum, item) => {
    const qty = Math.max(1, ingredientAmounts[item.id] || 1);
    return sum + item.basePrice * qty;
  }, 0);
  const seasoningCost = seasoning.cost;
  const platingCost = plating.cost;
  const totalCost = rawIngredientsCost + seasoningCost + platingCost;
  const creationFee = totalCost; // Phí nghiên cứu & chế tạo mẫu dựa trên tổng giá trị nguyên liệu và gia vị thực tế

  // 2. Flavor Accumulation (scaled with ingredient quantities)
  let sweet = 10 + seasoning.flavorImpact.sweet + method.statBonus.sweet;
  let salty = 10 + seasoning.flavorImpact.salty;
  let sour = 5 + seasoning.flavorImpact.sour;
  let spicy = 5 + seasoning.flavorImpact.spicy + method.statBonus.spicy;
  let umami = 15 + seasoning.flavorImpact.umami + method.statBonus.umami;
  let crunch = 10 + method.statBonus.crunch;
  let aroma = 20 + seasoning.flavorImpact.aroma + method.statBonus.aroma;

  // Modulate with ingredient categories and portions
  chosenIngs.forEach((ing) => {
    const qty = Math.max(1, ingredientAmounts[ing.id] || 1);
    const impactScale = 0.7 + qty * 0.3;

    if (ing.category === 'meat' || ing.category === 'seafood') {
      umami += Math.round(18 * impactScale);
      aroma += Math.round(8 * impactScale);
    }
    if (ing.category === 'produce') {
      sweet += Math.round(8 * impactScale);
      sour += Math.round(5 * impactScale);
      crunch += Math.round(10 * impactScale);
    }
    if (ing.category === 'dry') {
      sweet += Math.round(5 * impactScale);
      crunch += Math.round(8 * impactScale);
    }
    if (ing.category === 'spice') {
      aroma += Math.round(15 * impactScale);
      spicy += Math.round(10 * impactScale);
    }
  });

  // Clamp 0..100
  sweet = Math.min(100, Math.max(0, sweet));
  salty = Math.min(100, Math.max(0, salty));
  sour = Math.min(100, Math.max(0, sour));
  spicy = Math.min(100, Math.max(0, spicy));
  umami = Math.min(100, Math.max(0, umami));
  crunch = Math.min(100, Math.max(0, crunch));
  aroma = Math.min(100, Math.max(0, aroma));

  // 3. Harmony Score Calculation
  let harmony = 70;
  if (chosenIngs.length >= 3) harmony += 12;
  if (chosenIngs.length >= 4) harmony += 6;
  if (umami >= 50) harmony += 6;
  if (aroma >= 50) harmony += 6;
  // If extreme salty or extreme spicy without balance
  if (salty > 75) harmony -= 15;
  if (spicy > 80 && sweet < 20) harmony -= 10;
  harmony = Math.min(100, Math.max(45, harmony));

  // 4. Secret Recipe Matching
  const matchedSecret = SECRET_RECIPES.find((sec) => {
    const hasAllIngs = sec.requiredIngredientIds.every((id) => selectedIngredientIds.includes(id));
    if (!hasAllIngs) return false;
    if (sec.requiredMethodId && sec.requiredMethodId !== methodId) return false;
    if (sec.requiredSeasoningId && sec.requiredSeasoningId !== seasoningId) return false;
    return true;
  });

  // 5. Suggested Selling Price
  const markup = matchedSecret
    ? 2.4 * plating.prestigeMultiplier
    : (1.9 + (harmony / 100) * 0.5) * plating.prestigeMultiplier;
  const suggestedSellPrice = Math.round(totalCost * markup);

  // 6. Naming & Category
  let suggestedName = '';
  let suggestedIcon = '🍲';
  let suggestedCategory: 'street' | 'traditional' | 'western' | 'asian' | 'gourmet' | 'michelin' = 'traditional';

  if (matchedSecret) {
    suggestedName = matchedSecret.name;
    suggestedIcon = matchedSecret.icon;
    suggestedCategory = matchedSecret.category;
  } else {
    // Generate evocative culinary name
    const mainIng = chosenIngs[0]?.name.split(' ')[0] || 'Món Ăn';
    suggestedName = `${mainIng} ${method.name} ${seasoning.name.split('&')[0]}`.trim();
    if (chosenIngs.some((i) => i.id === 'lobster' || i.id === 'wagyu_steak' || i.id === 'truffle_caviar')) {
      suggestedCategory = 'michelin';
      suggestedIcon = '✨';
    } else if (chosenIngs.some((i) => i.id === 'salmon_seafood')) {
      suggestedCategory = 'gourmet';
      suggestedIcon = '🐟';
    } else if (chosenIngs.some((i) => i.id === 'cheese_flour')) {
      suggestedCategory = 'western';
      suggestedIcon = '🍕';
    } else if (chosenIngs.some((i) => i.id === 'bread' || i.id === 'tea_peach')) {
      suggestedCategory = 'street';
      suggestedIcon = '🥖';
    } else {
      suggestedCategory = 'asian';
      suggestedIcon = '🥘';
    }
  }

  // 7. Tasting Review
  let tastingReview = '';
  if (matchedSecret) {
    tastingReview = matchedSecret.tastingNote;
  } else if (harmony >= 85) {
    tastingReview = `Bếp trưởng nếm thử: Sự phối trộn đạt điểm hài hòa xuất sắc ${harmony}/100! Kỹ thuật ${method.name.toLowerCase()} giúp giữ trọn độ ẩm, vị umami đậm sâu quyện hương ${seasoning.name.toLowerCase()} tạo nên một món ăn đầy cá tính!`;
  } else if (harmony >= 70) {
    tastingReview = `Bếp trưởng nhận xét: Món ăn có hương vị cân bằng khá ổn (${harmony}/100). Lớp gia vị bắt miệng, phù hợp khẩu vị đại chúng và có tiềm năng bán rất chạy!`;
  } else {
    tastingReview = `Bếp trưởng nhận xét: Hương vị khá độc lạ (${harmony}/100). Vị ${spicy > 60 ? 'cay' : 'mặn'} hơi chiếm ưu thế, nhưng chính nét phá cách này lại có thể thu hút những thực khách thích cảm giác mạnh!`;
  }

  return {
    costPrice: totalCost,
    rawIngredientsCost,
    seasoningCost,
    platingCost,
    creationFee,
    suggestedSellPrice,
    harmonyScore: harmony,
    flavorProfile: {
      sweet,
      salty,
      sour,
      spicy,
      umami,
      crunch,
      aroma,
    },
    cookTime: method.cookTime,
    discoveredSecret: matchedSecret,
    suggestedName,
    suggestedIcon,
    suggestedCategory,
    tastingReview,
  };
}
