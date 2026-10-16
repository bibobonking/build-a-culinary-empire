import React, { useState } from 'react';
import { GameState, Recipe, RecipeRarity } from '../../types';
import { RARITY_THEME_COLORS } from '../../data/recipeDatabase';
import { sound } from '../../utils/sound';
import { fx } from '../../utils/fx';
import { Trash2, X, Copy } from 'lucide-react';

interface CookingTabProps {
  gameState: GameState;
  onManualCook: (recipeId: string, amount: number) => void;
  onDeleteRecipe?: (recipeId: string) => void;
  onCleanDuplicates?: () => void;
  onOpenCraftingTab: () => void;
}

export const CookingTab: React.FC<CookingTabProps> = ({
  gameState,
  onManualCook,
  onDeleteRecipe,
  onCleanDuplicates,
  onOpenCraftingTab,
}) => {
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  const unlockedRecipes = gameState.recipes.filter((r) => r.unlocked);
  const duplicateTotal = unlockedRecipes.reduce((a, r) => a + Math.max(0, (r.count || 1) - 1), 0);

  const filteredRecipes = unlockedRecipes.filter((r) => {
    if (filterRarity === 'all') return true;
    return r.rarity === filterRarity;
  });

  // Calculate total ready dishes on the serving buffet counter
  const totalCookedPlates = Object.values(gameState.cookedDishes).reduce((a, b) => a + b, 0);

  const handleConfirmDelete = () => {
    if (!recipeToDelete || !onDeleteRecipe) return;
    onDeleteRecipe(recipeToDelete.id);
    setRecipeToDelete(null);
  };

  // Xóa nhanh 1 bản: còn >1 bản thì xóa luôn không cần modal; bản cuối thì hỏi xác nhận
  const handleQuickDelete = (recipe: Recipe) => {
    if (!onDeleteRecipe) return;
    if ((recipe.count || 1) > 1) {
      onDeleteRecipe(recipe.id);
      const cpRefund =
        recipe.rarity === 'Secret' ? 150 : recipe.rarity === 'Mythical' ? 75 : recipe.rarity === 'Legendary' ? 35 : recipe.rarity === 'Epic' ? 15 : 6;
      fx.toast({
        kind: 'success',
        icon: '🗑️',
        title: 'Đã thu hồi 1 bản công thức',
        text: `${recipe.icon} ${recipe.name} • +${cpRefund} CP & +$${Math.round(recipe.sellPrice * 0.25).toLocaleString()}`,
      });
    } else {
      // Bản cuối cùng: cần xác nhận vì món sẽ bị khóa khỏi thực đơn
      setRecipeToDelete(recipe);
    }
  };

  const handleCleanAllDuplicates = () => {
    if (!onCleanDuplicates) return;
    sound.playCashRegister();
    onCleanDuplicates();
    fx.toast({
      kind: 'success',
      icon: '🧺',
      title: 'Đã dọn toàn bộ bản trùng!',
      text: `Giữ lại 1 bản của mỗi món • Thanh lý ${duplicateTotal} bản trùng, nhận tiền & CP hoàn lại`,
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Section: Quầy Ra Món & Trạm Nấu Đang Chạy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Quầy Ra Món Buffet (Serving Counter) */}
        <div className="lg:col-span-6 bg-gradient-to-r from-[#FFF8E7] via-[#FFF3D6] to-[#FFE8B8] border-2 border-[#E6D5BC] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-pulse">♨️</span>
                <h3 className="text-sm sm:text-base font-black text-[#5C3A21]">
                  Quầy Ra Món & Tủ Giữ Nhiệt
                </h3>
              </div>
              <span className="bg-[#E67E22] text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-sm">
                Sẵn sàng: {totalCookedPlates} Suất
              </span>
            </div>
            <p className="text-xs text-[#8C6D53] mb-3">
              Món ăn nấu chín sẽ được giữ nóng tại đây. Khi khách ngồi vào bàn, nhân viên phục vụ sẽ bưng ra ngay tức thì để thu tiền và nhận đánh giá 5 sao!
            </p>

            {/* List of Cooked Dishes on Counter */}
            {totalCookedPlates === 0 ? (
              <div className="bg-white/80 rounded-xl p-3 text-center border border-dashed border-[#D4C3A3] text-xs text-[#8C6D53]">
                Chưa có món nào trên quầy. Hãy tự tay nấu hoặc để đầu bếp chuẩn bị nhé!
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {Object.entries(gameState.cookedDishes)
                  .filter(([_, count]) => count > 0)
                  .map(([recipeId, count]) => {
                    const rec = gameState.recipes.find((r) => r.id === recipeId);
                    if (!rec) return null;

                    return (
                      <div
                        key={recipeId}
                        className="bg-white rounded-xl p-2 border border-[#E6D5BC] shadow-xs flex items-center gap-2 flex-shrink-0"
                      >
                        <span className="text-xl">{rec.icon}</span>
                        <div className="text-left">
                          <div className="text-xs font-black text-[#5C3A21] max-w-[110px] truncate">
                            {rec.name}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-bold">
                            {count} dĩa &bull; +${rec.sellPrice.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Trạm Nấu Đang Hoạt Động (Active Cooking Batches) */}
        <div className="lg:col-span-6 bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-spin">🍳</span>
                <h3 className="text-sm sm:text-base font-black text-[#5C3A21]">
                  Bếp Nấu Đang Cháy Lửa ({gameState.cookingBatches.length} Mẻ)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-[#8C6D53]">
                Nấu MIỄN PHÍ &bull; Không tốn nguyên liệu
              </span>
            </div>

            {gameState.cookingBatches.length === 0 ? (
              <div className="bg-[#FAF3E0] rounded-xl p-4 text-center border border-dashed border-[#D4C3A3] text-xs text-[#8C6D53]">
                Bếp đang rảnh rỗi. Chọn món bên dưới và nhấp <strong>"Tự Tay Nấu Món"</strong> để khởi động bếp ngay!
              </div>
            ) : (
              <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                {gameState.cookingBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="bg-[#FFF8E7] rounded-xl p-2 border border-[#E6D5BC] flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg flex-shrink-0">{batch.recipeIcon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-[#5C3A21] truncate">
                          {batch.recipeName}
                        </div>
                        <div className="text-[10px] text-[#8C6D53]">
                          {batch.isManual ? 'Tự tay nấu' : 'Đầu bếp chuẩn bị'} &bull; Còn {batch.remainingTime}s
                        </div>
                      </div>
                    </div>

                    <div className="w-24 bg-gray-200 rounded-full h-2.5 overflow-hidden flex-shrink-0">
                      <div
                        className="bg-[#E67E22] h-2.5 transition-all duration-300 rounded-full"
                        style={{ width: `${batch.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Cookbook & Unlocked Recipes */}
      <div className="bg-[#FFFDF7] rounded-2xl border-2 border-[#E6D5BC] p-4 sm:p-5 shadow-sm space-y-4">
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-3 border-b border-[#F0E6D2]">
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#5C3A21] flex items-center gap-2">
              <span>📖</span>
              <span>Sổ Tay Thực Đơn ({unlockedRecipes.length} Món)</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-[#8C6D53]">
              Công thức cùng loại tự gộp. Nấu món miễn phí không tốn nguyên liệu!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
            {duplicateTotal > 0 && onCleanDuplicates && (
              <button
                onClick={handleCleanAllDuplicates}
                className="w-full sm:w-auto justify-center px-3 py-2 bg-[#FFF8DC] text-[#8B5A2B] rounded-xl font-bold text-xs shadow-sm hover:bg-[#FFE4B5] transition-all btn-tactile flex items-center gap-1.5 border border-[#E6D5BC] text-center"
                title="Giữ lại 1 bản mỗi món, thanh lý toàn bộ bản trùng để nhận lại tiền & CP"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Dọn {duplicateTotal} Bản Trùng</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playTap();
                onOpenCraftingTab();
              }}
              className="w-full sm:w-auto justify-center px-3.5 py-2 bg-gradient-to-r from-[#E67E22] to-[#F39C12] text-white rounded-xl font-bold text-xs shadow-sm hover:brightness-105 active:scale-95 transition-all btn-tactile flex items-center gap-1.5 border border-[#D35400] text-center"
            >
              <span>⚗️</span>
              <span>Đến Bếp Sáng Chế Món Mới</span>
            </button>
          </div>
        </div>

        {/* Filter Rarity Bar (Swipeable on touch devices) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 touch-pan-x">
          {['all', 'Rare', 'Epic', 'Legendary', 'Mythical', 'Secret'].map((rarity) => (
            <button
              key={rarity}
              onClick={() => {
                sound.playTap();
                setFilterRarity(rarity);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 btn-tactile ${
                filterRarity === rarity
                  ? 'bg-[#5C3A21] text-white border-[#3E2716] shadow-sm'
                  : 'bg-white text-[#8C6D53] border-[#E6D5BC] hover:bg-[#FAF3E0]'
              }`}
            >
              {rarity === 'all' ? '🔍 Tất Cả' : rarity}
            </button>
          ))}
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="bg-[#FAF3E0] rounded-xl p-8 text-center border border-dashed border-[#D4C3A3]">
            <div className="text-3xl mb-2">🍽️</div>
            <h5 className="text-sm font-black text-[#5C3A21] mb-1">
              Chưa có món nào thuộc danh mục này
            </h5>
            <p className="text-xs text-[#8C6D53] mb-3">
              Hãy ghé qua Bếp Sáng Chế hoặc Mở Hộp FoodBox để mở thêm nhiều công thức siêu cấp nhé!
            </p>
            <button
              onClick={onOpenCraftingTab}
              className="px-4 py-2 bg-[#E67E22] text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Đến Bếp Sáng Chế Ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredRecipes.map((recipe) => {
              const theme = RARITY_THEME_COLORS[recipe.rarity] || RARITY_THEME_COLORS.Rare;
              const readyCount = gameState.cookedDishes[recipe.id] || 0;
              const recipeStackCount = recipe.count || 1;

              return (
                <div
                  key={recipe.id}
                  className={`bg-white rounded-2xl border-2 p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all ${theme.border} relative overflow-hidden`}
                >
                  <div>
                    {/* Top Row: Rarity, Stack Count Badge & Delete Button */}
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${theme.badgeBg} ${theme.badgeText} ${theme.border}`}>
                          {recipe.rarity}
                        </span>

                        {/* Stacked recipe count badge */}
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            recipeStackCount > 1
                              ? 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-300'
                              : 'bg-[#FAF3E0] text-[#8C6D53] border-[#E6D5BC]'
                          }`}
                          title={`Số bản vẽ công thức này: ${recipeStackCount}`}
                        >
                          x{recipeStackCount} Bản
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#8C6D53] bg-[#FAF3E0] px-2 py-0.5 rounded-full border border-[#E6D5BC]">
                          ⏱️ {recipe.cookTime}s
                        </span>

                        {/* Delete / Recycle Recipe Button — xóa nhanh 1 click */}
                        {onDeleteRecipe && (
                          <button
                            onClick={() => {
                              sound.playTap();
                              handleQuickDelete(recipe);
                            }}
                            className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all btn-tactile"
                            title={
                              (recipe.count || 1) > 1
                                ? 'Thu hồi nhanh 1 bản (nhận lại tiền & CP)'
                                : 'Xóa công thức cuối cùng (sẽ cần xác nhận)'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Dish Info */}
                    <div className="flex items-start gap-2.5 my-1.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF8DC] border border-[#E6D5BC] flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                        {recipe.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-[#5C3A21] line-clamp-1">
                          {recipe.name}
                        </h4>
                        <p className="text-[11px] text-[#8C6D53] line-clamp-2 mt-0.5">
                          {recipe.description}
                        </p>
                      </div>
                    </div>

                    {/* Flavor Notes & Serving Status */}
                    <div className="flex items-center justify-between text-[10px] mt-2 pt-2 border-t border-[#F0E6D2]">
                      <span className="text-amber-800 font-bold italic">
                        {recipe.flavorNotes || 'Đậm đà thơm ngon'}
                      </span>
                      <span className="text-emerald-700 font-black">
                        Quầy có: {readyCount} dĩa
                      </span>
                    </div>
                  </div>

                  {/* Pricing & Free Cook Buttons */}
                  <div className="mt-3 pt-2 border-t border-[#F0E6D2] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8C6D53] font-bold">Giá phục vụ:</span>
                      <span className="text-base font-black text-emerald-700">
                        +${recipe.sellPrice.toLocaleString()} / suất
                      </span>
                    </div>

                    {/* Cook Action Buttons */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => {
                          sound.playCooking();
                          onManualCook(recipe.id, 1);
                        }}
                        className="py-1.5 px-2 bg-[#E67E22] hover:bg-[#D35400] text-white rounded-xl text-xs font-bold transition-all btn-tactile text-center border border-[#D35400] shadow-xs"
                        title="Tự tay nấu 1 suất miễn phí"
                      >
                        🍳 Nấu 1
                      </button>

                      <button
                        onClick={() => {
                          sound.playCooking();
                          onManualCook(recipe.id, 3);
                        }}
                        className="py-1.5 px-2 bg-[#F39C12] hover:bg-[#E67E22] text-white rounded-xl text-xs font-bold transition-all btn-tactile text-center border border-[#D35400] shadow-xs"
                        title="Tự tay nấu 3 suất miễn phí"
                      >
                        🍳 Nấu 3
                      </button>

                      <button
                        onClick={() => {
                          sound.playCooking();
                          onManualCook(recipe.id, 5);
                        }}
                        className="py-1.5 px-2 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl text-xs font-bold transition-all btn-tactile text-center border border-[#16A34A] shadow-xs"
                        title="Tự tay nấu 5 suất miễn phí"
                      >
                        ⚡ Nấu 5
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Recipe Confirmation Modal */}
      {recipeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A2E18]/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-[#FFFDF7] border-2 border-rose-300 rounded-3xl shadow-2xl p-5 relative">
            <button
              onClick={() => setRecipeToDelete(null)}
              className="absolute top-4 right-4 p-1 rounded-full bg-[#FAF3E0] hover:bg-[#FFE4B5] text-[#8B5A2B] border border-[#E6D5BC]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 text-rose-600 mb-2">
              <div className="p-2 bg-rose-100 rounded-xl border border-rose-200">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#5C3A21]">Xác Nhận Xóa Công Thức</h4>
                <p className="text-[11px] text-[#8C6D53]">Dọn bớt công thức không mong muốn</p>
              </div>
            </div>

            <div className="bg-[#FAF3E0] p-3 rounded-2xl border border-[#E6D5BC] my-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{recipeToDelete.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-black text-[#5C3A21] truncate">
                    {recipeToDelete.name}
                  </div>
                  <div className="text-[11px] text-[#8C6D53]">
                    Độ hiếm: <strong>{recipeToDelete.rarity}</strong> &bull; Đang có: <strong>{recipeToDelete.count || 1} bản</strong>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#E6D5BC]/60 flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>Hoàn trả thu hồi:</span>
                <span>
                  +${Math.round(recipeToDelete.sellPrice * 0.25).toLocaleString()} &amp; +
                  {recipeToDelete.rarity === 'Secret'
                    ? 150
                    : recipeToDelete.rarity === 'Mythical'
                    ? 75
                    : recipeToDelete.rarity === 'Legendary'
                    ? 35
                    : recipeToDelete.rarity === 'Epic'
                    ? 15
                    : 6}{' '}
                  CP
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#8C6D53] mb-4">
              {(recipeToDelete.count || 1) > 1
                ? `Bạn đang có ${recipeToDelete.count} bản trùng. Xóa sẽ giảm số lượng còn ${(recipeToDelete.count || 1) - 1} bản.`
                : 'Đây là bản vẽ cuối cùng của món này. Sau khi xóa, món sẽ bị khóa lại trong thực đơn cho đến khi bạn sáng chế hoặc mở hộp lại.'}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setRecipeToDelete(null)}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#FAF3E0] text-[#5C3A21] border border-[#E6D5BC] hover:bg-[#FFE4B5] btn-tactile"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 shadow-sm btn-tactile"
              >
                Đồng Ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
