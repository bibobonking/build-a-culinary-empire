import React, { useMemo } from 'react';
import type { GameState } from '../../types';
import { ACHIEVEMENTS, DAILY_REWARDS } from '../../game/achievements';
import { sound } from '../../utils/audio';

interface Props {
  gameState: GameState;
  dailyAvailable: boolean;
  onClaimDaily: () => void;
}

export const AchievementsTab: React.FC<Props> = ({ gameState, dailyAvailable, onClaimDaily }) => {
  const unlocked = useMemo(() => new Set(gameState.achievements || []), [gameState.achievements]);
  const streak = gameState.dailyReward?.streak || 0;
  const nextIdx = dailyAvailable ? streak % DAILY_REWARDS.length : (streak - 1 + DAILY_REWARDS.length) % DAILY_REWARDS.length;

  const sorted = useMemo(
    () =>
      [...ACHIEVEMENTS].sort((a, b) => {
        const ua = unlocked.has(a.id) ? 1 : 0;
        const ub = unlocked.has(b.id) ? 1 : 0;
        if (ua !== ub) return ua - ub; // in-progress first
        const pa = Math.min(1, a.metric(gameState) / a.target);
        const pb = Math.min(1, b.metric(gameState) / b.target);
        return pb - pa;
      }),
    [gameState, unlocked]
  );

  return (
    <div className="space-y-4">
      {/* Daily gift */}
      <div className="glass-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-[#8B5A2B] flex items-center gap-2">🎁 Quà Đăng Nhập Hằng Ngày</h3>
            <p className="text-xs text-[#8C6D53] mt-0.5">
              Vào game mỗi ngày để giữ chuỗi — phần thưởng tăng dần tới ngày thứ 7. Chuỗi hiện tại: <b>{streak} ngày</b>
            </p>
          </div>
          <button
            disabled={!dailyAvailable}
            onClick={() => {
              sound.playTap();
              onClaimDaily();
            }}
            className={`px-4 py-2 rounded-xl text-sm font-black ${dailyAvailable ? 'btn-primary pulse-soft' : 'bg-[#E0D3C1] text-[#9A8775] cursor-not-allowed'}`}
          >
            {dailyAvailable ? 'Nhận quà hôm nay' : 'Đã nhận — mai quay lại nhé'}
          </button>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mt-3">
          {DAILY_REWARDS.map((r, i) => {
            const done = !dailyAvailable ? i <= nextIdx : i < nextIdx;
            const current = dailyAvailable && i === nextIdx;
            return (
              <div
                key={i}
                className={`rounded-xl border-2 px-1.5 py-2 text-center ${
                  current ? 'border-[#E67E22] bg-[#FFF3E0]' : done ? 'border-[#A5D6A7] bg-[#F1F8E9]' : 'border-[#E6D5BC] bg-[#FFFDF7]'
                }`}
              >
                <div className="text-[10px] font-bold text-[#8C6D53]">Ngày {i + 1}</div>
                <div className="text-lg leading-none my-0.5">{done ? '✅' : i === 6 ? '🏆' : '🎁'}</div>
                <div className="text-[10px] font-black text-[#2E7D32]">${r.cash >= 1000 ? `${r.cash / 1000}k` : r.cash}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-end justify-between mb-2">
          <h3 className="text-lg font-black text-[#8B5A2B]">🏅 Thành Tựu</h3>
          <span className="text-xs font-bold text-[#8C6D53]">
            {unlocked.size}/{ACHIEVEMENTS.length} đã mở khóa
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {sorted.map((a) => {
            const done = unlocked.has(a.id);
            const value = Math.min(a.target, Math.floor(a.metric(gameState)));
            const pct = Math.round((value / a.target) * 100);
            return (
              <div key={a.id} className={`glass-card p-3 flex gap-3 items-center ${done ? 'ach-done' : ''}`}>
                <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-2xl ${done ? 'bg-[#FFE082]' : 'bg-[#F0E6D2] grayscale opacity-70'}`}>
                  {a.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-black text-[#5C3A21] truncate">{a.title}</h4>
                    <span className="text-[10px] font-bold text-[#2E7D32] shrink-0">
                      +${a.rewardCash.toLocaleString()} · +{a.rewardCp}CP
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8C6D53] leading-tight">{a.desc}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[#E6D5BC] overflow-hidden">
                      <div className={`h-full rounded-full ${done ? 'bg-[#7CB342]' : 'progress-cozy'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-[#8C6D53] tabular-nums">
                      {done ? '✓' : `${value.toLocaleString()}/${a.target.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
