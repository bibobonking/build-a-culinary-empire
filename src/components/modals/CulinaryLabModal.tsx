import React, { useState } from 'react';
import { GameState, IngredientItem, Recipe } from '../../types';
import {
  COOKING_METHODS,
  SEASONING_BASES,
  PLATING_STYLES,
  SECRET_RECIPES,
  evaluateCombination,
  EvaluationResult,
} from '../../data/culinaryLabData';
import { INGREDIENTS } from '../../data/gameData';
import { sound } from '../../utils/audio';
import confetti from '../../utils/confettiFx';
import {
  X,
  Sparkles,
  Flame,
  ChefHat,
  Check,
  Plus,
  Trash2,
  Shuffle,
  BookOpen,
  DollarSign,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';

interface CulinaryLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onAddCustomRecipe: (
    newRecipe: Recipe,
    rewardExp: number,
    rewardCp: number,
    creationCost: number,
    secretDiscovered?: string
  ) => void;
}

const AVAILABLE_ICONS = [
  '🍲', '🍜', '🥘', '🥩', '🍱', '🥪', '🥖', '🍣', '🍕', '🍔',
  '🌮', '🥗', '🍛', '🍤', '🥟', '🍢', '🍧', '🍹', '🍖', '🦞',
  '🐟', '🍳', '🥧', '☕', '✨', '🧁', '🍮', '🥑',
];

