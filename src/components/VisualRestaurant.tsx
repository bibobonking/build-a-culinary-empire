import React from 'react';
import { GameState, Order, RestaurantTier } from '../types';
import { RESTAURANT_TIERS, SEASONAL_EVENTS } from '../data/gameData';
import { sound } from '../utils/audio';
import { Sparkles } from 'lucide-react';
import { RestaurantCanvas } from './RestaurantCanvas';

interface VisualRestaurantProps {
  gameState: GameState;
  onCallCustomer: () => void;
  onCheerStaff: () => void;
  cheerCooldown: boolean;
  onEarnQuickCash: () => void;
}

const VisualRestaurantBase: React.FC<VisualRestaurantProps> = ({
  gameState,
  onCallCustomer,
  onCheerStaff,
  cheerCooldown,
  onEarnQuickCash,
}) => {
  const currentTier: RestaurantTier =
    RESTAURANT_TIERS.find((t) => t.level === gameState.restaurantLevel) || RESTAURANT_TIERS[0];
  const seasonDef = SEASONAL_EVENTS[gameState.season] || SEASONAL_EVENTS.spring;

  const chefs = gameState.staff.filter((s) => s.role === 'chef' && s.status === 'working');
  const servers = gameState.staff.filter((s) => s.role === 'server' && s.status === 'working');

  // Customer speech bubbles
  const customerQuotes = [
    'Ngon quá đi mất! 😋',
    'Bánh mì giòn rụm thơm lừng! 🥖',
    'Nước dùng phở ngọt thanh! 🍜',
    'Trà đào cam sả mát lịm! 🍹',
    'Thơm nức mũi góc phố! ✨',
    'Đầu bếp nấu đỉnh thật! 👨‍🍳',
    'Phục vụ nhanh nhẹn dễ thương! 💖',
  ];

  const dishesOnCounter = Object.entries(gameState.cookedDishes || {}).filter(([_, count]) => count > 0);
  const totalCounterPlates = dishesOnCounter.reduce((acc, [_, count]) => acc + count, 0);

  return (
    <div className="w-full bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-2xl shadow-cozy p-4 sm:p-5 relative overflow-hidden">
      {/* Background Decorative Wood Beam Motif */}
      <div className="absolute top-0 left-0 right-0 h-2.5 bg-[#8B5A2B]/20 border-b border-[#8B5A2B]/30" />

      {/* Top Info Bar of Restaurant View */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 mt-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currentTier.icon}</span>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#8B5A2B] leading-none">
              {currentTier.name} — <span className="text-[#D35400] font-hand text-xl">{currentTier.title}</span>
            </h2>
            <p className="text-xs text-[#8C6D53] mt-0.5">{currentTier.description}</p>
          </div>
        </div>

        {/* Quick Interaction Buttons */}
        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
          {/* Quick Cash Hustle Button */}
          <button
            onClick={() => {
              sound.playTap();
              onEarnQuickCash();
            }}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shadow-sm btn-tactile transition-all text-center ${
              gameState.cash < 25
                ? 'bg-gradient-to-r from-[#D35400] to-[#E67E22] text-white animate-pulse ring-2 ring-[#E67E22]/40'
                : 'bg-[#FFF8DC] hover:bg-[#FFE4B5] text-[#8B5A2B] border border-[#E6D5BC]'
            }`}
            title="Bán một ly trà đá vỉa hè, kiếm nóng +$10 tiền mặt ngay lập tức"
          >
            <span>🥤</span>
            <span className="truncate">Trà Đá (+$10)</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onCallCustomer();
            }}
            className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-[11px] sm:text-xs font-bold shadow-sm btn-tactile text-center"
            title="Vẫy tay chào đón thực khách ghé vào quán"
          >
            <span>👋</span>
            <span className="truncate">Mời Khách</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onCheerStaff();
            }}
            disabled={cheerCooldown}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shadow-sm btn-tactile text-center ${
              cheerCooldown
                ? 'bg-[#E0D3C1] text-[#9A8775] cursor-not-allowed'
                : 'bg-[#7CB342] hover:bg-[#689F38] text-white'
            }`}
            title="Ủng hộ tinh thần nhân viên (+CP & Tinh thần)"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Khích Lệ</span>
          </button>
        </div>
      </div>

      {/* Live animated scene (canvas) */}
      <div className="scene-frame">
        <RestaurantCanvas gameState={gameState} />
        <div className="scene-hud">
          <span
            className="hud-chip"
            style={{ borderColor: seasonDef.themeColor, color: seasonDef.themeColor }}
            title={`${seasonDef.name}: ${seasonDef.description}`}
          >
            {seasonDef.icon} {seasonDef.name}
            {seasonDef.visitorMultiplier > 1 && ` · khách ×${seasonDef.visitorMultiplier}`}
            {seasonDef.revenueMultiplier > 1 && ` · giá ×${seasonDef.revenueMultiplier}`}
            {seasonDef.craftingLuck > 0 && ` · may mắn +${seasonDef.craftingLuck}%`}
          </span>
          <span className="hud-chip">
            🪑 {gameState.activeOrders.length}/{gameState.seats} bàn
          </span>
          {gameState.todayStats.customersServed > 0 && (
            <span className="hud-chip hud-green">🎉 {gameState.todayStats.customersServed} khách hôm nay</span>
          )}
        </div>
        <div className="sr-only" aria-live="off">
          {gameState.activeOrders.map((o) => `${o.customerName}: ${o.recipeName} (${o.status})`).join('; ')}
        </div>
      </div>

      {/* Station chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
        <div className="station-chip">
          <div className="station-icon">{chefs.length > 0 ? '👩‍🍳' : '🧑‍🍳'}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#8B5A2B] truncate">Bếp Trưởng</span>
              <span className="chip chip-orange">{chefs.length} Bếp</span>
            </div>
            <div className="text-[11px] text-[#8C6D53] mt-0.5 truncate">
              {gameState.cookingBatches.length > 0 ? (
                <span className="text-[#D35400] font-semibold">🔥 Đang nấu {gameState.cookingBatches.length} mẻ</span>
              ) : (
                <span className="text-[#7CB342] font-medium">Bếp sẵn sàng</span>
              )}
            </div>
          </div>
        </div>

        <div className="station-chip">
          <div className="station-icon">
            🍱
            {totalCounterPlates > 0 && <span className="station-badge">{totalCounterPlates}</span>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#8B5A2B] truncate">Quầy Ra Món</span>
              <span className="chip chip-green">{totalCounterPlates} Suất</span>
            </div>
            <div className="text-[11px] text-[#8C6D53] mt-0.5 truncate">
              {dishesOnCounter.length > 0
                ? dishesOnCounter
                    .slice(0, 3)
                    .map(([recId, count]) => `${gameState.recipes.find((r) => r.id === recId)?.icon || '🍽️'} x${count}`)
                    .join(' ')
                : 'Quầy trống'}
            </div>
          </div>
        </div>

        <div className="station-chip">
          <div className="station-icon">{servers.length > 0 ? '💁‍♀️' : '🏃'}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#8B5A2B] truncate">Phục Vụ & Bàn</span>
              <span className="chip chip-green">{servers.length} Phục vụ</span>
            </div>
            <div className="text-[11px] text-[#8C6D53] mt-0.5 truncate">
              Bàn ăn: <strong className="text-[#8B5A2B]">{gameState.seats} chỗ</strong> · Hài lòng {Math.round(gameState.starRating * 20)}%
            </div>
          </div>
        </div>
      </div>

      {/* Live chatter */}
      {gameState.activeOrders.length > 0 && (
        <div className="mt-2.5 bg-[#FFE4B5]/50 border border-[#E6D5BC] rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs text-[#8B5A2B]">
          <span>💬</span>
          <span className="font-semibold">Tiếng xì xào:</span>
          <span className="italic text-[#A0522D] truncate">
            "{customerQuotes[Math.floor((gameState.day + gameState.minute) % customerQuotes.length)]}"
          </span>
        </div>
      )}
    </div>
  );
};

// The scene itself animates off a ref; the surrounding chips only need to refresh when these fields change
export const VisualRestaurant = React.memo(VisualRestaurantBase);
