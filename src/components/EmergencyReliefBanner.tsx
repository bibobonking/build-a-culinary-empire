import React from 'react';
import { GameState } from '../types';
import { sound } from '../utils/audio';
import { AlertOctagon, HeartHandshake, Coffee, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';

interface EmergencyReliefBannerProps {
  gameState: GameState;
  isSoftLocked: boolean;
  onClaimEmergencyRelief: () => void;
  onEarnQuickCash: () => void;
}

export const EmergencyReliefBanner: React.FC<EmergencyReliefBannerProps> = ({
  gameState,
  isSoftLocked,
  onClaimEmergencyRelief,
  onEarnQuickCash,
}) => {
  // If not soft-locked and cash is healthy (>= $35), don't show the emergency banner
  if (!isSoftLocked && gameState.cash >= 35) {
    return null;
  }

  return (
    <div
      id="emergency-relief-banner"
      className={`rounded-2xl p-4 sm:p-5 border-2 transition-all shadow-md animate-in fade-in slide-in-from-top-2 duration-300 ${
        isSoftLocked
          ? 'bg-gradient-to-r from-[#FFF5F5] via-[#FFF0F0] to-[#FFEBEB] border-[#E53935] ring-2 ring-[#E53935]/20'
          : 'bg-gradient-to-r from-[#FFFBF0] via-[#FFF8E7] to-[#FFF3D6] border-[#F39C12]'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Icon & Description */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-2xl shadow-xs ${
              isSoftLocked ? 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]' : 'bg-[#FFF8DC] text-[#D35400] border border-[#FFE4B5]'
            }`}
          >
            {isSoftLocked ? '🚨' : '💡'}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4
                className={`text-sm sm:text-base font-black ${
                  isSoftLocked ? 'text-[#C62828]' : 'text-[#8B5A2B]'
                }`}
              >
                {isSoftLocked
                  ? 'Báo Động Cạn Kiệt Vốn & Nguyên Liệu (Nguy Cơ Đình Trệ)!'
                  : 'Cảnh Báo Vốn Thấp: Bạn Có Thể Kiếm Thêm Tiền Nóng Bất Kỳ Lúc Nào!'}
              </h4>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isSoftLocked
                    ? 'bg-[#E53935] text-white'
                    : 'bg-[#F39C12] text-white'
                }`}
              >
                {isSoftLocked ? 'Cần Cứu Trợ Khẩn' : 'Hỗ Trợ Khởi Nghiệp'}
              </span>
            </div>

            <p className="text-xs text-[#5C3A21] leading-relaxed">
              {isSoftLocked ? (
                <>
                  Quán hiện đang <strong>hết tiền mặt (${gameState.cash})</strong> và kho <strong>không đủ nguyên liệu</strong> để nấu bất kỳ món nào cho khách. Bạn <strong>KHÔNG CẦN phải reset chơi lại từ đầu</strong>! Hãy chọn 1 trong 2 giải pháp bên dưới:
                </>
              ) : (
                <>
                  Quỹ tiền mặt của quán đang dưới $35. Bạn có thể bán trà đá vỉa hè để kiếm thêm tiền nhập hàng nhanh chóng mà không lo thiếu vốn!
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          {/* Button 1: Quick Hustle Iced Tea */}
          <button
            onClick={() => {
              sound.playTap();
              onEarnQuickCash();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E67E22] to-[#F39C12] hover:from-[#D35400] hover:to-[#E67E22] text-white text-xs font-black shadow-sm btn-tactile flex items-center justify-center gap-1.5 cursor-pointer"
            title="Nhấp để phục vụ trà đá vỉa hè, kiếm tiền nóng ngay lập tức"
          >
            <span className="text-base">🥤</span>
            <span>Bán Trà Đá (+ $10)</span>
          </button>

          {/* Button 2: Claim Full Emergency Relief Pack */}
          <button
            onClick={() => {
              sound.playCelebration();
              onClaimEmergencyRelief();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#43A047] hover:from-[#1B5E20] hover:to-[#2E7D32] text-white text-xs font-black shadow-sm btn-tactile flex items-center justify-center gap-1.5 cursor-pointer"
            title="Nhận gói cứu trợ $200 + đầy đủ nguyên liệu nấu nướng"
          >
            <span className="text-base">🏛️</span>
            <span>Nhận Gói Cứu Trợ ($200 + Kho Hàng)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
