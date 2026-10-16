import React, { useState } from 'react';
import { GameState, FoodBoxId } from '../../types';
import { FOODBOX_DEFINITIONS, FOODBOX_DROP_RATES, RARITY_THEME_COLORS } from '../../data/recipeDatabase';
import { sound } from '../../utils/sound';

interface ShopTabProps {
  gameState: GameState;
  onBuyIngredient: (ingredientId: string, amount: number) => void;
  onSellIngredient: (ingredientId: string, amount: number) => void;
  onOpenFoodBox: (boxId: FoodBoxId) => void;
  onBuyFoodBox: (boxId: FoodBoxId) => void;
  onEarnQuickCash: () => void;
}

export const ShopTab: React.FC<ShopTabProps> = ({
  gameState,
  onBuyIngredient,
  onSellIngredient,
  onOpenFoodBox,
  onBuyFoodBox,
  onEarnQuickCash,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ingredients' | 'foodboxes'>('ingredients');
  const [filterRarity, setFilterRarity] = useState<string>('all');

  // Format restock countdown (MM:SS)
  const minutes = Math.floor(gameState.shopRestockCountdown / 60);
  const seconds = gameState.shopRestockCountdown % 60;
  const timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const restockProgress = ((180 - gameState.shopRestockCountdown) / 180) * 100;

  // Filter ingredients
  const filteredIngredients = gameState.shopIngredients.filter((item) => {
    if (filterRarity === 'all') return true;
    return item.rarity === filterRarity;
  });

  const totalFoodBoxesOwned = Object.values(gameState.foodBoxesOwned).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Subtab Toggle Buttons & Quick Hustle Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-[#FFFDF7] p-2 sm:p-3 rounded-2xl border-2 border-[#E6D5BC] shadow-sm">
        <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center sm:gap-2 flex-1">
          <button
            onClick={() => {
              sound.playTap();
              setActiveSubTab('ingredients');
            }}
            className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all btn-tactile border text-center ${
              activeSubTab === 'ingredients'
                ? 'bg-[#E67E22] text-white border-[#D35400] shadow-sm'
                : 'bg-[#FFF8DC] text-[#8C6D53] border-transparent hover:bg-[#FFE4B5]'
            }`}
          >
            <span>🥬</span>
            <span className="truncate">Chợ (Restock 3p)</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveSubTab('foodboxes');
            }}
            className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all btn-tactile border relative text-center ${
              activeSubTab === 'foodboxes'
                ? 'bg-[#9333EA] text-white border-[#7E22CE] shadow-sm'
                : 'bg-[#FFF8DC] text-[#8C6D53] border-transparent hover:bg-[#FFE4B5]'
            }`}
          >
            <span>📦</span>
            <span className="truncate">Hộp FoodBox</span>
            {totalFoodBoxesOwned > 0 && (
              <span className="bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-bounce">
                {totalFoodBoxesOwned}
              </span>
            )}
          </button>
        </div>

        {/* Quick Hustle emergency tea button */}
        <button
          onClick={() => {
            sound.playCashRegister();
            onEarnQuickCash();
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white rounded-xl font-black text-xs shadow-sm hover:brightness-105 active:scale-95 transition-all btn-tactile border border-[#15803D] text-center"
          title="Bán trà đá vỉa hè kiếm nóng +$10 không tốn nguyên liệu"
        >
          <span>🥤</span>
          <span>Bán Trà Đá (+ $10 Nóng)</span>
        </button>
      </div>

      {/* SUBTAB 1: INGREDIENTS MARKET WITH 3-MIN RESTOCK */}
      {activeSubTab === 'ingredients' && (
        <div className="space-y-4">
          {/* Restock Timer Banner */}
          <div className="bg-gradient-to-r from-[#FFF8E7] via-[#FFF3D6] to-[#FFE8B8] border-2 border-[#E6D5BC] rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#E67E22]/15 border border-[#E67E22]/30 flex items-center justify-center text-xl sm:text-2xl animate-pulse shrink-0">
                ⏰
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-base font-black text-[#5C3A21] truncate">
                    Làm Mới Chợ Tự Động (3 Phút)
                  </h3>
                  <span className="text-[10px] font-bold bg-[#E67E22] text-white px-2 py-0.2 rounded-full shrink-0">
                    Đợt #{gameState.shopRestockCyclesCount + 1}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#8C6D53] line-clamp-1 sm:line-clamp-none">
                  Tồn kho chợ có hạn, giảm giá ngẫu nhiên mỗi 3 phút!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
              {/* Countdown badge with progress */}
              <div className="flex items-center justify-between gap-2.5 bg-white px-3 py-1.5 rounded-xl border border-[#E6D5BC] shadow-inner w-full md:w-auto">
                <span className="text-xs text-[#8C6D53] font-bold">Làm mới sau:</span>
                <span className="font-mono font-black text-sm sm:text-base text-[#E67E22] tracking-wider">
                  {timerDisplay}
                </span>
                <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#F39C12] to-[#E67E22] h-2 transition-all duration-1000 rounded-full"
                    style={{ width: `${restockProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rarity Filter Tabs (Swipeable on touch devices) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 touch-pan-x">
            {['all', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythical'].map((rarity) => (
              <button
                key={rarity}
                onClick={() => {
                  sound.playTap();
                  setFilterRarity(rarity);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 btn-tactile ${
                  filterRarity === rarity
                    ? 'bg-[#5C3A21] text-white border-[#3E2716] shadow-sm'
                    : 'bg-white text-[#8C6D53] border-[#E6D5BC] hover:bg-[#FAF3E0]'
                }`}
              >
                {rarity === 'all' ? '🔍 Tất Cả' : rarity}
              </button>
            ))}
          </div>

          {/* Ingredients Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredIngredients.map((item) => {
              const userOwned = gameState.inventory[item.id] || 0;
              const unitPrice = item.discountPercent
                ? Math.round(item.basePrice * (1 - item.discountPercent / 100))
                : item.basePrice;
              const canAffordOne = gameState.cash >= unitPrice && item.currentStock > 0;
              const canAffordAll = gameState.cash >= unitPrice * item.currentStock && item.currentStock > 0;
              const rarityStyle =
                item.rarity === 'Mythical'
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : item.rarity === 'Legendary'
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : item.rarity === 'Epic'
                  ? 'bg-purple-50 border-purple-300 text-purple-700'
                  : item.rarity === 'Rare'
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700';

              return (
                <div
                  key={item.id}
                  className={`bg-[#FFFDF7] rounded-2xl border-2 p-3.5 flex flex-col justify-between shadow-sm transition-all hover:shadow-md ${
                    item.currentStock === 0
                      ? 'border-gray-200 opacity-70 bg-gray-50/50'
                      : 'border-[#E6D5BC]'
                  }`}
                >
                  <div>
                    {/* Top Rarity & Discount Badges */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${rarityStyle}`}>
                        {item.rarity} {item.luckBonus > 0 && `(+${item.luckBonus}% May Mắn)`}
                      </span>

                      {item.discountPercent ? (
                        <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                          GIẢM {item.discountPercent}%
                        </span>
                      ) : item.currentStock === 0 ? (
                        <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          Tạm hết hàng
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#8C6D53]">
                          Tồn chợ: {item.currentStock}/{item.maxStock}
                        </span>
                      )}
                    </div>

                    {/* Ingredient Title & Icon */}
                    <div className="flex items-center gap-2.5 my-1.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF8DC] border border-[#E6D5BC] flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-[#5C3A21] truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-[#8C6D53] line-clamp-1">
                          {item.description}
                        </p>
                        <div className="text-[10px] font-bold text-amber-700 mt-0.5">
                          Kho của bạn: <span className="text-emerald-700 font-black">{userOwned} {item.unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="mt-3 pt-2.5 border-t border-[#F0E6D2]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#8C6D53] font-bold">Giá bán:</span>
                      <div className="text-right">
                        {item.discountPercent && (
                          <span className="text-[10px] text-gray-400 line-through mr-1">
                            ${item.basePrice}
                          </span>
                        )}
                        <span className="text-sm font-black text-emerald-700">
                          ${unitPrice}
                        </span>
                        <span className="text-[10px] text-[#8C6D53]">/{item.unit}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          sound.playCashRegister();
                          onBuyIngredient(item.id, 1);
                        }}
                        disabled={!canAffordOne}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all btn-tactile flex items-center justify-center gap-1 border ${
                          canAffordOne
                            ? 'bg-[#E67E22] text-white border-[#D35400] hover:bg-[#D35400]'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        <span>🛒</span>
                        <span>Mua 1</span>
                      </button>

                      <button
                        onClick={() => {
                          sound.playCashRegister();
                          onBuyIngredient(item.id, item.currentStock);
                        }}
                        disabled={!canAffordAll || item.currentStock <= 1}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all btn-tactile flex items-center justify-center gap-1 border ${
                          canAffordAll && item.currentStock > 1
                            ? 'bg-[#22C55E] text-white border-[#16A34A] hover:bg-[#16A34A]'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        <span>⚡</span>
                        <span>Mua Hết ({item.currentStock})</span>
                      </button>
                    </div>

                    {/* Sell back if owned */}
                    {userOwned > 0 && (
                      <button
                        onClick={() => {
                          sound.playCashRegister();
                          onSellIngredient(item.id, 1);
                        }}
                        className="w-full mt-1.5 py-1 text-[10px] font-bold text-[#8C6D53] hover:text-amber-800 bg-[#FAF3E0] hover:bg-[#FFE4B5] rounded-lg border border-[#E6D5BC] transition-all text-center"
                      >
                        Thanh lý 1 lại chợ (+${Math.round(item.basePrice * 0.75)})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: FOODBOX MYSTERY CRATES */}
      {activeSubTab === 'foodboxes' && (
        <div className="space-y-5">
          {/* Foodbox Drop Rates Overview Card */}
          <div className="bg-gradient-to-r from-[#FAF5FF] via-[#F3E8FF] to-[#EDE9FE] border-2 border-[#D8B4FE] rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl animate-bounce">📦</span>
                <div>
                  <h3 className="text-base font-black text-[#581C87]">
                    Tỉ Lệ Mở Công Thức Từ Hộp Bí Ẩn FoodBox
                  </h3>
                  <p className="text-xs text-[#7E22CE]">
                    Mỗi FoodBox cho ra trực tiếp 1 công thức món ăn mới tinh mà không cần phối nguyên liệu!
                  </p>
                </div>
              </div>
            </div>

            {/* Drop Rates Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#E9D5FF]">
              {FOODBOX_DROP_RATES.map((tier) => (
                <div
                  key={tier.rarity}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-[#D8B4FE] text-center"
                >
                  <div
                    className="text-[10px] font-black uppercase tracking-wider"
                    style={{ color: tier.color }}
                  >
                    {tier.rarity}
                  </div>
                  <div className="text-base font-black text-[#581C87]">{tier.label}</div>
                  <div className="text-[9px] text-gray-500">Tỉ lệ xuất hiện</div>
                </div>
              ))}
            </div>
          </div>

          {/* FoodBox Crates List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FOODBOX_DEFINITIONS.map((box) => {
              const ownedCount = gameState.foodBoxesOwned[box.id] || 0;
              const canAffordCash = gameState.cash >= box.costCash;

              return (
                <div
                  key={box.id}
                  className={`bg-[#FFFDF7] rounded-2xl border-2 p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all ${box.borderClass}`}
                >
                  <div>
                    {/* Header with Icon & Owned Count */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${box.bgGradient} border ${box.borderClass} flex items-center justify-center text-3xl shadow-sm`}
                      >
                        {box.icon}
                      </div>

                      {ownedCount > 0 ? (
                        <span className="bg-[#9333EA] text-white text-xs font-black px-3 py-1 rounded-full shadow-sm animate-pulse">
                          Đang có: {ownedCount} Hộp
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-[#8C6D53] bg-[#FFF8DC] px-2.5 py-1 rounded-full border border-[#E6D5BC]">
                          Chưa có hộp
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-black text-[#5C3A21] mb-0.5">
                      {box.name}
                    </h4>
                    <p className="text-xs font-bold text-[#8C6D53] mb-2">{box.subtitle}</p>
                    <p className="text-xs text-[#5C3A21]/80 leading-relaxed bg-[#FFF8DC]/40 p-2.5 rounded-xl border border-[#E6D5BC]">
                      {box.description}
                    </p>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-[#F0E6D2] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8C6D53] font-bold">Giá mua shop:</span>
                      <span className="text-sm font-black text-emerald-700">
                        ${box.costCash.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Open Owned Box Button */}
                      <button
                        onClick={() => {
                          sound.playCelebration();
                          onOpenFoodBox(box.id);
                        }}
                        disabled={ownedCount <= 0}
                        className={`py-2 px-3 rounded-xl text-xs font-black transition-all btn-tactile flex items-center justify-center gap-1.5 border ${
                          ownedCount > 0
                            ? 'bg-[#9333EA] text-white border-[#7E22CE] hover:bg-[#7E22CE] shadow-sm'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        <span>🎁</span>
                        <span>Mở Ngay ({ownedCount})</span>
                      </button>

                      {/* Buy & Open Button */}
                      <button
                        onClick={() => {
                          sound.playCashRegister();
                          onBuyFoodBox(box.id);
                        }}
                        disabled={!canAffordCash}
                        className={`py-2 px-3 rounded-xl text-xs font-black transition-all btn-tactile flex items-center justify-center gap-1.5 border ${
                          canAffordCash
                            ? 'bg-[#E67E22] text-white border-[#D35400] hover:bg-[#D35400] shadow-sm'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        <span>🛒</span>
                        <span>Mua (${box.costCash})</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
