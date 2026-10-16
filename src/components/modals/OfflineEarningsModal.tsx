import React from 'react';
import type { OfflineReport } from '../../types';
import { sound } from '../../utils/audio';

interface Props {
  report: OfflineReport | null;
  onClose: () => void;
}

const fmtDuration = (ms: number) => {
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h} giờ ${m % 60} phút` : `${m} phút`;
};

export const OfflineEarningsModal: React.FC<Props> = ({ report, onClose }) => {
  if (!report) return null;
  const capped = report.cappedMs < report.awayMs;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
      <div className="modal-card w-full max-w-sm p-5 sm:p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="text-5xl mb-1 float-slow">🌙</div>
        <h3 className="text-xl font-black text-[#8B5A2B]">Chào mừng trở lại!</h3>
        <p className="text-xs text-[#8C6D53] mt-1">
          Bạn vắng mặt {fmtDuration(report.awayMs)}
          {capped ? ` (tính tối đa ${fmtDuration(report.cappedMs)})` : ''}. Nhân viên vẫn mở quán giúp bạn:
        </p>

        <div className="grid grid-cols-2 gap-2 mt-4 text-left">
          <Stat icon="💵" label="Doanh thu" value={`+$${report.cash.toLocaleString()}`} tone="green" />
          <Stat icon="🧑‍🤝‍🧑" label="Khách đã phục vụ" value={`${report.customers}`} tone="orange" />
          <Stat icon="💡" label="Điểm sáng tạo" value={`+${report.creativePoints} CP`} tone="orange" />
          <Stat icon="🍱" label="Mẻ nấu hoàn tất" value={`${report.dishesFinished} suất`} tone="green" />
        </div>
        {report.restocked && (
          <p className="mt-3 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl py-1.5">
            🛒 Chợ nguyên liệu đã được restock mới!
          </p>
        )}

        <button
          onClick={() => {
            sound.playCashRegister();
            onClose();
          }}
          className="btn-primary w-full mt-5 py-2.5 rounded-xl font-black text-sm"
        >
          Tuyệt vời, mở quán tiếp!
        </button>
      </div>
    </div>
  );
};

const Stat: React.FC<{ icon: string; label: string; value: string; tone: 'green' | 'orange' }> = ({ icon, label, value, tone }) => (
  <div className="bg-[#FFF8DC] border border-[#E6D5BC] rounded-xl px-3 py-2">
    <div className="text-[10px] font-bold uppercase text-[#8C6D53]">
      {icon} {label}
    </div>
    <div className={`text-sm font-black ${tone === 'green' ? 'text-[#2E7D32]' : 'text-[#D35400]'}`}>{value}</div>
  </div>
);
