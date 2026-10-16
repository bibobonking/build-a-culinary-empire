import React from 'react';
import { GameState, RestaurantTier, KitchenEquipment } from '../../types';
import { RESTAURANT_TIERS } from '../../data/gameData';
import { sound } from '../../utils/sound';

interface KitchenTabProps {
  gameState: GameState;
  onUpgradeTier: () => void;
  onBuyEquipment: (equipmentId: string) => void;
  onExpandSeats: () => void;
}

export const KitchenTab: React.FC<KitchenTabProps> = ({
  gameState,
  onUpgradeTier,
  onBuyEquipment,
  onExpandSeats,
}) => {
  const currentTier = RESTAURANT_TIERS.find((t) => t.level === gameState.restaurantLevel) || RESTAURANT_TIERS[0];
  const nextTier = RESTAURANT_TIERS.find((t) => t.level === gameState.restaurantLevel + 1);

  // Nâng cấp dựa trên số nhiệm vụ đã nhận thưởng + tiền + uy tín (không còn yêu cầu số công thức)
  const claimedQuestsCount = gameState.quests.filter((q) => q.claimed).length;

  const canUpgradeTier =
    Boolean(nextTier) &&
    gameState.cash >= (nextTier?.requiredCash || 0) &&
    claimedQuestsCount >= (nextTier?.requiredQuests || 0) &&
    gameState.reputation >= (nextTier?.requiredReputation || 0);

  const seatExpandCost = Math.round(gameState.seats * 25 + 50);
  const canExpandSeats = gameState.cash >= seatExpandCost && gameState.seats < currentTier.maxSeats;

  return (
    <div className="space-y-5">
      {/* SECTION 1: NÂNG CẤP CẤP BẬC NHÀ HÀNG (RESTAURANT TIER UPGRADE) */}
      <div className="bg-[#FFFDF7] rounded-2xl border-2 border-[#E6D5BC] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#F0E6D2]">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF8DC] border border-[#E6D5BC] flex items-center justify-center text-3xl shadow-inner">
              {currentTier.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#5C3A21]">
                  Cấp Bậc Hiện Tại: {currentTier.name}
                </h3>
                <span className="bg-[#E67E22] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Cấp {currentTier.level}/6
                </span>
              </div>
              <p className="text-xs text-[#8C6D53]">{currentTier.title} &bull; {currentTier.description}</p>
            </div>
          </div>
        </div>

        {/* Tier Stats Comparison */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#FFF8E7] p-2.5 rounded-xl border border-[#E6D5BC] text-center">
            <div className="text-[10px] font-bold text-[#8C6D53]">Sức Chứa Bàn</div>
            <div className="text-sm sm:text-base font-black text-[#5C3A21]">
              {gameState.seats} / {currentTier.maxSeats} ghế
            </div>
          </div>

          <div className="bg-[#FFF8E7] p-2.5 rounded-xl border border-[#E6D5BC] text-center">
            <div className="text-[10px] font-bold text-[#8C6D53]">Lượng Khách Cơ Bản</div>
            <div className="text-sm sm:text-base font-black text-[#5C3A21]">
              {currentTier.baseVisitors} khách/giờ
            </div>
          </div>

          <div className="bg-[#FFF8E7] p-2.5 rounded-xl border border-[#E6D5BC] text-center">
            <div className="text-[10px] font-bold text-[#8C6D53]">Vị Trí Nấu Bếp</div>
            <div className="text-sm sm:text-base font-black text-[#5C3A21]">
              {currentTier.cookingSlots} vị trí
            </div>
          </div>

          <div className="bg-[#FFF8E7] p-2.5 rounded-xl border border-[#E6D5BC] text-center">
            <div className="text-[10px] font-bold text-[#8C6D53]">May Mắn Crafting</div>
            <div className="text-sm sm:text-base font-black text-emerald-700">
              +{currentTier.luckBonus}% May Mắn
            </div>
          </div>
        </div>

        {/* Next Tier Upgrade Box */}
        {nextTier ? (
          <div className="bg-gradient-to-r from-[#FFF8E7] via-[#FFF3D6] to-[#FFE8B8] rounded-2xl border-2 border-[#E6D5BC] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{nextTier.icon}</span>
                <div>
                  <h4 className="text-sm font-black text-[#5C3A21]">
                    Nâng Cấp Lên: {nextTier.name} (Cấp {nextTier.level})
                  </h4>
                  <p className="text-xs text-[#8C6D53]">{nextTier.description}</p>
                </div>
              </div>
            </div>

            {/* Upgrade Requirements Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div
                className={`p-2 rounded-xl border flex items-center justify-between ${
                  gameState.cash >= nextTier.requiredCash
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-[#E6D5BC] text-[#8C6D53]'
                }`}
              >
                <span>Tiền mặt:</span>
                <span className="font-black">
                  ${gameState.cash.toLocaleString()} / ${nextTier.requiredCash.toLocaleString()}
                </span>
              </div>

              <div
                className={`p-2 rounded-xl border flex items-center justify-between ${
                  claimedQuestsCount >= nextTier.requiredQuests
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-[#E6D5BC] text-[#8C6D53]'
                }`}
              >
                <span>Nhiệm vụ đã nhận thưởng:</span>
                <span className="font-black">
                  {claimedQuestsCount} / {nextTier.requiredQuests} nhiệm vụ
                </span>
              </div>

              <div
                className={`p-2 rounded-xl border flex items-center justify-between ${
                  gameState.reputation >= nextTier.requiredReputation
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-[#E6D5BC] text-[#8C6D53]'
                }`}
              >
                <span>Điểm Uy Tín:</span>
                <span className="font-black">
                  {gameState.reputation} / {nextTier.requiredReputation} ⭐
                </span>
              </div>
            </div>

            {/* Upgrade Action Button */}
            <button
              onClick={() => {
                sound.playTap();
                onUpgradeTier();
              }}
              disabled={!canUpgradeTier}
              className={`w-full py-3 rounded-xl font-black text-sm sm:text-base transition-all btn-tactile flex items-center justify-center gap-2 border shadow-sm ${
                canUpgradeTier
                  ? 'bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white border-[#B94A00] hover:brightness-105 active:scale-98 animate-pulse'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
            >
              <span>🏰</span>
              <span>Nâng Cấp Cơ Sở Lên {nextTier.name} (${nextTier.requiredCash.toLocaleString()})</span>
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border-2 border-amber-400 rounded-2xl p-4 text-center">
            <div className="text-3xl mb-1">👑</div>
            <h4 className="text-base font-black text-amber-900">
              Bạn Đã Đạt Cấp Bậc Tối Thượng: Tập Đoàn Michelin Toàn Cầu!
            </h4>
            <p className="text-xs text-amber-800 mt-1">
              Đế chế ẩm thực của bạn đã đứng trên đỉnh cao thế giới. Tiếp tục sưu tầm các món Secret và thu hút các tỷ phú VIP nhé!
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: TRANG THIẾT BỊ BẾP TỐI TÂN */}
      <div className="bg-[#FFFDF7] rounded-2xl border-2 border-[#E6D5BC] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0E6D2]">
          <div>
            <h3 className="text-base font-black text-[#5C3A21] flex items-center gap-2">
              <span>🔥</span>
              <span>Trang Thiết Bị Bếp & Dụng Cụ Sáng Chế</span>
            </h3>
            <p className="text-xs text-[#8C6D53]">
              Nâng cấp thiết bị giúp nấu nhanh hơn và tăng vọt chỉ số May Mắn khi phối nguyên liệu!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {gameState.equipment.map((item) => {
            const canAfford = gameState.cash >= item.cost;
            const canUnlockTier = gameState.restaurantLevel >= item.requiredTier;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border-2 p-3.5 flex flex-col justify-between shadow-xs ${
                  item.unlocked
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-[#E6D5BC]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{item.icon}</span>
                    {item.unlocked ? (
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                        ✓ Đã Sở Hữu
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#8C6D53] bg-[#FAF3E0] px-2 py-0.5 rounded-full border border-[#E6D5BC]">
                        Yêu cầu Cấp {item.requiredTier}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-black text-[#5C3A21] mb-1">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-[#8C6D53] mb-2">{item.description}</p>

                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      ⚡ Tốc độ: +{item.speedBonus}%
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      🍀 May mắn: +{item.luckBonus}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#F0E6D2]">
                  {item.unlocked ? (
                    <div className="text-center py-1 text-xs font-bold text-emerald-700">
                      Thiết bị đang hoạt động công suất tối đa
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        sound.playCashRegister();
                        onBuyEquipment(item.id);
                      }}
                      disabled={!canAfford || !canUnlockTier}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all btn-tactile flex items-center justify-center gap-1.5 border ${
                        canAfford && canUnlockTier
                          ? 'bg-[#E67E22] text-white border-[#D35400] hover:bg-[#D35400] shadow-xs'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <span>🛒</span>
                      <span>
                        {!canUnlockTier
                          ? `Cần Cấp ${item.requiredTier}`
                          : `Mua Thiết Bị ($${item.cost.toLocaleString()})`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: MỞ RỘNG BÀN GHẾ KHÁCH ĂN */}
      <div className="bg-[#FFFDF7] rounded-2xl border-2 border-[#E6D5BC] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪑</span>
            <h4 className="text-sm sm:text-base font-black text-[#5C3A21]">
              Mở Rộng Thêm Bàn Ghế Khách Ngồi ({gameState.seats}/{currentTier.maxSeats} Ghế)
            </h4>
          </div>
          <p className="text-xs text-[#8C6D53] mt-0.5">
            Thêm bàn ăn giúp quán đón được nhiều thực khách cùng lúc hơn trong giờ cao điểm.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playCashRegister();
            onExpandSeats();
          }}
          disabled={!canExpandSeats}
          className={`w-full sm:w-auto justify-center py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all btn-tactile flex items-center gap-1.5 border whitespace-nowrap text-center ${
            canExpandSeats
              ? 'bg-[#22C55E] text-white border-[#16A34A] hover:bg-[#16A34A] shadow-sm'
              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          }`}
        >
          <span>➕</span>
          <span>
            {gameState.seats >= currentTier.maxSeats
              ? 'Đã Đạt Giới Hạn Cấp Này'
              : `Thêm 2 Ghế ($${seatExpandCost})`}
          </span>
        </button>
      </div>
    </div>
  );
};
