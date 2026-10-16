import React from 'react';
import { GameState } from '../../types';
import { MARKET_TRENDS } from '../../data/gameData';
import { sound } from '../../utils/audio';
import { TrendingUp, Truck, Store, Smartphone, Megaphone, Sparkles, Check } from 'lucide-react';

interface MarketTabProps {
  gameState: GameState;
  onToggleChannel: (channel: 'foodTruck' | 'popUp' | 'onlineDelivery') => void;
  onRunCampaign: (type: 'flyer' | 'tiktoker' | 'tv') => void;
}

export const MarketTab: React.FC<MarketTabProps> = ({
  gameState,
  onToggleChannel,
  onRunCampaign,
}) => {
  const currentTrend = gameState.currentTrend;

  const channels = [
    {
      id: 'foodTruck' as const,
      name: 'Xe Food Truck Lưu Động',
      icon: '🚚',
      costToUnlock: 800,
      dailyBonus: '+$90/ngày',
      desc: 'Bán thêm đồ ăn sáng & ăn vặt tại các tòa nhà văn phòng và trường học.',
      unlocked: gameState.channels.foodTruck,
    },
    {
      id: 'popUp' as const,
      name: 'Gian Hàng Pop-up Chợ Đêm',
      icon: '🎪',
      costToUnlock: 2200,
      dailyBonus: '+$240/ngày',
      desc: 'Xuất hiện vào các buổi tối cuối tuần tại các hội chợ ẩm thực sầm uất.',
      unlocked: gameState.channels.popUp,
    },
    {
      id: 'onlineDelivery' as const,
      name: 'Dịch Vụ Giao Hàng App Online',
      icon: '🛵',
      costToUnlock: 4500,
      dailyBonus: '+35% đơn hàng',
      desc: 'Kết nối mạng lưới shipper công nghệ phủ sóng khắp thành phố.',
      unlocked: gameState.channels.onlineDelivery,
    },
  ];

  const campaigns = [
    {
      id: 'flyer' as const,
      name: 'Phát Tờ Rơi Khu Phố',
      icon: '📄',
      cost: 45,
      reputationBoost: 4,
      desc: 'Phát tờ rơi voucher giảm giá cho cư dân và nhân viên văn phòng xung quanh.',
    },
    {
      id: 'tiktoker' as const,
      name: 'Mời Food Reviewer TikTok',
      icon: '📸',
      cost: 180,
      reputationBoost: 12,
      desc: 'Quay video review các món đặc sắc đăng lên mạng xã hội với hàng vạn lượt xem.',
    },
    {
      id: 'tv' as const,
      name: 'Phát Sóng Phóng Sự Truyền Hình',
      icon: '📺',
      cost: 850,
      reputationBoost: 25,
      desc: 'Được tôn vinh trong chuyên mục "Khám Phá Hương Vị Việt" trên đài truyền hình quốc gia.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Current Active Market Trend Banner */}
      <div className="bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-3xl p-5 shadow-cozy relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#FFE4B5] border-2 border-[#D2691E]/30 flex items-center justify-center text-3xl shadow-sm">
              {currentTrend.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E67E22]/15 text-[#D35400]">
                  Xu Hướng Hiện Tại (Còn {currentTrend.daysRemaining} ngày)
                </span>
                <h3 className="text-lg font-bold text-[#8B5A2B]">{currentTrend.name}</h3>
              </div>
              <p className="text-xs text-[#8C6D53] mt-1 max-w-xl leading-relaxed">{currentTrend.tagline}</p>
              <div className="flex items-center gap-3 mt-2 text-xs font-bold text-[#2E7D32]">
                <span>📈 Doanh thu nhóm món tăng: x{currentTrend.revenueMultiplier}</span>
                <span>•</span>
                <span>👥 Lượng khách tăng: x{currentTrend.visitorMultiplier}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Channels Expansion */}
      <div>
        <h4 className="text-sm font-bold text-[#8B5A2B] mb-3 flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-[#8B5A2B]" /> Mở Rộng Kênh Phân Phối & Bán Hàng
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {channels.map((chan) => {
            const canAfford = gameState.cash >= chan.costToUnlock;

            return (
              <div
                key={chan.id}
                className={`bg-[#FFFDF7] border-2 rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all ${
                  chan.unlocked ? 'border-[#C8E6C9] bg-[#F1F8E9]' : 'border-[#E6D5BC]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{chan.icon}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        chan.unlocked ? 'bg-[#C8E6C9] text-[#2E7D32]' : 'bg-[#FFE4B5] text-[#D35400]'
                      }`}
                    >
                      {chan.unlocked ? '✓ Đang Hoạt Động' : `Chi phí: $${chan.costToUnlock}`}
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-[#8B5A2B] mt-2.5">{chan.name}</h5>
                  <p className="text-xs text-[#8C6D53] mt-1 leading-relaxed">{chan.desc}</p>
                  <span className="text-xs font-black text-[#2E7D32] mt-2 block">Hiệu quả: {chan.dailyBonus}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E6D5BC]">
                  {!chan.unlocked ? (
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        sound.playCashRegister();
                        onToggleChannel(chan.id);
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-bold btn-tactile shadow-sm ${
                        canAfford
                          ? 'bg-[#E67E22] hover:bg-[#D35400] text-white'
                          : 'bg-[#E0D3C1] text-[#9A8775] cursor-not-allowed'
                      }`}
                    >
                      Đầu Tư Kênh (${chan.costToUnlock})
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-[#2E7D32] flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Đã kích hoạt liên tục
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Marketing Campaigns */}
      <div>
        <h4 className="text-sm font-bold text-[#8B5A2B] mb-3 flex items-center gap-1.5">
          <Megaphone className="w-4 h-4 text-[#E67E22]" /> Chiến Dịch Quảng Bá & Thu Hút Khách Hàng
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaigns.map((camp) => {
            const canAfford = gameState.cash >= camp.cost;

            return (
              <div
                key={camp.id}
                className="bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-2xl p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{camp.icon}</span>
                    <span className="text-xs font-black text-[#E67E22]">${camp.cost}</span>
                  </div>

                  <h5 className="text-sm font-bold text-[#8B5A2B] mt-2.5">{camp.name}</h5>
                  <p className="text-xs text-[#8C6D53] mt-1 leading-relaxed">{camp.desc}</p>
                  <span className="text-xs font-black text-[#7CB342] mt-2 block">
                    + {camp.reputationBoost}% Danh tiếng thương hiệu
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E6D5BC]">
                  <button
                    disabled={!canAfford}
                    onClick={() => {
                      sound.playCashRegister();
                      onRunCampaign(camp.id);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold btn-tactile shadow-sm ${
                      canAfford
                        ? 'bg-[#7CB342] hover:bg-[#689F38] text-white'
                        : 'bg-[#E0D3C1] text-[#9A8775] cursor-not-allowed'
                    }`}
                  >
                    Thực Hiện Chiến Dịch (${camp.cost})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
