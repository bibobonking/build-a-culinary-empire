import React, { useState } from 'react';
import { GameState, SupplierType } from '../../types';
import { INGREDIENTS } from '../../data/gameData';
import { sound } from '../../utils/audio';
import { ShoppingCart, AlertTriangle, ShieldCheck, Sparkles, Plus, TrendingDown, TrendingUp } from 'lucide-react';

interface IngredientsTabProps {
  gameState: GameState;
  onBuyIngredient: (ingredientId: string, amount: number, supplier: SupplierType) => void;
  onBuyAllRestock: (supplier: SupplierType) => void;
  onSellIngredient: (ingredientId: string, amount: number) => void;
  onEarnQuickCash: () => void;
  onClaimEmergencyRelief: () => void;
}

export const IngredientsTab: React.FC<IngredientsTabProps> = ({
  gameState,
  onBuyIngredient,
  onBuyAllRestock,
  onSellIngredient,
  onEarnQuickCash,
  onClaimEmergencyRelief,
}) => {
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierType>('supermarket');
  const [buyQuantity, setBuyQuantity] = useState<number>(5);

  const suppliers = [
    {
      id: 'market' as SupplierType,
      name: 'Chợ Dân Sinh Địa Phương',
      icon: '🧺',
      badge: 'Giá Rẻ (-15%)',
      priceMultiplier: 0.85,
      freshness: 85,
      desc: 'Nguyên liệu bình dân giá mềm, độ tươi khá, thích hợp cho giai đoạn đầu.',
      color: 'border-[#AED581]',
    },
    {
      id: 'supermarket' as SupplierType,
      name: 'Siêu Thị Tiện Lợi Uy Tín',
      icon: '🏪',
      badge: 'Tiêu Chuẩn',
      priceMultiplier: 1.0,
      freshness: 95,
      desc: 'Nguồn hàng đảm bảo an toàn vệ sinh thực phẩm, chất lượng đồng đều.',
      color: 'border-[#8B5A2B]',
    },
    {
      id: 'premium' as SupplierType,
      name: 'Nông Trại Organic Cao Cấp',
      icon: '🌱',
      badge: 'Hảo Hạng (+30%)',
      priceMultiplier: 1.3,
      freshness: 100,
      desc: 'Được chứng nhận hữu cơ quốc tế, tăng điểm đánh giá từ thực khách khó tính.',
      color: 'border-[#7CB342]',
    },
  ];

  const currentSupplierInfo = suppliers.find((s) => s.id === selectedSupplier)!;

  // Seasonal price multiplier calculation
  const getSeasonPriceFactor = (category: string) => {
    const s = gameState.season;
    if (s === 'spring' && category === 'produce') return 0.85; // fresh spring veggies cheaper
    if (s === 'summer' && category === 'seafood') return 0.9; // abundant summer catch
    if (s === 'autumn' && category === 'meat') return 1.1; // autumn demand up
    if (s === 'winter' && (category === 'produce' || category === 'seafood')) return 1.25; // winter scarcity
    return 1.0;
  };

  const calculateUnitPrice = (basePrice: number, category: string) => {
    const seasonFactor = getSeasonPriceFactor(category);
    return Math.round(basePrice * currentSupplierInfo.priceMultiplier * seasonFactor * 10) / 10;
  };

  return (
    <div className="space-y-5">
      {/* Emergency Fund & Quick Hustle Tip if Low Cash */}
      {gameState.cash < 35 && (
        <div className="bg-[#FFF8DC] border-2 border-[#E67E22] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💡</span>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#8B5A2B]">
                Cần Thêm Vốn Để Mua Nguyên Liệu?
              </h4>
              <p className="text-[11px] text-[#8C6D53]">
                Tiền mặt hiện có: <strong className="text-[#C0392B]">${gameState.cash}</strong>. Bạn có thể bán trà đá vỉa hè để kiếm thêm tiền tức thì, hoặc nhận gói cứu trợ nếu cạn vốn!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onEarnQuickCash}
              className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-black shadow-sm btn-tactile flex items-center justify-center gap-1.5"
            >
              <span>🥤</span>
              <span>Bán Trà Đá (+$10)</span>
            </button>
            <button
              onClick={onClaimEmergencyRelief}
              className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-black shadow-sm btn-tactile flex items-center justify-center gap-1.5"
            >
              <span>🏛️</span>
              <span>Gói Cứu Trợ ($200)</span>
            </button>
          </div>
        </div>
      )}

      {/* Supplier Selector Cards */}
      <div>
        <h3 className="text-sm font-bold text-[#8B5A2B] mb-2 flex items-center gap-1.5">
          <span>🚚</span> Chọn Nhà Cung Cấp Nguyên Liệu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {suppliers.map((sup) => (
            <button
              key={sup.id}
              onClick={() => {
                sound.playTap();
                setSelectedSupplier(sup.id);
              }}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all btn-tactile ${
                selectedSupplier === sup.id
                  ? 'bg-[#FFFDF7] border-[#D2691E] shadow-cozy ring-2 ring-[#D2691E]/20'
                  : 'bg-[#FFF8DC]/60 border-[#E6D5BC] hover:bg-[#FFF8DC]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{sup.icon}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFE4B5] text-[#8B5A2B]">
                  {sup.badge}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#8B5A2B] mt-2">{sup.name}</h4>
              <p className="text-xs text-[#8C6D53] mt-1 leading-relaxed">{sup.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Quantity Controls and Restock All */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFFDF7] border-2 border-[#E6D5BC] p-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#8B5A2B]">Số lượng mua mỗi lần:</span>
          {[1, 5, 10, 20].map((qty) => (
            <button
              key={qty}
              onClick={() => {
                sound.playTap();
                setBuyQuantity(qty);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all btn-tactile border ${
                buyQuantity === qty
                  ? 'bg-[#8B5A2B] text-white border-[#8B5A2B]'
                  : 'bg-[#FFF8DC] text-[#8C6D53] border-[#E6D5BC] hover:bg-[#FFE4B5]'
              }`}
            >
              +{qty}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            sound.playCashRegister();
            onBuyAllRestock(selectedSupplier);
          }}
          className="px-4 py-1.5 rounded-xl bg-[#7CB342] hover:bg-[#689F38] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 btn-tactile"
          title="Tự động mua bù cho tất cả các nguyên liệu đang dưới 10 đơn vị"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Mua Đầy Kho Tự Động</span>
        </button>
      </div>

      {/* Ingredients Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {INGREDIENTS.map((item) => {
          const stock = gameState.inventory[item.id] || 0;
          const freshness = (gameState.inventoryFreshness && gameState.inventoryFreshness[item.id]) || 90;
          const unitPrice = calculateUnitPrice(item.basePrice, item.category);
          const totalPrice = Math.round(unitPrice * buyQuantity * 10) / 10;
          const canAfford = gameState.cash >= totalPrice;
          const seasonFactor = getSeasonPriceFactor(item.category);

          return (
            <div
              key={item.id}
              className="bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-2xl p-3.5 flex flex-col justify-between shadow-cozy hover:border-[#D2691E]/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-[#8B5A2B] leading-tight">{item.name}</h4>
                      <span className="text-xs text-[#E67E22] font-black">
                        ${unitPrice} / {item.unit}
                      </span>
                    </div>
                  </div>

                  {seasonFactor !== 1.0 && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                        seasonFactor < 1.0
                          ? 'bg-[#E8F5E9] text-[#2E7D32]'
                          : 'bg-[#FFEBEE] text-[#C62828]'
                      }`}
                    >
                      {seasonFactor < 1.0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {seasonFactor < 1.0 ? 'Theo mùa rẻ' : 'Đắt mùa này'}
                    </span>
                  )}
                </div>

                {/* Stock & Freshness Bars */}
                <div className="mt-3 space-y-1.5 text-xs text-[#8C6D53]">
                  <div className="flex items-center justify-between">
                    <span>Số lượng tồn kho:</span>
                    <strong
                      className={`font-black ${
                        stock === 0 ? 'text-[#C0392B]' : stock < 5 ? 'text-[#E67E22]' : 'text-[#2E7D32]'
                      }`}
                    >
                      {stock} {item.unit}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Độ tươi ngon:</span>
                    <span className="font-bold text-[#8B5A2B]">{Math.round(freshness)}%</span>
                  </div>

                  {/* Freshness visual bar */}
                  <div className="w-full bg-[#E6D5BC] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        freshness > 70 ? 'bg-[#7CB342]' : freshness > 40 ? 'bg-[#F39C12]' : 'bg-[#E74C3C]'
                      }`}
                      style={{ width: `${freshness}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons (Sell 1 unit for cash / Buy) */}
              <div className="mt-4 pt-3 border-t border-[#E6D5BC] flex items-center justify-between gap-2">
                <div>
                  {stock > 0 ? (
                    <button
                      onClick={() => onSellIngredient(item.id, 1)}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF3E0] hover:bg-[#FFE4B5] border border-[#E6D5BC] text-[11px] font-bold text-[#8B5A2B] btn-tactile"
                      title={`Thanh lý 1 ${item.unit} cho chợ đầu mối thu về 75% giá trị (+$${Math.round(item.basePrice * 0.75)})`}
                    >
                      Bán 1 (+${Math.round(item.basePrice * 0.75)})
                    </button>
                  ) : (
                    <span className="text-xs text-[#8C6D53]">
                      Tổng: <strong className="text-[#8B5A2B]">${totalPrice}</strong>
                    </span>
                  )}
                </div>

                <button
                  disabled={!canAfford}
                  onClick={() => {
                    sound.playCashRegister();
                    onBuyIngredient(item.id, buyQuantity, selectedSupplier);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 btn-tactile shadow-sm ${
                    canAfford
                      ? 'bg-[#E67E22] hover:bg-[#D35400] text-white'
                      : 'bg-[#E0D3C1] text-[#9A8775] cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Mua +{buyQuantity}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