export const CulinaryLabModal: React.FC<CulinaryLabModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onAddCustomRecipe,
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(['bread', 'pork', 'spices']);
  const [ingredientAmounts, setIngredientAmounts] = useState<Record<string, number>>({
    bread: 1,
    pork: 2,
    spices: 1,
  });
  const [selectedMethodId, setSelectedMethodId] = useState<string>('charcoal_grill');
  const [selectedSeasoningId, setSelectedSeasoningId] = useState<string>('sate_chili');
  const [selectedPlatingId, setSelectedPlatingId] = useState<string>('street_kraft');

  // Customization fields
  const [customDishName, setCustomDishName] = useState<string>('');
  const [customDishIcon, setCustomDishIcon] = useState<string>('🥖');
  const [customSellPrice, setCustomSellPrice] = useState<number>(0);
  const [activeSubView, setActiveSubView] = useState<'create' | 'secretBook'>('create');
  const [isCookingSim, setIsCookingSim] = useState<boolean>(false);
  const [hasTasted, setHasTasted] = useState<boolean>(false);
  // Overlay kết thúc sáng chế: món trồi lên từ nồi đang sôi (low-graphic: rút gọn)
  const [reveal, setReveal] = useState<{ icon: string; name: string } | null>(null);

  if (!isOpen) return null;

  // Evaluate combination
  const evalResult: EvaluationResult = evaluateCombination(
    selectedIngredients,
    INGREDIENTS,
    selectedMethodId,
    selectedSeasoningId,
    selectedPlatingId,
    ingredientAmounts
  );

  const canAffordCreation = gameState.cash >= evalResult.creationFee;

  const handleToggleIngredient = (ingId: string) => {
    sound.playTap();
    if (selectedIngredients.includes(ingId)) {
      if (selectedIngredients.length <= 1) {
        alert('Cần ít nhất 1 nguyên liệu chính để sáng tạo món ăn!');
        return;
      }
      setSelectedIngredients(selectedIngredients.filter((id) => id !== ingId));
    } else {
      if (selectedIngredients.length >= 5) {
        alert('Tối đa 5 nguyên liệu cho một món ăn để đảm bảo sự hài hòa hương vị!');
        return;
      }
      setSelectedIngredients([...selectedIngredients, ingId]);
      setIngredientAmounts((prev) => ({
        ...prev,
        [ingId]: prev[ingId] || 1,
      }));
    }
    setHasTasted(false);
  };

  const handleUpdateAmount = (ingId: string, delta: number) => {
    sound.playTap();
    setIngredientAmounts((prev) => {
      const current = prev[ingId] || 1;
      const next = Math.max(1, Math.min(5, current + delta));
      return { ...prev, [ingId]: next };
    });
    setHasTasted(false);
  };

  const handleRandomize = () => {
    sound.playTap();
    // Pick 2-3 random ingredients
    const shuffled = [...INGREDIENTS].sort(() => 0.5 - Math.random());
    const randomCount = Math.floor(Math.random() * 2) + 2;
    const pickedIngs = shuffled.slice(0, randomCount).map((i) => i.id);

    const randomMethod = COOKING_METHODS[Math.floor(Math.random() * COOKING_METHODS.length)].id;
    const randomSeasoning = SEASONING_BASES[Math.floor(Math.random() * SEASONING_BASES.length)].id;
    const randomPlating = PLATING_STYLES[Math.floor(Math.random() * PLATING_STYLES.length)].id;

    const newAmounts: Record<string, number> = {};
    pickedIngs.forEach((id) => {
      newAmounts[id] = Math.floor(Math.random() * 2) + 1;
    });

    setSelectedIngredients(pickedIngs);
    setIngredientAmounts(newAmounts);
    setSelectedMethodId(randomMethod);
    setSelectedSeasoningId(randomSeasoning);
    setSelectedPlatingId(randomPlating);
    setCustomDishName('');
    setHasTasted(false);
  };

  const handleSimulateCook = () => {
    sound.playCookSizzle();
    setIsCookingSim(true);
    setTimeout(() => {
      setIsCookingSim(false);
      setHasTasted(true);
      if (evalResult.discoveredSecret) {
        sound.playCelebration();
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF8C42', '#7CB342'],
        });
      } else {
        sound.playCashRegister();
      }
    }, 1200);
  };

  const handleCommitRecipe = () => {
    if (!canAffordCreation) {
      alert(`Quán không đủ tiền mặt! Cần $${evalResult.creationFee.toLocaleString()} để nghiên cứu & tạo món này.`);
      return;
    }

    const finalName = customDishName.trim() || evalResult.suggestedName;
    const finalIcon = customDishIcon || evalResult.suggestedIcon;
    const finalPrice = customSellPrice > 0 ? customSellPrice : evalResult.suggestedSellPrice;

    const newRecipeId = `recipe_custom_${Date.now()}`;
    const newRecipe: Recipe = {
      id: newRecipeId,
      name: finalName,
      customName: finalName,
      category: evalResult.suggestedCategory,
      icon: finalIcon,
      description: evalResult.discoveredSecret
        ? evalResult.discoveredSecret.description
        : `Món ăn độc quyền do Bếp trưởng sáng tạo từ ${selectedIngredients.length} nguyên liệu hảo hạng với phương pháp ${COOKING_METHODS.find((m) => m.id === selectedMethodId)?.name.toLowerCase()}.`,
      cookTime: evalResult.cookTime,
      costPrice: 0,
      sellPrice: finalPrice,
      unlocked: true,
      rarity: 'Rare',
      source: 'crafted',
      isSignature: true,
      signatureBonus: evalResult.discoveredSecret ? 25 : Math.round((evalResult.harmonyScore - 60) * 0.4),
      flavorNotes: 'Đậm đà chuẩn vị',
    };

    const rewardExp = evalResult.discoveredSecret ? evalResult.discoveredSecret.bonusExp : 80;
    const rewardCp = evalResult.discoveredSecret ? evalResult.discoveredSecret.bonusCp : 15;

    const commit = () => {
      sound.playCelebration();
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
      });
      onAddCustomRecipe(
        newRecipe,
        rewardExp,
        rewardCp,
        evalResult.creationFee,
        evalResult.discoveredSecret?.id
      );
      onClose();
    };

    // Low-graphic mode: kết thúc ngay không overlay sôi
    if (gameState.lowGraphicMode) {
      commit();
      return;
    }

    // Trình diễn: nồi sôi -> nắp văng -> món trồi lên -> ghi vào thực đơn
    setReveal({ icon: finalIcon, name: finalName });
    sound.playCookSizzle();
    setTimeout(() => {
      commit();
    }, 1900);
  };

  const discoveredCount = (gameState.discoveredSecretCombos || []).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#4A2E18]/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#FFFDF7] border-3 border-[#8B5A2B] rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] relative">
        {/* Overlay kết thúc sáng chế: nồi sôi & món trồi lên */}
        {reveal && (
          <div
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#23150A]/95 px-4 text-center"
            aria-label="Đang tạo món mới"
          >
            <div className="relative">
              {/* Bọt hơi đang sôi (tâm nồi) */}
              <span className="clb-steam clb-steam-1" aria-hidden="true" />
              <span className="clb-steam clb-steam-2" aria-hidden="true" />
              <span className="clb-steam clb-steam-3" aria-hidden="true" />
              {/* Nắp nồi văng khỏi miệng nồi */}
              <div className="clb-lid" aria-hidden="true" />
              <div className="text-8xl clb-pot select-none" aria-hidden="true">🍲</div>
              {/* Món trồi lên từ nồi */}
              <div className="absolute left-1/2 bottom-full mb-1 w-16 -ml-8 flex justify-center pointer-events-none">
                <div className="text-6xl drop-shadow-[0_0_18px_rgba(255,180,60,0.85)] clb-dish" aria-hidden="true">
                  {reveal.icon}
                </div>
              </div>
            </div>
            <h3 className="mt-14 text-lg sm:text-xl font-black text-[#FFE08A] clb-title-in">
              🍽️ {reveal.name}
            </h3>
            <p className="mt-1 text-xs text-amber-100/80">
              Tuyệt tác vừa ra lò — đang ghi vào Thực Đơn chính thức...
            </p>
            <div className="mt-3 h-1 w-40 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#FF8C42] to-[#FFC24D] clb-progress" />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-5 py-3.5 bg-[#FAF3E0] border-b-2 border-[#E6D5BC] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF8C42] to-[#D35400] text-white flex items-center justify-center text-xl shadow-sm">
              🧪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#8B5A2B] tracking-tight">
                  Bếp Sáng Tạo Món Tự Do
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#E67E22] text-white uppercase tracking-wider">
                  Culinary Sandbox
                </span>
              </div>
              <p className="text-xs text-[#8C6D53]">
                Tự do kết hợp nguyên liệu, lựa chọn kỹ thuật nấu & đưa món ký danh vào thực đơn!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle between Create and Secret Recipes Notebook */}
            <button
              onClick={() => {
                sound.playTap();
                setActiveSubView(activeSubView === 'create' ? 'secretBook' : 'create');
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all btn-tactile ${
                activeSubView === 'secretBook'
                  ? 'bg-[#D35400] text-white border-[#D35400] shadow-sm'
                  : 'bg-[#FFF8DC] text-[#8B5A2B] border-[#E6D5BC] hover:bg-[#FFE4B5]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sổ Tay Bí Truyền ({discoveredCount}/{SECRET_RECIPES.length})</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="p-1.5 rounded-full bg-[#FAF3E0] hover:bg-[#FFE4B5] text-[#8B5A2B] border border-[#E6D5BC] btn-tactile"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body View */}
        {activeSubView === 'secretBook' ? (
          /* Secret Book Subview */
          <div className="p-5 overflow-y-auto space-y-4">
            <div className="bg-[#FAF3E0] border border-[#E6D5BC] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#8B5A2B] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D35400]" />
                  9 Công Thức Ẩm Thực Bí Truyền Ẩn Giấu
                </h4>
                <p className="text-xs text-[#8C6D53] mt-0.5">
                  Kết hợp đúng các nguyên liệu then chốt cùng kỹ thuật và gia vị tương ứng để mở khóa và nhận lượng lớn EXP & CP!
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#D35400]">{discoveredCount}</span>
                <span className="text-xs text-[#8C6D53]"> / {SECRET_RECIPES.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SECRET_RECIPES.map((sec) => {
                const isDiscovered = (gameState.discoveredSecretCombos || []).includes(sec.id);
                return (
                  <div
                    key={sec.id}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isDiscovered
                        ? 'bg-[#FFFDF7] border-[#7CB342] shadow-sm'
                        : 'bg-[#F9F5EE] border-[#E6D5BC] opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{isDiscovered ? sec.icon : '❓'}</span>
                        <div>
                          <h5 className="text-xs sm:text-sm font-black text-[#8B5A2B]">
                            {isDiscovered ? sec.name : '??? Công Thức Bí Ẩn'}
                          </h5>
                          <span className="text-[10px] text-[#D35400] font-bold uppercase">
                            +{sec.bonusExp} EXP • +{sec.bonusCp} CP
                          </span>
                        </div>
                      </div>
                      {isDiscovered && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]">
                          Đã Khám Phá ✨
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8C6D53] mt-2 italic">
                      {isDiscovered
                        ? sec.description
                        : `Gợi ý: Hãy thử kết hợp ${sec.requiredIngredientIds
                            .map((id) => INGREDIENTS.find((i) => i.id === id)?.name || id)
                            .join(', ')}...`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Main Culinary Creator View */
          <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
            {/* Secret Recipe Matched Banner (If discovered!) */}
            {evalResult.discoveredSecret && (
              <div className="bg-gradient-to-r from-[#FFF8E7] via-[#FFF3D6] to-[#FFE8B8] border-2 border-[#D4AF37] rounded-2xl p-3.5 sm:p-4 shadow-md flex items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{evalResult.discoveredSecret.icon}</span>
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-[#D4AF37] text-white text-[10px] font-black rounded-md uppercase tracking-wider mb-0.5">
                      ✨ Tổ Hợp Bí Truyền Đỉnh Cao!
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-[#7A5812]">
                      {evalResult.discoveredSecret.name}
                    </h4>
                    <p className="text-xs text-[#8C6D53]">
                      Thưởng ngay: +{evalResult.discoveredSecret.bonusExp} EXP & +{evalResult.discoveredSecret.bonusCp} CP khi lưu vào thực đơn!
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="px-2.5 py-1 rounded-xl bg-[#2E7D32] text-white text-xs font-black shadow-sm">
                    Tuyệt Phẩm
                  </span>
                </div>
              </div>
            )}

            {/* Quick Helper / Randomize */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8B5A2B] flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-[#D35400]" />
                Bước 1: Chọn Nguyên Liệu Phối Hợp ({selectedIngredients.length}/5)
              </span>
              <button
                onClick={handleRandomize}
                className="px-2.5 py-1 rounded-lg bg-[#FAF3E0] hover:bg-[#FFE4B5] text-[#8B5A2B] border border-[#E6D5BC] text-xs font-bold flex items-center gap-1 btn-tactile"
                title="Gợi ý nguyên liệu và phương pháp ngẫu nhiên"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#D35400]" />
                <span>Gợi Ý Ngẫu Nhiên</span>
              </button>
            </div>

            {/* Step 1: Ingredient Selector Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {INGREDIENTS.map((ing) => {
                const isSelected = selectedIngredients.includes(ing.id);
                const currentQty = ingredientAmounts[ing.id] || 1;
                return (
                  <button
                    key={ing.id}
                    onClick={() => handleToggleIngredient(ing.id)}
                    className={`p-2 rounded-xl border-2 text-left transition-all btn-tactile relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#FFF8DC] border-[#D35400] text-[#8B5A2B] shadow-sm ring-2 ring-[#D35400]/20'
                        : 'bg-[#FFFDF7] border-[#E6D5BC] text-[#8C6D53] hover:border-[#D2B48C]'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1 right-1 px-1 py-0.5 rounded-full bg-[#D35400] text-white text-[9px] flex items-center justify-center font-black">
                        x{currentQty}
                      </span>
                    )}
                    <div className="text-2xl mb-1">{ing.icon}</div>
                    <div className="text-[11px] font-bold line-clamp-1">{ing.name}</div>
                    <div className="text-[10px] text-[#A0522D] font-semibold mt-0.5">
                      ${ing.basePrice} / {ing.unit}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Step 1.2: Config Quantities for Chosen Ingredients */}
            <div className="bg-[#FAF3E0] p-3.5 rounded-2xl border-2 border-[#E6D5BC]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
                <div>
                  <h5 className="text-xs font-black text-[#8B5A2B] flex items-center gap-1.5">
                    <span>⚖️</span>
                    <span>Định Lượng Số Lượng Nguyên Liệu Cho Món ({selectedIngredients.length} nguyên liệu)</span>
                  </h5>
                  <p className="text-[11px] text-[#8C6D53]">
                    Chỉnh số lượng từng loại. Phí tạo món & lượng nguyên liệu đầu bếp dùng để nấu sau này sẽ tính đúng theo định lượng này!
                  </p>
                </div>
                <span className="text-xs font-black text-[#D35400] bg-[#FFF8DC] px-2.5 py-1 rounded-lg border border-[#E6D5BC] self-start sm:self-auto">
                  Tổng vốn nguyên liệu: ${evalResult.rawIngredientsCost}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedIngredients.map((id) => {
                  const ing = INGREDIENTS.find((i) => i.id === id);
                  if (!ing) return null;
                  const qty = ingredientAmounts[id] || 1;
                  const inStock = gameState.inventory[id] || 0;
                  const subtotal = ing.basePrice * qty;

                  return (
                    <div
                      key={id}
                      className="bg-[#FFFDF7] p-2.5 rounded-xl border border-[#E6D5BC] flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-2xl shrink-0">{ing.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#5C3A21] truncate">{ing.name}</div>
                          <div className="text-[10px] text-[#8C6D53] flex items-center gap-1.5">
                            <span>${ing.basePrice}/{ing.unit}</span>
                            <span>&bull;</span>
                            <span className={inStock >= qty ? 'text-[#2E7D32] font-semibold' : 'text-[#C0392B] font-semibold'}>
                              Kho: {inStock}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-[#FAF3E0] rounded-lg border border-[#E6D5BC] p-0.5">
                          <button
                            disabled={qty <= 1}
                            onClick={() => handleUpdateAmount(id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-[#8B5A2B] hover:bg-[#FFE4B5] disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Giảm 1 phần"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-black text-xs text-[#D35400]">
                            x{qty}
                          </span>
                          <button
                            disabled={qty >= 5}
                            onClick={() => handleUpdateAmount(id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-[#8B5A2B] hover:bg-[#FFE4B5] disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Tăng 1 phần"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right min-w-[42px]">
                          <span className="text-xs font-black text-[#8B5A2B] block">${subtotal}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2 & 3: Cooking Method & Seasoning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cooking Method */}
              <div className="bg-[#FAF3E0]/60 p-3.5 rounded-2xl border border-[#E6D5BC]">
                <label className="text-xs font-bold text-[#8B5A2B] block mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#D35400]" />
                  Bước 2: Phương Pháp Nấu Nướng
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COOKING_METHODS.map((method) => {
                    const isPicked = selectedMethodId === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => {
                          sound.playTap();
                          setSelectedMethodId(method.id);
                          setHasTasted(false);
                        }}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all btn-tactile flex items-start gap-2 ${
                          isPicked
                            ? 'bg-[#FFF8DC] border-[#D35400] text-[#8B5A2B] shadow-xs'
                            : 'bg-[#FFFDF7] border-[#E6D5BC] text-[#8C6D53] hover:bg-[#F5E8D3]'
                        }`}
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <span className="text-xs font-bold block leading-tight">{method.name}</span>
                          <span className="text-[10px] text-[#A0522D] font-medium">{method.cookTime}s • Wok/Lửa</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seasoning Base */}
              <div className="bg-[#FAF3E0]/60 p-3.5 rounded-2xl border border-[#E6D5BC]">
                <label className="text-xs font-bold text-[#8B5A2B] block mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D35400]" />
                  Bước 3: Gia Vị & Nước Sốt Ký Danh
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SEASONING_BASES.map((sauce) => {
                    const isPicked = selectedSeasoningId === sauce.id;
                    return (
                      <button
                        key={sauce.id}
                        onClick={() => {
                          sound.playTap();
                          setSelectedSeasoningId(sauce.id);
                          setHasTasted(false);
                        }}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all btn-tactile flex items-start gap-2 ${
                          isPicked
                            ? 'bg-[#FFF8DC] border-[#D35400] text-[#8B5A2B] shadow-xs'
                            : 'bg-[#FFFDF7] border-[#E6D5BC] text-[#8C6D53] hover:bg-[#F5E8D3]'
                        }`}
                      >
                        <span className="text-2xl">{sauce.icon}</span>
                        <div>
                          <span className="text-xs font-bold block leading-tight">{sauce.name.split('&')[0]}</span>
                          <span className="text-[10px] text-[#A0522D] font-medium">+${sauce.cost} vốn</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 4: Plating Style */}
            <div className="bg-[#FAF3E0]/60 p-3.5 rounded-2xl border border-[#E6D5BC]">
              <label className="text-xs font-bold text-[#8B5A2B] block mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#D35400]" />
                Bước 4: Phong Cách Trình Bày & Bày Đĩa
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PLATING_STYLES.map((plate) => {
                  const isPicked = selectedPlatingId === plate.id;
                  return (
                    <button
                      key={plate.id}
                      onClick={() => {
                        sound.playTap();
                        setSelectedPlatingId(plate.id);
                        setHasTasted(false);
                      }}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all btn-tactile ${
                        isPicked
                          ? 'bg-[#FFF8DC] border-[#D35400] text-[#8B5A2B] shadow-xs'
                          : 'bg-[#FFFDF7] border-[#E6D5BC] text-[#8C6D53] hover:bg-[#F5E8D3]'
                      }`}
                    >
                      <span className="text-xl block mb-1">{plate.icon}</span>
                      <span className="text-xs font-bold block leading-tight">{plate.name}</span>
                      <span className="text-[10px] text-[#7CB342] font-black block mt-0.5">
                        +{Math.round((plate.prestigeMultiplier - 1) * 100)}% Giá bán
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flavor Chemistry Analysis & Tasting Simulation */}
            <div className="bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6D5BC] mb-3">
                <div>
                  <h4 className="text-sm font-black text-[#8B5A2B] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D35400]" />
                    Phân Tích Hóa Học Vị Giác (Flavor Chemistry)
                  </h4>
                  <p className="text-xs text-[#8C6D53]">
                    Điểm Hài Hòa: <strong className="text-[#D35400] font-black">{evalResult.harmonyScore}/100</strong>
                  </p>
                </div>

                <button
                  onClick={handleSimulateCook}
                  disabled={isCookingSim}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D35400] to-[#E67E22] hover:from-[#BA4A00] hover:to-[#D35400] text-white text-xs font-black shadow-sm btn-tactile flex items-center gap-1.5"
                >
                  <Flame className={`w-3.5 h-3.5 ${isCookingSim ? 'animate-spin' : ''}`} />
                  <span>{isCookingSim ? 'Đang Nấu Thử Nghiệm...' : '🍳 Nấu Thử & Nếm Vị'}</span>
                </button>
              </div>

              {/* Flavor Profile Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                {/* Umami */}
                <div className="bg-[#FAF3E0] p-2 rounded-xl border border-[#E6D5BC]">
                  <div className="flex justify-between font-bold text-[#8B5A2B] text-[11px] mb-1">
                    <span>Đậm Đà (Umami)</span>
                    <span className="text-[#D35400]">{evalResult.flavorProfile.umami}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E6D5BC] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D35400] rounded-full" style={{ width: `${evalResult.flavorProfile.umami}%` }} />
                  </div>
                </div>

                {/* Spicy */}
                <div className="bg-[#FAF3E0] p-2 rounded-xl border border-[#E6D5BC]">
                  <div className="flex justify-between font-bold text-[#8B5A2B] text-[11px] mb-1">
                    <span>Cay Nồng (Spicy)</span>
                    <span className="text-[#C0392B]">{evalResult.flavorProfile.spicy}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E6D5BC] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C0392B] rounded-full" style={{ width: `${evalResult.flavorProfile.spicy}%` }} />
                  </div>
                </div>

                {/* Aroma */}
                <div className="bg-[#FAF3E0] p-2 rounded-xl border border-[#E6D5BC]">
                  <div className="flex justify-between font-bold text-[#8B5A2B] text-[11px] mb-1">
                    <span>Hương Thơm (Aroma)</span>
                    <span className="text-[#7CB342]">{evalResult.flavorProfile.aroma}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E6D5BC] rounded-full overflow-hidden">
                    <div className="h-full bg-[#7CB342] rounded-full" style={{ width: `${evalResult.flavorProfile.aroma}%` }} />
                  </div>
                </div>

                {/* Crunch */}
                <div className="bg-[#FAF3E0] p-2 rounded-xl border border-[#E6D5BC]">
                  <div className="flex justify-between font-bold text-[#8B5A2B] text-[11px] mb-1">
                    <span>Độ Giòn (Crunch)</span>
                    <span className="text-[#E67E22]">{evalResult.flavorProfile.crunch}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E6D5BC] rounded-full overflow-hidden">
                    <div className="h-full bg-[#E67E22] rounded-full" style={{ width: `${evalResult.flavorProfile.crunch}%` }} />
                  </div>
                </div>
              </div>

              {/* Chef Tasting Note */}
              <div className="p-3 rounded-xl bg-[#FFF8DC] border border-[#E6D5BC] text-xs text-[#8B5A2B] italic flex items-start gap-2">
                <span className="text-xl not-italic">👨‍🍳</span>
                <p>{evalResult.tastingReview}</p>
              </div>
            </div>

            {/* Step 5: Finalize Dish Name, Icon, Selling Price & Menu Integration */}
            <div className="bg-[#FAF3E0] p-4 rounded-2xl border-2 border-[#E6D5BC] space-y-3">
              <h4 className="text-xs sm:text-sm font-black text-[#8B5A2B] flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#7CB342]" />
                Bước 5: Định Danh & Đưa Vào Thực Đơn Chính Thức
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Dish Name */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-[#8B5A2B] block mb-1">
                    Tên Món Ăn Sáng Tạo Của Bạn:
                  </label>
                  <input
                    type="text"
                    value={customDishName || evalResult.suggestedName}
                    onChange={(e) => setCustomDishName(e.target.value)}
                    className="w-full bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-xl px-3 py-2 text-xs font-bold text-[#5C3A21] outline-none focus:border-[#D35400]"
                    placeholder="Nhập tên món ăn độc quyền..."
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="text-[11px] font-bold text-[#8B5A2B] block mb-1">
                    Giá Bán ($) (Vốn: ${evalResult.costPrice}):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={evalResult.costPrice}
                      value={customSellPrice || evalResult.suggestedSellPrice}
                      onChange={(e) => setCustomSellPrice(Math.max(evalResult.costPrice, parseInt(e.target.value) || 0))}
                      className="w-full bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-xl px-3 py-2 text-xs font-black text-[#2E7D32] outline-none focus:border-[#D35400]"
                    />
                    <span className="absolute right-3 top-2 text-xs text-[#8C6D53] font-bold">
                      Lãi +{Math.round((((customSellPrice || evalResult.suggestedSellPrice) - evalResult.costPrice) / evalResult.costPrice) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="text-[11px] font-bold text-[#8B5A2B] block mb-1">
                  Chọn Biểu Tượng Món Ăn:
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => {
                        sound.playTap();
                        setCustomDishIcon(ic);
                      }}
                      className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center shrink-0 border transition-all btn-tactile ${
                        (customDishIcon || evalResult.suggestedIcon) === ic
                          ? 'bg-[#FFE4B5] border-[#D35400] shadow-xs'
                          : 'bg-[#FFFDF7] border-[#E6D5BC] hover:bg-[#F5E8D3]'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Creation Fee & Kitchen Warehouse Cooking Notice */}
              <div className="bg-[#FFFDF7] p-3.5 rounded-xl border-2 border-[#D2691E]/30 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-[#8B5A2B] flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#D35400]" />
                      Chi Phí Nghiên Cứu & Tạo Món Mới:
                    </span>
                    <span className="text-[11px] text-[#8C6D53]">
                      Tính từ giá nguyên liệu (theo số lượng) + gia vị/nước sốt + bày đĩa
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-[#8C6D53]">Tiền mặt quán có:</div>
                      <div className="text-xs font-black text-[#5C3A21]">${gameState.cash.toLocaleString()}</div>
                    </div>
                    <div className="text-right pl-3 border-l border-[#E6D5BC]">
                      <div className="text-[10px] text-[#8C6D53]">Phí tạo món:</div>
                      <div className="text-sm sm:text-base font-black text-[#D35400]">-${evalResult.creationFee.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Fee Breakdown Pills */}
                <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-[#8C6D53] bg-[#FAF3E0] p-2 rounded-lg border border-[#E6D5BC]">
                  <span>Nguyên liệu (theo lượng): <strong className="text-[#8B5A2B]">${evalResult.rawIngredientsCost}</strong></span>
                  <span>&bull;</span>
                  <span>Gia vị & sốt: <strong className="text-[#8B5A2B]">${evalResult.seasoningCost}</strong></span>
                  <span>&bull;</span>
                  <span>Trình bày & đĩa: <strong className="text-[#8B5A2B]">${evalResult.platingCost}</strong></span>
                  <span>&bull;</span>
                  <span>Giá vốn nấu mỗi suất: <strong className="text-[#2E7D32]">${evalResult.costPrice}</strong></span>
                </div>

                {/* Cash Check Warning if cannot afford */}
                {!canAffordCreation ? (
                  <div className="p-2.5 rounded-lg bg-[#FFEBEE] border border-[#FFCDD2] text-xs text-[#C62828] font-bold flex items-center gap-2">
                    <span>⚠️</span>
                    <span>
                      Quán không đủ tiền mặt! Bạn cần thêm ${(evalResult.creationFee - gameState.cash).toLocaleString()} để nghiên cứu món này. Hãy phục vụ thêm khách để kiếm đủ tiền!
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9] text-xs text-[#2E7D32] flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>
                      Quán đủ điều kiện chi trả! Tiền mặt sau khi tạo món sẽ còn: ${(gameState.cash - evalResult.creationFee).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Chef Kitchen Cooking Notice */}
                <div className="p-2.5 rounded-lg bg-[#FFF8DC] border border-[#E6D5BC] text-[11px] text-[#8B5A2B] flex items-start gap-2">
                  <ChefHat className="w-4 h-4 text-[#D35400] shrink-0 mt-0.5" />
                  <span>
                    <strong>Cơ chế đầu bếp nấu:</strong> Sau khi tạo xong, món sẽ xuất hiện trên thực đơn. Mỗi lần khách đặt món, đầu bếp trong bếp sẽ sử dụng và trừ đúng các nguyên liệu trên trong kho (theo đúng số lượng x{selectedIngredients.map((id) => `${ingredientAmounts[id] || 1} ${INGREDIENTS.find(i => i.id === id)?.name || id}`).join(', ')}).
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  disabled={!canAffordCreation}
                  onClick={handleCommitRecipe}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-md btn-tactile flex items-center justify-center gap-2 transition-all ${
                    canAffordCreation
                      ? 'bg-gradient-to-r from-[#2E7D32] to-[#43A047] hover:from-[#1B5E20] hover:to-[#2E7D32] text-white cursor-pointer'
                      : 'bg-[#D7CCC8] text-[#8D6E63] cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {canAffordCreation
                      ? `Trả $${evalResult.creationFee.toLocaleString()} & Đưa Vào Thực Đơn (+${evalResult.discoveredSecret ? evalResult.discoveredSecret.bonusExp : 80} EXP)`
                      : `Không Đủ Tiền Tạo Món (Cần $${evalResult.creationFee.toLocaleString()})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
