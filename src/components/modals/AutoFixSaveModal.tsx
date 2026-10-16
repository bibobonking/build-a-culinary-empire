import React from 'react';
import { FixSaveReport, CURRENT_VERSION_STRING } from '../../types';
import { sound } from '../../utils/audio';
import { X, CheckCircle2, ShieldCheck, Wrench, Sparkles, Database, ArrowRight } from 'lucide-react';

interface AutoFixSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: FixSaveReport | null;
  onContinue?: () => void;
}

export const AutoFixSaveModal: React.FC<AutoFixSaveModalProps> = ({
  isOpen,
  onClose,
  report,
  onContinue,
}) => {
  if (!isOpen || !report) return null;

  const handleClose = () => {
    sound.playTap();
    onClose();
    if (onContinue) onContinue();
  };

  const summary = report.preservedDataSummary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A2E18]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FFFDF7] border-3 border-[#D2691E] rounded-3xl shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#FAF3E0] hover:bg-[#FFE4B5] text-[#8B5A2B] border border-[#E6D5BC] btn-tactile"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E67E22] to-[#D35400] flex items-center justify-center text-white shadow-md">
            <Wrench className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-[#8B5A2B] tracking-tight">
                Auto FixSave Thông Minh
              </h3>
              <span className="bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#2E7D32]" /> Đã Sửa Xong
              </span>
            </div>
            <p className="text-xs text-[#8C6D53]">Tự động phát hiện & sửa tương thích save cũ</p>
          </div>
        </div>

        {/* Version Migration Pill */}
        <div className="mt-4 p-3 rounded-2xl bg-[#FFF8DC] border border-[#E6D5BC] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#8B5A2B]">
            <Database className="w-4 h-4 text-[#D2691E]" />
            <span>Chuyển đổi phiên bản:</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2 py-0.5 rounded-lg bg-[#FAF3E0] text-[#8C6D53] border border-[#E6D5BC] font-bold">
              {report.fromVersion}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D2691E]" />
            <span className="px-2 py-0.5 rounded-lg bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-black">
              {CURRENT_VERSION_STRING}
            </span>
          </div>
        </div>

        {/* Data Preservation Guarantee Banner */}
        <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] border-2 border-[#A5D6A7] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-black text-[#1B5E20]">
              BẢO TOÀN DỮ LIỆU NGUYÊN VẸN 100%
            </div>
            <div className="text-[11px] text-[#2E7D32] mt-0.5 leading-snug">
              Hệ thống đã sửa cấu trúc save lỗi thời để tương thích hoàn toàn với bản cập nhật mới nhất.
              Không bị mất tiền, cấp bậc, món ăn hay bất kỳ đồ dùng nào!
            </div>
          </div>
        </div>

        {/* Summary Grid of Preserved Player Assets */}
        <div className="mt-4">
          <span className="text-xs font-black text-[#8B5A2B] block mb-2">
            📊 Thống Kê Dữ Liệu Được Bảo Toàn:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="bg-[#FAF3E0] p-2.5 rounded-xl border border-[#E6D5BC] text-center">
              <span className="text-[10px] text-[#8C6D53] block font-semibold">💵 Tiền Vốn</span>
              <span className="text-xs sm:text-sm font-black text-[#2E7D32]">
                ${summary.cash.toLocaleString()}
              </span>
            </div>

            <div className="bg-[#FAF3E0] p-2.5 rounded-xl border border-[#E6D5BC] text-center">
              <span className="text-[10px] text-[#8C6D53] block font-semibold">💡 Sáng Tạo</span>
              <span className="text-xs sm:text-sm font-black text-[#D35400]">
                {summary.creativePoints} CP
              </span>
            </div>

            <div className="bg-[#FAF3E0] p-2.5 rounded-xl border border-[#E6D5BC] text-center">
              <span className="text-[10px] text-[#8C6D53] block font-semibold">👑 Cấp Bậc</span>
              <span className="text-xs sm:text-sm font-black text-[#8B5A2B]">
                Cấp {summary.level} (Ngày {summary.day})
              </span>
            </div>

            <div className="bg-[#FAF3E0] p-2.5 rounded-xl border border-[#E6D5BC] text-center">
              <span className="text-[10px] text-[#8C6D53] block font-semibold">📜 Món Đã Mở</span>
              <span className="text-xs sm:text-sm font-black text-[#B86B14]">
                {summary.unlockedRecipesCount}/{summary.totalRecipesOwned} món
              </span>
            </div>

            <div className="bg-[#FAF3E0] p-2.5 rounded-xl border border-[#E6D5BC] text-center">
              <span className="text-[10px] text-[#8C6D53] block font-semibold">♨️ Quầy Ra Món</span>
              <span className="text-xs sm:text-sm font-black text-[#E67E22]">
                {summary.dishesOnCounter} Suất
              </span>
            </div>

            <div className="bg-[#FAF3E0] p-2.5 rounded-xl border border-[#E6D5BC] text-center">
              <span className="text-[10px] text-[#8C6D53] block font-semibold">📦 Kho Đồ</span>
              <span className="text-xs sm:text-sm font-black text-[#5C3A21]">
                {summary.inventoryItemsCount} Loại
              </span>
            </div>
          </div>
        </div>

        {/* Change Log Details */}
        <div className="mt-4">
          <span className="text-xs font-black text-[#8B5A2B] block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E67E22]" /> Chi Tiết Các Tác Vụ Tự Động Sửa & Chuẩn Hóa:
          </span>
          <div className="bg-[#FAF3E0] p-3 rounded-2xl border border-[#E6D5BC] max-h-40 overflow-y-auto space-y-1.5 text-[11px] text-[#5C3A21]">
            {report.changes.map((change, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0 mt-0.5" />
                <span className="leading-snug">{change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          <button
            onClick={() => {
              sound.playCelebration();
              handleClose();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7CB342] to-[#558B2F] hover:from-[#689F38] hover:to-[#33691E] text-white text-sm font-black shadow-md flex items-center justify-center gap-2 btn-tactile"
          >
            <span>Tiếp Tục Chơi Ngay! 🎉</span>
          </button>
        </div>
      </div>
    </div>
  );
};
