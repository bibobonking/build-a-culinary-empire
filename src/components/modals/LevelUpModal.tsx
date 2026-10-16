import React from 'react';
import { RestaurantTier } from '../../types';
import { RESTAURANT_TIERS } from '../../data/gameData';
import { Sparkles, Trophy, Award, CheckCircle2 } from 'lucide-react';
import confetti from '../../utils/confettiFx';

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  bonusCash: number;
  bonusCp: number;
  isLowGraphic?: boolean;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  newLevel,
  bonusCash,
  bonusCp,
  isLowGraphic = false,
  onClose,
}) => {
  // Hooks phải chạy trước mọi early return để giữ thứ tự ổn định
  React.useEffect(() => {
    if (!isOpen || isLowGraphic) return;
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#FF8C42', '#E67E22', '#7CB342', '#F1C40F', '#D2691E'],
    });
  }, [isOpen, isLowGraphic]);

  if (!isOpen) return null;

  const currentTier: RestaurantTier =
    RESTAURANT_TIERS.find((t) => t.level === Math.min(newLevel, 6)) || RESTAURANT_TIERS[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFDF7] border-4 border-[#E67E22] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-[#5D4037]">
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-b from-[#FFE4B5] to-[#FFF8DC] border-b-2 border-[#E6D5BC] px-6 pt-7 pb-5 text-center relative overflow-hidden">
          <div className="absolute top-2 left-4 text-2xl animate-bounce">🎉</div>
          <div className="absolute top-3 right-4 text-2xl animate-bounce delay-100">✨</div>

          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FFFDF7] border-3 border-[#D2691E] flex items-center justify-center text-4xl shadow-md mb-3">
            {currentTier.icon}
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-[#E67E22] text-white text-xs font-black tracking-wider uppercase shadow-sm">
            Thăng Cấp Thành Công!
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-[#8B5A2B] mt-2">
            Cấp Độ {newLevel}: {currentTier.name}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-[#D35400] mt-0.5">
            "{currentTier.title}"
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-[#8C6D53] leading-relaxed text-center">
            {currentTier.description}
          </p>

          {/* Unlocked Benefits */}
          <div className="bg-[#FAF3E0] border-2 border-[#E6D5BC] rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold uppercase text-[#8B5A2B] tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#E67E22]" /> Quyền Lợi & Mở Rộng Cơ Sở Mới:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-[#6D4C41]">
              <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1.5 rounded-xl border border-[#E6D5BC]/60">
                <span>🪑</span>
                <span>Sức chứa: <strong>{currentTier.maxSeats} khách</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1.5 rounded-xl border border-[#E6D5BC]/60">
                <span>👥</span>
                <span>Lưu lượng: <strong>{currentTier.baseVisitors} khách/phút</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1.5 rounded-xl border border-[#E6D5BC]/60 col-span-2">
                <span>⭐</span>
                <span>Mở khóa thêm các công thức và thiết bị ẩm thực cao cấp!</span>
              </div>
            </div>
          </div>

          {/* Level Up Rewards */}
          <div className="bg-[#E8F5E9] border-2 border-[#A5D6A7] rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase text-[#2E7D32] tracking-wide flex items-center gap-1.5 mb-2">
              <Award className="w-4 h-4 text-[#2E7D32]" /> Phần Thưởng Khích Lệ Thăng Cấp:
            </h4>
            <div className="flex items-center justify-around text-center">
              <div className="flex flex-col items-center">
                <span className="text-lg">💵</span>
                <span className="text-xs text-[#558B2F]">Tiền Thưởng</span>
                <span className="text-sm sm:text-base font-black text-[#2E7D32]">
                  +${bonusCash.toLocaleString()}
                </span>
              </div>
              <div className="h-8 w-px bg-[#C8E6C9]" />
              <div className="flex flex-col items-center">
                <span className="text-lg">💡</span>
                <span className="text-xs text-[#558B2F]">Điểm Sáng Tạo</span>
                <span className="text-sm sm:text-base font-black text-[#D35400]">
                  +{bonusCp} CP
                </span>
              </div>
              <div className="h-8 w-px bg-[#C8E6C9]" />
              <div className="flex flex-col items-center">
                <span className="text-lg">🏆</span>
                <span className="text-xs text-[#558B2F]">Danh Tiếng</span>
                <span className="text-sm sm:text-base font-black text-[#A0522D]">
                  +8% Uy Tín
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E67E22] to-[#D35400] hover:from-[#D35400] hover:to-[#BA4A00] text-white font-bold text-sm shadow-md btn-tactile flex items-center justify-center gap-2 mt-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tuyệt Vời! Tiếp Tục Mở Rộng Quán</span>
          </button>
        </div>
      </div>
    </div>
  );
};
