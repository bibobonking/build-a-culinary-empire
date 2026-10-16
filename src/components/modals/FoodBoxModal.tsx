import React, { useState, useEffect } from 'react';
import { Recipe, RecipeRarity, FoodBoxInfo } from '../../types';
import { RARITY_THEME_COLORS } from '../../data/recipeDatabase';
import { sound } from '../../utils/sound';
import confetti from '../../utils/confettiFx';

interface FoodBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodBox: FoodBoxInfo | null;
  unlockedRecipe: Recipe | null;
  rarity: RecipeRarity | null;
  isNew: boolean;
  duplicateCpReward: number;
  isLowGraphic?: boolean;
}

// Góc bay của các hạt ✨ khi nắp hộp bật mở (quanh tâm hộp, rgba định kỳ trong CSS)
const FBX_SPARKS = ['-72deg', '-54deg', '-36deg', '-18deg', '0deg', '18deg', '36deg', '54deg', '72deg', '180deg'];

export const FoodBoxModal: React.FC<FoodBoxModalProps> = ({
  isOpen,
  onClose,
  foodBox,
  unlockedRecipe,
  rarity,
  isNew,
  duplicateCpReward,
  isLowGraphic = false,
}) => {
  const [animationStep, setAnimationStep] = useState<'shaking' | 'opening' | 'revealed'>('shaking');

  useEffect(() => {
    if (isOpen) {
      setAnimationStep('shaking');
      sound.playCooking();

      // Timeline: rung hộp -> nắp bật mở (ánh sáng tràn ra) -> bảng kết quả trồi lên
      const openDelay = isLowGraphic ? 260 : 850;
      const revealDelay = isLowGraphic ? 580 : 1420;

      const t1 = setTimeout(() => setAnimationStep('opening'), openDelay);
      const t2 = setTimeout(() => {
        setAnimationStep('revealed');
        // Âm thanh reveal riêng theo độ hiếm (Secret có đoạn "phép thuật" dài hơn)
        sound.playGachaReveal(rarity);
        if (!isLowGraphic) {
          confetti({
            particleCount: rarity === 'Secret' ? 150 : rarity === 'Mythical' ? 100 : 70,
            spread: 80,
            origin: { y: 0.6 },
            colors:
              rarity === 'Secret'
                ? ['#EC4899', '#A855F7', '#3B82F6', '#F59E0B']
                : rarity === 'Mythical'
                ? ['#EF4444', '#F43F5E', '#FB7185', '#FDE047']
                : rarity === 'Legendary'
                ? ['#F59E0B', '#FBBF24', '#FDE68A', '#10B981']
                : ['#3B82F6', '#8B5CF6', '#10B981'],
          });
        }
      }, revealDelay);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isOpen, rarity, isLowGraphic]);

  if (!isOpen || !unlockedRecipe || !rarity) return null;

  const theme = RARITY_THEME_COLORS[rarity] || RARITY_THEME_COLORS.Rare;
  const rarityGlowClass = `rarity-glow-${rarity.toLowerCase()}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`bg-[#FFFDF7] border-3 sm:border-4 border-[#E6D5BC] rounded-3xl max-w-md w-full p-4 sm:p-6 text-center shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto ${
          animationStep === 'revealed' ? rarityGlowClass : ''
        }`}
      >
        {/* Background glow effects for high rarities (chỉ hiện khi đã mở — không spoil lúc lắc) */}
        {animationStep === 'revealed' &&
          (rarity === 'Secret' || rarity === 'Mythical' || rarity === 'Legendary') && (
            <div className="absolute inset-0 bg-gradient-to-b from-amber-200/20 via-rose-200/20 to-purple-200/20 pointer-events-none" />
          )}
        {/* Secret: màn sao vũ trụ lấp lánh — hiệu ứng đặc biệt riêng của Secret */}
        {rarity === 'Secret' && !isLowGraphic && animationStep === 'revealed' && (
          <div className="ce-starfield" />
        )}

        {animationStep !== 'revealed' ? (
          <div className="py-12 space-y-4 relative flex flex-col items-center">
            {animationStep === 'opening' ? (
              <div className="relative">
                {/* Vòng sáng bung ra khi nắp bật */}
                <div className="fbx-ring" aria-hidden="true" />
                {/* Nắp hộp bay lên */}
                <div className="fbx-lid" aria-hidden="true" />
                {/* Tia sáng bung ra quanh tâm hộp */}
                {FBX_SPARKS.map((angle, i) => (
                  <span key={i} className="fbx-spark-anchor" style={{ '--a': angle } as React.CSSProperties} aria-hidden="true">
                    <span className="fbx-spark">✨</span>
                  </span>
                ))}
                <div className="text-7xl inline-block fbx-box-pop" aria-hidden="true">📦</div>
              </div>
            ) : (
              <div className={`text-7xl inline-block ${isLowGraphic ? 'animate-pulse' : 'ce-box-shake'}`} aria-hidden="true">📦</div>
            )}
            <h3 className="text-lg font-black text-[#5C3A21]">
              {animationStep === 'opening' ? (
                'Hộp bật mở — ánh sáng tràn ra!'
              ) : (
                <>
                  Đang mở {foodBox?.name || 'Hộp Bí Ẩn'}<span className="ce-dots" />
                </>
              )}
            </h3>
            <p className="text-xs text-[#8C6D53] max-w-[280px]">
              {animationStep === 'opening'
                ? 'Ánh sáng vàng tung tóe — công thức Ẩm Thực bí ẩn sắp hiện hình!'
                : 'Trời phù hộ — công thức Ẩm Thực bí ẩn đang được khai mở!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Top Announcement */}
            <div>
              <span
                className={`inline-block text-xs font-black px-3.5 py-1 rounded-full border mb-2 shadow-xs fbx-banner-in ${theme.badgeBg} ${theme.badgeText} ${theme.border}`}
              >
                ✨ KHAI MỞ THÀNH CÔNG: {theme.label} ✨
              </span>
              <h3 className="text-xl font-black text-[#5C3A21]">
                {unlockedRecipe.name}
              </h3>
            </div>

            {/* Recipe Card Preview */}
            <div
              className={`bg-white rounded-2xl border-2 p-4 shadow-md ${theme.border} space-y-3 relative fbx-card-in`}
            >
              <div
                className={`w-20 h-20 mx-auto rounded-3xl bg-[#FFF8DC] border-2 border-[#E6D5BC] flex items-center justify-center text-4xl shadow-inner ${
                  isNew && !isLowGraphic ? 'ce-burst' : ''
                }`}
              >
                {unlockedRecipe.icon}
              </div>

              <p className="text-xs text-[#8C6D53] italic">
                "{unlockedRecipe.description}"
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F0E6D2] text-xs">
                <div className="bg-[#FFF8E7] p-2 rounded-xl text-center border border-[#E6D5BC]">
                  <span className="text-[10px] text-[#8C6D53] block">Giá Bán Phục Vụ</span>
                  <span className="font-black text-emerald-700 text-sm">
                    +${unlockedRecipe.sellPrice.toLocaleString()} / suất
                  </span>
                </div>
                <div className="bg-[#FFF8E7] p-2 rounded-xl text-center border border-[#E6D5BC]">
                  <span className="text-[10px] text-[#8C6D53] block">Thời Gian Nấu</span>
                  <span className="font-black text-[#5C3A21] text-sm">
                    ⏱️ {unlockedRecipe.cookTime} giây (FREE)
                  </span>
                </div>
              </div>
            </div>

            {/* Is New vs Duplicate Notice */}
            {isNew ? (
              <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-2.5 rounded-xl border border-emerald-300">
                🎉 Công thức mới tinh đã được thêm vào Sổ Tay Thực Đơn của nhà hàng!
              </div>
            ) : (
              <div className="bg-purple-50 text-purple-800 text-xs font-bold p-2.5 rounded-xl border border-purple-300">
                🔁 Bạn đã sở hữu công thức này trước đó! Quy đổi thành: <strong>+{duplicateCpReward} Điểm Sáng Tạo (CP)</strong>!
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="w-full py-3 bg-[#E67E22] hover:bg-[#D35400] text-white rounded-2xl font-black text-sm shadow-md transition-all btn-tactile border border-[#D35400]"
            >
              Vào Bếp Nấu Món Ngay!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
