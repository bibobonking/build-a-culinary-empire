import React, { useState } from 'react';
import { GameState, IngredientItem, RecipeRarity } from '../../types';
import { INGREDIENTS, SEASONAL_EVENTS } from '../../data/gameData';
import { calculateTotalLuck, getCraftingProbabilities } from '../../utils/crafting';
import { sound } from '../../utils/sound';

interface CraftingTabProps {
  gameState: GameState;
  onCraftRecipe: (selectedIngredientIds: string[]) => void;
  onOpenCulinaryLab?: () => void;
}

export const CraftingTab: React.FC<CraftingTabProps> = ({
  gameState,
  onCraftRecipe,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCrafting, setIsCrafting] = useState<boolean>(false);

  // Get full ingredient items for selected IDs
  const selectedItems: IngredientItem[] = selectedIds
    .map((id) => INGREDIENTS.find((i) => i.id === id))
    .filter((i): i is IngredientItem => Boolean(i));

  // Compute total luck (bao gồm boost may mắn theo mùa/lễ hội đang diễn ra)
  const seasonDef = SEASONAL_EVENTS[gameState.season] || SEASONAL_EVENTS.spring;
  const luckData = calculateTotalLuck(
    selectedItems,
    gameState.equipment,
    gameState.restaurantLevel,
    seasonDef.craftingLuck
  );

  // Compute real-time probabilities
  const probabilities = getCraftingProbabilities(luckData.totalLuck);

  // Add ingredient to cauldron
  const handleSelectIngredient = (ingredientId: string) => {
    const currentOwned = gameState.inventory[ingredientId] || 0;
    const currentlySelectedCount = selectedIds.filter((id) => id === ingredientId).length;

    if (currentlySelectedCount >= currentOwned) {
      sound.playWarning();
      return;
    }

    if (selectedIds.length >= 4) {
      sound.playWarning();
      return;
    }

    sound.playTap();
    setSelectedIds([...selectedIds, ingredientId]);
  };

  // Remove ingredient from cauldron
  const handleRemoveSlot = (index: number) => {
    sound.playTap();
    const next = [...selectedIds];
    next.splice(index, 1);
    setSelectedIds(next);
  };

  // Trigger Craft
  const handleStartCrafting = () => {
    if (selectedIds.length < 2) return;

    setIsCrafting(true);
    sound.playCooking();

    setTimeout(() => {
      onCraftRecipe(selectedIds);
      setSelectedIds([]);
      setIsCrafting(false);
    }, 1200);
  };

  // Filter owned ingredients with stock > 0
  const ownedIngredients = INGREDIENTS.filter(
    (item) => (gameState.inventory[item.id] || 0) > 0
  );

  // Recipe rarity stats count
  const unlockedRecipes = gameState.recipes.filter((r) => r.unlocked);
  const rarityStats: Record<RecipeRarity, number> = {
    Rare: unlockedRecipes.filter((r) => r.rarity === 'Rare').length,
    Epic: unlockedRecipes.filter((r) => r.rarity === 'Epic').length,
    Legendary: unlockedRecipes.filter((r) => r.rarity === 'Legendary').length,
    Mythical: unlockedRecipes.filter((r) => r.rarity === 'Mythical').length,
    Secret: unlockedRecipes.filter((r) => r.rarity === 'Secret').length,
  };

  return (
    <div className="space-y-5">
      {/* Top Banner: How Crafting Works */}
      <div className="bg-gradient-to-r from-[#FFF8E7] via-[#FFF3D6] to-[#FFE8B8] border-2 border-[#E6D5BC] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E67E22]/15 border border-[#E67E22]/30 flex items-center justify-center text-3xl">
            ⚗️
          </div>
          <div>
            <h3 className="text-base font-black text-[#5C3A21]">
              Bếp Sáng Chế & Lai Ghép Nguyên Liệu
            </h3>
            <p className="text-xs text-[#8C6D53]">
              Chọn từ 2 đến 4 nguyên liệu trong kho để kết hợp. Nguyên liệu càng hiếm & thiết bị càng cao cấp sẽ tăng vọt chỉ số May Mắn để ra món <strong className="text-amber-700">Legendary, Mythical, Secret</strong>!
            </p>
          </div>
        </div>

        {/* Collection Codex Counter */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-[#E6D5BC] shadow-inner flex-wrap justify-center">
          <span className="text-[10px] font-bold text-gray-500 mr-1">Bộ sưu tập:</span>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
            Rare {rarityStats.Rare}
          </span>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
            Epic {rarityStats.Epic}
          </span>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
            Leg {rarityStats.Legendary}
          </span>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
            Myth {rarityStats.Mythical}
          </span>
          <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-200">
            Secret {rarityStats.Secret}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: FUSION CAULDRON & LUCK METER (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Fusion Slots Stage */}
          <div className="bg-[#FFFDF7] rounded-2xl border-2 border-[#E6D5BC] p-4 sm:p-5 shadow-sm">
            <h4 className="text-xs font-black uppercase text-[#8C6D53] tracking-wider mb-3 flex items-center justify-between">
              <span>Nồi Nấu Sáng Chế (Chọn 2 - 4 Món)</span>
              <span className="text-[11px] font-bold text-emerald-700">
                Đã chọn: {selectedIds.length}/4
              </span>
            </h4>

            {/* 4 Cauldron Slots - 4 in one row on mobile for compact view */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-3 mb-3 sm:mb-4">
              {[0, 1, 2, 3].map((slotIdx) => {
                const item = selectedItems[slotIdx];

                return (
                  <div
                    key={slotIdx}
                    onClick={() => item && handleRemoveSlot(slotIdx)}
                    className={`h-20 sm:h-28 rounded-2xl border-2 flex flex-col items-center justify-center p-1 sm:p-2 text-center transition-all cursor-pointer relative ${
                      item
                        ? 'bg-[#FFF8DC] border-[#E67E22] shadow-sm hover:border-rose-400 group'
                        : 'bg-[#FAF3E0]/60 border-dashed border-[#D4C3A3] text-gray-400 hover:bg-[#FAF3E0]'
                    }`}
                  >
                    {item ? (
                      <>
                        <div className="text-xl sm:text-3xl mb-0.5 sm:mb-1 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <div className="text-[10px] sm:text-xs font-black text-[#5C3A21] line-clamp-1">
                          {item.name}
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 leading-none mt-0.5">
                          +{item.luckBonus}%
                        </span>
                        <div className="absolute top-1 right-1 opacity-80 sm:opacity-0 group-hover:opacity-100 bg-rose-500 text-white w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black transition-opacity">
                          ✕
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-lg sm:text-2xl opacity-40 mb-0.5 sm:mb-1">➕</span>
                        <span className="text-[9px] sm:text-[11px] font-bold text-[#A08875]">
                          Ô {slotIdx + 1}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Live Luck Gauge & Breakdown */}
            <div className="bg-[#FFF8E7] rounded-xl p-3.5 border border-[#E6D5BC] mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#5C3A21] flex items-center gap-1.5">
                  <span>🍀</span>
                  <span>Tổng Chỉ Số May Mắn Tinh Hoa:</span>
                </span>
                <span className="text-base font-black text-[#E67E22]">
                  {luckData.totalLuck}%
                </span>
              </div>

              {/* Luck Breakdown Pills */}
              <div className="flex items-center gap-2 text-[10px] text-[#8C6D53] flex-wrap mb-3">
                <span className="bg-white px-2 py-0.5 rounded-md border border-[#E6D5BC]">
                  Cơ bản: +{luckData.baseLuck}%
                </span>
                <span className="bg-white px-2 py-0.5 rounded-md border border-[#E6D5BC]">
                  Nguyên liệu: +{luckData.ingredientLuck}%
                </span>
                <span className="bg-white px-2 py-0.5 rounded-md border border-[#E6D5BC]">
                  Thiết bị: +{luckData.equipmentLuck}%
                </span>
                <span className="bg-white px-2 py-0.5 rounded-md border border-[#E6D5BC]">
                  Cấp nhà hàng: +{luckData.tierLuck}%
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md border ${
                    luckData.seasonLuck > 0
                      ? 'bg-amber-50 border-amber-300 text-amber-800 font-black'
                      : 'bg-white border-[#E6D5BC]'
                  }`}
                  title={`${seasonDef.name}: ${seasonDef.description}`}
                >
                  {seasonDef.icon} {seasonDef.name}: +{luckData.seasonLuck}%
                </span>
              </div>

              {/* Dynamic Probability Bars */}
              <div className="space-y-1.5 pt-2 border-t border-[#E6D5BC]/60">
                <div className="text-[11px] font-bold text-[#5C3A21] mb-1">
                  Tỉ lệ ra độ hiếm công thức:
                </div>

                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-black">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-1 text-blue-700">
                    <div>Rare</div>
                    <div className="text-xs">{probabilities.rare}%</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-1 text-purple-700">
                    <div>Epic</div>
                    <div className="text-xs">{probabilities.epic}%</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-1 text-amber-700">
                    <div>Legend</div>
                    <div className="text-xs">{probabilities.legendary}%</div>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-1 text-rose-700">
                    <div>Mythic</div>
                    <div className="text-xs">{probabilities.mythical}%</div>
                  </div>
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-1 text-pink-700">
                    <div>Secret</div>
                    <div className="text-xs">{probabilities.secret}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Big Craft Button */}
            <button
              onClick={handleStartCrafting}
              disabled={selectedIds.length < 2 || isCrafting}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base transition-all btn-tactile flex items-center justify-center gap-2 border shadow-md ${
                selectedIds.length >= 2 && !isCrafting
                  ? 'bg-gradient-to-r from-[#E67E22] via-[#F39C12] to-[#E67E22] text-white border-[#D35400] hover:brightness-105 active:scale-98'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
            >
              {isCrafting ? (
                <>
                  <span className="animate-spin text-xl">🌀</span>
                  <span>Đang hòa trộn tinh hoa ẩm thực...</span>
                </>
              ) : selectedIds.length < 2 ? (
                <>
                  <span>⚠️</span>
                  <span>Chọn ít nhất 2 nguyên liệu để sáng chế</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Sáng Chế Công Thức Mới Ngay!</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: INVENTORY INGREDIENT PICKER (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FFFDF7] rounded-2xl border-2 border-[#E6D5BC] p-4 shadow-sm">
            <h4 className="text-xs font-black uppercase text-[#8C6D53] tracking-wider mb-2 flex items-center justify-between">
              <span>Kho Nguyên Liệu Của Bạn</span>
              <span className="text-[11px] font-bold text-emerald-700">
                {ownedIngredients.length} loại có sẵn
              </span>
            </h4>
            <p className="text-[11px] text-[#8C6D53] mb-3">
              Nhấp vào nguyên liệu để đưa vào nồi sáng chế:
            </p>

            {ownedIngredients.length === 0 ? (
              <div className="bg-[#FAF3E0] rounded-xl p-6 text-center border border-dashed border-[#D4C3A3]">
                <div className="text-3xl mb-2">🥬</div>
                <h5 className="text-xs font-black text-[#5C3A21] mb-1">
                  Kho nguyên liệu đang trống
                </h5>
                <p className="text-[11px] text-[#8C6D53]">
                  Hãy ghé qua Chợ Nguyên Liệu để mua thêm nguyên liệu tươi ngon nhé!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
                {ownedIngredients.map((item) => {
                  const totalOwned = gameState.inventory[item.id] || 0;
                  const selectedCount = selectedIds.filter((id) => id === item.id).length;
                  const remainingAvailable = totalOwned - selectedCount;
                  const isAvailable = remainingAvailable > 0 && selectedIds.length < 4;

                  return (
                    <button
                      key={item.id}
                      onClick={() => isAvailable && handleSelectIngredient(item.id)}
                      disabled={!isAvailable}
                      className={`p-2.5 rounded-xl border-2 flex items-center gap-2 text-left transition-all btn-tactile ${
                        isAvailable
                          ? 'bg-white hover:bg-[#FFF8DC] border-[#E6D5BC] shadow-sm'
                          : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-2xl flex-shrink-0">{item.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-[#5C3A21] truncate">
                          {item.name}
                        </div>
                        <div className="flex items-center justify-between text-[10px] mt-0.5">
                          <span className="font-bold text-amber-700">
                            Còn: {remainingAvailable}
                          </span>
                          <span className="text-emerald-700 font-bold">
                            +{item.luckBonus}% Luck
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
