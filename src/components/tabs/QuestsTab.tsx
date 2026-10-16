import React, { useState } from 'react';
import { GameState, Quest, QuestCategory, RestaurantTier } from '../../types';
import { RESTAURANT_TIERS } from '../../data/gameData';
import { sound } from '../../utils/audio';
import confetti from '../../utils/confettiFx';
import {
  Award,
  CheckCircle2,
  Sparkles,
  Trophy,
  Star,
  Zap,
  Gift,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface QuestsTabProps {
  gameState: GameState;
  onClaimQuest: (questId: string) => void;
  onClaimAllQuests: () => void;
  onOpenCulinaryLab?: () => void;
}

export const QuestsTab: React.FC<QuestsTabProps> = ({
  gameState,
  onClaimQuest,
  onClaimAllQuests,
  onOpenCulinaryLab,
}) => {
  const [activeCategory, setActiveCategory] = useState<QuestCategory | 'all'>('all');

  const currentTier: RestaurantTier =
    RESTAURANT_TIERS.find((t) => t.level === gameState.restaurantLevel) || RESTAURANT_TIERS[0];
  const nextTier: RestaurantTier | undefined =
    RESTAURANT_TIERS.find((t) => t.level === gameState.restaurantLevel + 1);

  // Tiến độ نحو nâng cấp cơ sở: dựa trên số nhiệm vụ đã nhận thưởng
  const unlockedCount = gameState.recipes.filter((r) => r.unlocked).length;
  const claimedQuests = gameState.quests.filter((q) => q.claimed).length;
  const targetQuests = nextTier?.requiredQuests || 10;
  const progressPercent = Math.min(100, Math.round((claimedQuests / targetQuests) * 100));

  const filteredQuests = gameState.quests.filter((q) => {
    if (activeCategory === 'all') return true;
    return q.category === activeCategory;
  });

  const claimableCount = gameState.quests.filter((q) => q.completed && !q.claimed).length;

  const handleClaim = (questId: string) => {
    sound.playCelebration();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF8C42', '#7CB342', '#F1C40F', '#E67E22'],
    });
    onClaimQuest(questId);
  };

  const handleClaimAll = () => {
    sound.playCelebration();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#FF8C42', '#7CB342', '#F1C40F', '#E67E22', '#D2691E'],
    });
    onClaimAllQuests();
  };

  return (
    <div className="space-y-6">
      {/* Level & Milestone Master Progression Card */}
      <div className="bg-gradient-to-r from-[#FFFDF7] via-[#FFF8DC] to-[#FAF3E0] border-2 border-[#E6D5BC] rounded-3xl p-5 sm:p-6 shadow-cozy relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Current Tier Badge */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-[#FFE4B5] border-3 border-[#D2691E]/40 flex items-center justify-center text-3xl sm:text-4xl shadow-sm select-none">
              {currentTier.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-[#E67E22] text-white shadow-sm">
                  Cấp Bậc {gameState.restaurantLevel}
                </span>
                <span className="text-xs text-[#8C6D53] font-bold">"{currentTier.title}"</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#8B5A2B] mt-1">
                {currentTier.name}
              </h2>
              <p className="text-xs text-[#8C6D53] mt-0.5">
                {currentTier.description}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="w-full md:w-auto flex flex-col items-end">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8B5A2B]">
              <span>Công thức đã mở khóa:</span>
              <span className="text-sm sm:text-base font-black text-[#D35400]">
                {unlockedCount} / {gameState.recipes.length} Món
              </span>
            </div>
            <span className="text-[11px] text-[#8C6D53] mt-0.5">
              Tổng thực khách đã phục vụ: <strong>{gameState.totalCustomersServedAllTime} khách</strong>
            </span>
          </div>
        </div>

        {/* Next-Tier Quest Progress Bar */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#8B5A2B] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#E67E22]" />
              Tiến độ nhiệm vụ để nâng cấp cơ sở: {claimedQuests} nhiệm vụ
            </span>
            <span className="text-[#D35400] font-black">{progressPercent}%</span>
          </div>

          <div className="w-full h-4 bg-[#E6D5BC]/60 rounded-full overflow-hidden p-0.5 border border-[#D2B48C]/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF8C42] to-[#E67E22] transition-all duration-500 shadow-inner"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8C6D53]">
            <span>💡 Hoàn thành &amp; <strong>nhận thưởng</strong> nhiệm vụ để đủ điều kiện nâng cấp</span>
            <span>Cần đạt: <strong>{nextTier?.name || 'Tối Thượng'}</strong></span>
          </div>
        </div>
      </div>

      {/* Quests Section Header & Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-black text-[#8B5A2B] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#E67E22]" /> Nhiệm Vụ & Thử Thách Kinh Doanh
          </h3>
          {claimableCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E74C3C] text-white animate-pulse">
              {claimableCount} có thể nhận!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Claim All Button */}
          {claimableCount > 0 && (
            <button
              onClick={handleClaimAll}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7CB342] to-[#558B2F] hover:from-[#689F38] hover:to-[#33691E] text-white text-xs font-black shadow-sm btn-tactile flex items-center gap-1.5"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Nhận Tất Cả ({claimableCount})</span>
            </button>
          )}

          {/* Filter Pills (Swipeable on touch devices) */}
          <div className="flex items-center bg-[#FAF3E0] p-1 rounded-xl border border-[#E6D5BC] overflow-x-auto scrollbar-none touch-pan-x max-w-full shrink-0">
            <button
              onClick={() => {
                sound.playTap();
                setActiveCategory('all');
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap btn-tactile ${
                activeCategory === 'all' ? 'bg-[#E67E22] text-white shadow-sm' : 'text-[#8C6D53] hover:bg-[#F2E5D0]'
              }`}
            >
              Tất Cả ({gameState.quests.length})
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setActiveCategory('daily');
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap btn-tactile ${
                activeCategory === 'daily' ? 'bg-[#E67E22] text-white shadow-sm' : 'text-[#8C6D53] hover:bg-[#F2E5D0]'
              }`}
            >
              Hàng Ngày
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setActiveCategory('culinary');
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap btn-tactile ${
                activeCategory === 'culinary' ? 'bg-[#E67E22] text-white shadow-sm' : 'text-[#8C6D53] hover:bg-[#F2E5D0]'
              }`}
            >
              Ẩm Thực
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setActiveCategory('milestone');
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap btn-tactile ${
                activeCategory === 'milestone' ? 'bg-[#E67E22] text-white shadow-sm' : 'text-[#8C6D53] hover:bg-[#F2E5D0]'
              }`}
            >
              Cột Mốc
            </button>
          </div>
        </div>
      </div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuests.map((quest) => {
          const progressPercent = Math.min(100, Math.round((quest.progress / quest.target) * 100));
          const canClaim = quest.completed && !quest.claimed;

          return (
            <div
              key={quest.id}
              className={`border-2 rounded-2xl p-4 transition-all flex flex-col justify-between ${
                quest.claimed
                  ? 'bg-[#F9F6F0] border-[#E6D5BC]/60 opacity-75'
                  : canClaim
                  ? 'bg-[#FFF9E6] border-[#F39C12] shadow-md ring-2 ring-[#F39C12]/20'
                  : 'bg-[#FFFDF7] border-[#E6D5BC] shadow-cozy'
              }`}
            >
              <div>
                {/* Quest Top Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFE4B5] border border-[#D2691E]/30 flex items-center justify-center text-2xl shadow-sm select-none">
                      {quest.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#8B5A2B] leading-snug">{quest.title}</h4>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded bg-[#FAF3E0] text-[#8C6D53] border border-[#E6D5BC]">
                          {quest.category === 'daily' ? 'Hằng Ngày' : quest.category === 'culinary' ? 'Ẩm Thực' : 'Cột Mốc'}
                        </span>
                      </div>
                      <p className="text-xs text-[#8C6D53] mt-0.5 leading-relaxed">{quest.description}</p>
                    </div>
                  </div>

                  {quest.claimed && (
                    <span className="text-xs font-bold text-[#7CB342] flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-4 h-4" /> Đã nhận
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8C6D53] font-medium">Tiến độ:</span>
                    <span className="font-bold text-[#8B5A2B]">
                      {quest.progress} / {quest.target} {quest.unit} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#E6D5BC]/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        quest.completed ? 'bg-[#7CB342]' : 'bg-[#E67E22]'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quest Bottom Row: Rewards & Action */}
              <div className="mt-4 pt-3 border-t border-[#E6D5BC]/60 flex items-center justify-between gap-2">
                {/* Rewards Badges */}
                <div className="flex items-center flex-wrap gap-1.5 text-xs font-bold">
                  <span className="px-2 py-0.5 rounded-lg bg-[#FFE4B5] text-[#D35400] border border-[#D2691E]/20">
                    ⭐ +{quest.rewardExp} EXP
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                    💵 +${quest.rewardCash}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#FFF8DC] text-[#A0522D] border border-[#E6D5BC]">
                    💡 +{quest.rewardCp} CP
                  </span>
                </div>

                {/* Action Button */}
                {quest.claimed ? (
                  <span className="text-xs text-[#8C6D53] italic font-medium">Hoàn thành</span>
                ) : canClaim ? (
                  <button
                    onClick={() => handleClaim(quest.id)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#E67E22] to-[#D35400] hover:from-[#D35400] hover:to-[#BA4A00] text-white text-xs font-black shadow-sm btn-tactile animate-pulse flex items-center gap-1"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Nhận Thưởng</span>
                  </button>
                ) : (
                  <span className="text-xs text-[#9A8775] font-bold bg-[#FAF3E0] px-3 py-1 rounded-lg border border-[#E6D5BC]">
                    Chưa đạt
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Restaurant Tiers Roadmap */}
      <div className="bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-3xl p-5 sm:p-6 shadow-cozy">
        <h3 className="text-base font-bold text-[#8B5A2B] flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-[#E67E22]" /> Lộ Trình Thăng Hạng Đế Chế Ẩm Thực (Lv.1 ~ Lv.6)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {RESTAURANT_TIERS.map((tier) => {
            const isCurrent = tier.level === gameState.restaurantLevel;
            const isUnlocked = tier.level <= gameState.restaurantLevel;

            return (
              <div
                key={tier.level}
                className={`p-3 rounded-2xl border-2 text-center transition-all ${
                  isCurrent
                    ? 'bg-[#FFE4B5] border-[#D2691E] shadow-md ring-2 ring-[#D2691E]/30'
                    : isUnlocked
                    ? 'bg-[#F1F8E9] border-[#C8E6C9]'
                    : 'bg-[#FAF3E0]/70 border-[#E6D5BC] opacity-60'
                }`}
              >
                <div className="text-2xl sm:text-3xl mb-1">{tier.icon}</div>
                <div className="text-[10px] uppercase font-black text-[#D35400]">
                  Lv.{tier.level}
                </div>
                <div className="text-xs font-bold text-[#8B5A2B] truncate">{tier.name}</div>
                <div className="text-[11px] text-[#8C6D53] mt-1 font-medium">
                  {tier.requiredCash > 0 ? `$${tier.requiredCash.toLocaleString()}` : 'Khởi đầu'}
                </div>
                <div className="text-[10px] text-[#2E7D32] font-semibold mt-0.5">
                  🪑 {tier.maxSeats} chỗ
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
