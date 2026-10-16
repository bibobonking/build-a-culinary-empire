import React from 'react';
import { Recipe, RecipeRarity } from '../../types';
import { RARITY_THEME_COLORS } from '../../data/recipeDatabase';
import { sound } from '../../utils/sound';

interface RecipeDiscoveredModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  rarity: RecipeRarity | null;
  isNew: boolean;
  duplicateCpReward: number;
  isLowGraphic?: boolean;
}

export const RecipeDiscoveredModal: React.FC<RecipeDiscoveredModalProps> = ({
  isOpen,
  onClose,
  recipe,
  rarity,
  isNew,
  duplicateCpReward,
  isLowGraphic = false,
}) => {
  const show = isOpen && !!recipe && !!rarity;

  // Âm thanh reveal theo độ hiếm (Secret có đoạn "phép thuật" riêng)
  React.useEffect(() => {
    if (show && rarity) sound.playGachaReveal(rarity);
  }, [show, rarity]);

  if (!show) return null;

  const theme = RARITY_THEME_COLORS[rarity!] || RARITY_THEME_COLORS.Rare;
  const rarityGlowClass = `rarity-glow-${rarity!.toLowerCase()}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`bg-[#FFFDF7] border-3 sm:border-4 border-[#E6D5BC] rounded-3xl max-w-md w-full p-4 sm:p-6 text-center shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto ${rarityGlowClass}`}
      >
        {/* Secret: màn sao vũ trụ lấp lánh — chỉ Secret mới có hiệu ứng đặc biệt này */}
        {rarity === 'Secret' && !isLowGraphic && <div className="ce-starfield" />}
        <div className="space-y-4 py-2 relative">
          {/* Top Badge */}
          <div>
            <span
              className={`inline-block text-xs font-black px-3.5 py-1 rounded-full border mb-2 shadow-xs ${theme.badgeBg} ${theme.badgeText} ${theme.border}`}
            >
              ⚗️ SÁNG CHẾ THÀNH CÔNG: {theme.label} ⚗️
            </span>
            <h3 className="text-xl font-black text-[#5C3A21]">
              {recipe!.name}
            </h3>
          </div>

          {/* Dish Card Preview */}
          <div
            className={`bg-white rounded-2xl border-2 p-4 shadow-md ${theme.border} space-y-3 relative`}
          >
            <div
              className={`w-20 h-20 mx-auto rounded-3xl bg-[#FFF8DC] border-2 border-[#E6D5BC] flex items-center justify-center text-4xl shadow-inner ${
                isNew && !isLowGraphic ? 'ce-burst' : ''
              }`}
            >
              {recipe!.icon}
            </div>

            <p className="text-xs text-[#8C6D53] italic">
              "{recipe!.description}"
            </p>

            {recipe!.combinedIngredients && recipe!.combinedIngredients.length > 0 && (
              <div className="bg-[#FFF8E7] p-2 rounded-xl text-[11px] text-[#8C6D53] border border-[#E6D5BC]">
                <span className="font-bold text-[#5C3A21]">Nguyên liệu hòa trộn: </span>
                {recipe!.combinedIngredients.join(' + ')}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F0E6D2] text-xs">
              <div className="bg-[#FFF8E7] p-2 rounded-xl text-center border border-[#E6D5BC]">
                <span className="text-[10px] text-[#8C6D53] block">Giá Bán Phục Vụ</span>
                <span className="font-black text-emerald-700 text-sm">
                  +${recipe!.sellPrice.toLocaleString()} / suất
                </span>
              </div>
              <div className="bg-[#FFF8E7] p-2 rounded-xl text-center border border-[#E6D5BC]">
                <span className="text-[10px] text-[#8C6D53] block">Thời Gian Nấu</span>
                <span className="font-black text-[#5C3A21] text-sm">
                  ⏱️ {recipe!.cookTime}s (FREE)
                </span>
              </div>
            </div>
          </div>

          {/* New vs Duplicate */}
          {isNew ? (
            <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-2.5 rounded-xl border border-emerald-300">
              ✨ Chúc mừng bạn đã sáng chế thành công một tuyệt phẩm ẩm thực mới!
            </div>
          ) : (
            <div className="bg-purple-50 text-purple-800 text-xs font-bold p-2.5 rounded-xl border border-purple-300">
              🔁 Công thức đã từng được sáng chế! Bạn nhận được: <strong>+{duplicateCpReward} Điểm Sáng Tạo (CP)</strong>!
            </div>
          )}

          {/* Action */}
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-full py-3 bg-[#E67E22] hover:bg-[#D35400] text-white rounded-2xl font-black text-sm shadow-md transition-all btn-tactile border border-[#D35400]"
          >
            Đưa Vào Bếp Phục Vụ Khách!
          </button>
        </div>
      </div>
    </div>
  );
};
