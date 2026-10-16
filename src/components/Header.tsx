import React, { useState } from 'react';
import { GameState, RestaurantTier } from '../types';
import { RESTAURANT_TIERS, SEASONAL_EVENTS } from '../data/gameData';
import { sound } from '../utils/audio';
import {
  Volume2,
  VolumeX,
  Music,
  Play,
  Pause,
  FastForward,
  HelpCircle,
  Settings,
  Save,
  Clock,
} from 'lucide-react';

interface HeaderProps {
  gameState: GameState;
  onUpdateSpeed: (speed: number) => void;
  onOpenTutorial: () => void;
  onOpenSettings: () => void;
  onQuickSave: () => void;
  saveMessage: string | null;
  onOpenCrafting: () => void;
  onOpenQuests: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameState,
  onUpdateSpeed,
  onOpenTutorial,
  onOpenSettings,
  onQuickSave,
  saveMessage,
  onOpenCrafting,
  onOpenQuests,
}) => {
  const [bgmActive, setBgmActive] = useState(sound.getBgmStatus());
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  const currentTier: RestaurantTier =
    RESTAURANT_TIERS.find((t) => t.level === gameState.restaurantLevel) || RESTAURANT_TIERS[0];
  const seasonDef = SEASONAL_EVENTS[gameState.season] || SEASONAL_EVENTS.spring;

  const handleToggleBgm = () => {
    sound.playTap();
    const active = sound.toggleBgm();
    setBgmActive(active);
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const formatTime = (hour: number, minute: number) => {
    const h = hour < 10 ? `0${hour}` : `${hour}`;
    const m = minute < 10 ? `0${minute}` : `${minute}`;
    return `${h}:${m}`;
  };

  const minutesRestock = Math.floor(gameState.shopRestockCountdown / 60);
  const secondsRestock = gameState.shopRestockCountdown % 60;
  const restockTimeDisplay = `${minutesRestock.toString().padStart(2, '0')}:${secondsRestock.toString().padStart(2, '0')}`;

  const totalCookedPlates = Object.values(gameState.cookedDishes).reduce((a, b) => a + b, 0);

  return (
    <header className="w-full bg-[#FFFDF7] border-b-2 border-[#E6D5BC] shadow-cozy px-2.5 sm:px-6 py-2 sm:py-2.5 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* DESKTOP HEADER (MD & UP) */}
        <div className="hidden md:flex items-center justify-between gap-3">
          {/* Left: Brand & Restaurant Tier */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFE4B5] border-2 border-[#D2691E]/30 flex items-center justify-center text-2xl shadow-sm select-none">
              {currentTier.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black text-[#8B5A2B] tracking-tight leading-tight">
                  Build a Culinary Empire
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#7CB342]/15 text-[#558B2F] font-bold border border-[#7CB342]/30">
                  Cấp {currentTier.level}/6: {currentTier.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8C6D53] font-medium mt-0.5">
                <span>📅 Ngày {gameState.day}</span>
                <span
                  className="font-bold"
                  style={{ color: seasonDef.themeColor }}
                  title={`${seasonDef.name}: ${seasonDef.description}`}
                >
                  {seasonDef.icon} {seasonDef.name}
                </span>
                <span className="text-[#D2B48C]">•</span>
                <span>
                  {formatTime(gameState.hour, gameState.minute)} ({gameState.timeOfDay === 'morning' ? 'Sáng' : gameState.timeOfDay === 'lunch' ? 'Trưa' : gameState.timeOfDay === 'dinner' ? 'Tối' : 'Đêm'})
                </span>
                <span className="text-[#D2B48C]">•</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Restock Chợ: {restockTimeDisplay}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center: Main Metrics */}
          <div className="flex items-center gap-2.5">
            {/* Cash */}
            <div
              id="metric-cash"
              className="flex items-center gap-1.5 bg-[#FFF8DC] border border-[#E6D5BC] px-3 py-1.5 rounded-xl shadow-sm"
            >
              <span className="text-base">💵</span>
              <div>
                <span className="text-[10px] block text-[#8C6D53] font-semibold uppercase leading-none">Tiền Vốn</span>
                <span className="text-sm font-black text-[#2E7D32]">
                  ${gameState.cash.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
                </span>
              </div>
            </div>

            {/* Serving Buffet Counter Plate Count */}
            <div
              id="metric-buffet"
              className="flex items-center gap-1.5 bg-[#FFF8DC] border border-[#E6D5BC] px-3 py-1.5 rounded-xl shadow-sm"
              title="Số món ăn đã nấu chín trên quầy sẵn sàng phục vụ khách"
            >
              <span className="text-base">♨️</span>
              <div>
                <span className="text-[10px] block text-[#8C6D53] font-semibold uppercase leading-none">Quầy Ra Món</span>
                <span className="text-sm font-black text-[#E67E22]">
                  {totalCookedPlates} Suất
                </span>
              </div>
            </div>

            {/* Creative Points */}
            <div
              id="metric-creative-points"
              className="flex items-center gap-1.5 bg-[#FFF8DC] border border-[#E6D5BC] px-3 py-1.5 rounded-xl shadow-sm"
              title="Dùng trong nâng cấp và gacha món ăn"
            >
              <span className="text-base">💡</span>
              <div>
                <span className="text-[10px] block text-[#8C6D53] font-semibold uppercase leading-none">Sáng Tạo</span>
                <span className="text-sm font-black text-[#D35400]">{gameState.creativePoints} CP</span>
              </div>
            </div>

            {/* Star Rating */}
            <div
              id="metric-rating"
              className="flex items-center gap-1.5 bg-[#FFF8DC] border border-[#E6D5BC] px-3 py-1.5 rounded-xl shadow-sm"
            >
              <span className="text-base text-[#F39C12]">⭐</span>
              <div>
                <span className="text-[10px] block text-[#8C6D53] font-semibold uppercase leading-none">Đánh Giá</span>
                <span className="text-sm font-black text-[#B86B14]">
                  {gameState.starRating.toFixed(1)} <span className="text-xs font-normal text-[#8C6D53]">({gameState.totalReviews})</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                sound.playTap();
                onOpenCrafting();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D35400] to-[#E67E22] hover:from-[#BA4A00] hover:to-[#D35400] text-white text-xs font-black shadow-sm btn-tactile border border-[#B94A00]"
              title="Mở Bếp Sáng Chế Lai Ghép Món Mới"
            >
              <span className="text-sm">⚗️</span>
              <span>Bếp Sáng Chế</span>
            </button>

            {/* Speed Controls */}
            <div className="flex items-center bg-[#F5E8D3] p-0.5 rounded-xl border border-[#E6D5BC]">
              <button
                onClick={() => {
                  sound.playTap();
                  onUpdateSpeed(0);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors btn-tactile ${
                  gameState.gameSpeed === 0 ? 'bg-[#C0392B] text-white shadow-sm' : 'text-[#8C6D53] hover:bg-[#EBD9C1]'
                }`}
                title="Tạm dừng"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  onUpdateSpeed(1);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors btn-tactile ${
                  gameState.gameSpeed === 1 ? 'bg-[#E67E22] text-white shadow-sm' : 'text-[#8C6D53] hover:bg-[#EBD9C1]'
                }`}
                title="Tốc độ thường 1x"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  onUpdateSpeed(2);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors btn-tactile ${
                  gameState.gameSpeed === 2 ? 'bg-[#7CB342] text-white shadow-sm' : 'text-[#8C6D53] hover:bg-[#EBD9C1]'
                }`}
                title="Tốc độ nhanh 2x"
              >
                <FastForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* BGM Lo-fi Toggle */}
            <button
              onClick={handleToggleBgm}
              className={`p-2 rounded-xl border border-[#E6D5BC] transition-all btn-tactile ${
                bgmActive ? 'bg-[#FFE4B5] text-[#D35400] shadow-sm' : 'bg-[#FFF8DC] text-[#A08875] hover:bg-[#F5E8D3]'
              }`}
              title={bgmActive ? 'Tắt nhạc nền Lo-Fi' : 'Bật nhạc nền Lo-Fi ấm áp'}
            >
              <Music className="w-4 h-4" />
            </button>

            {/* SFX Mute */}
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl border border-[#E6D5BC] transition-all btn-tactile ${
                !isMuted ? 'bg-[#FFF8DC] text-[#8B5A2B]' : 'bg-[#F2E5D0] text-[#A08875]'
              }`}
              title="Bật/Tắt âm thanh hiệu ứng"
            >
              {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Quick Save */}
            <button
              onClick={() => {
                sound.playTap();
                onQuickSave();
              }}
              className="p-2 rounded-xl bg-[#FFF8DC] hover:bg-[#FFE4B5] text-[#8B5A2B] border border-[#E6D5BC] transition-all btn-tactile relative"
              title="Lưu trò chơi nhanh"
            >
              <Save className="w-4 h-4" />
              {saveMessage && (
                <span className="absolute -bottom-7 right-0 bg-[#7CB342] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow whitespace-nowrap animate-bounce">
                  {saveMessage}
                </span>
              )}
            </button>

            {/* Tutorial Help */}
            <button
              onClick={() => {
                sound.playTap();
                onOpenTutorial();
              }}
              className="p-2 rounded-xl bg-[#FFF8DC] hover:bg-[#FFE4B5] text-[#8B5A2B] border border-[#E6D5BC] transition-all btn-tactile"
              title="Hướng dẫn chơi game"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Settings Modal */}
            <button
              onClick={() => {
                sound.playTap();
                onOpenSettings();
              }}
              className="p-2 rounded-xl bg-[#FFF8DC] hover:bg-[#FFE4B5] text-[#8B5A2B] border border-[#E6D5BC] transition-all btn-tactile"
              title="Cài đặt & Quản lý lưu trữ"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MOBILE HEADER (MD & DOWN) - OPTIMIZED FOR COMPACT USABILITY */}
        <div className="md:hidden space-y-1.5">
          {/* Top Row: Brand Info + Control Shortcuts */}
          <div className="flex items-center justify-between gap-1.5">
            {/* Left: Brand Icon + Title + Time */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FFE4B5] border-2 border-[#D2691E]/30 flex items-center justify-center text-xl shadow-xs shrink-0 select-none">
                {currentTier.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 truncate">
                  <h1 className="text-sm font-black text-[#8B5A2B] tracking-tight truncate">
                    Culinary Empire
                  </h1>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#7CB342]/15 text-[#558B2F] font-bold border border-[#7CB342]/30 shrink-0">
                    Cấp {currentTier.level}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#8C6D53] font-medium leading-none mt-0.5 truncate">
                  <span>Ngày {gameState.day}</span>
                  <span style={{ color: seasonDef.themeColor }} title={seasonDef.description}>
                    {seasonDef.icon} {seasonDef.name}
                  </span>
                  <span className="text-[#D2B48C]">•</span>
                  <span>{formatTime(gameState.hour, gameState.minute)}</span>
                  <span className="text-[#D2B48C]">•</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5 inline" />
                    <span>{restockTimeDisplay}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons (Touch Friendly) */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Quick Craft Button */}
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenCrafting();
                }}
                className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#D35400] to-[#E67E22] text-white flex items-center justify-center text-sm shadow-xs btn-tactile border border-[#B94A00]"
                title="Mở Bếp Sáng Chế"
                aria-label="Mở Bếp Sáng Chế"
              >
                ⚗️
              </button>

              {/* Game Speed Cycle Toggle */}
              <button
                onClick={() => {
                  sound.playTap();
                  const nextSpeed = gameState.gameSpeed === 0 ? 1 : gameState.gameSpeed === 1 ? 2 : 0;
                  onUpdateSpeed(nextSpeed);
                }}
                className={`h-8 px-2 rounded-xl text-[11px] font-black border transition-all btn-tactile flex items-center justify-center gap-0.5 ${
                  gameState.gameSpeed === 0
                    ? 'bg-[#C0392B] text-white border-[#A93226]'
                    : gameState.gameSpeed === 2
                    ? 'bg-[#7CB342] text-white border-[#689F38]'
                    : 'bg-[#FFE4B5] text-[#8B5A2B] border-[#E6D5BC]'
                }`}
                title={`Tốc độ game: ${gameState.gameSpeed === 0 ? 'Đang tạm dừng' : gameState.gameSpeed === 2 ? 'Nhanh 2x' : 'Bình thường 1x'}. Nhấn để đổi.`}
              >
                {gameState.gameSpeed === 0 ? (
                  <>
                    <Pause className="w-3 h-3" />
                    <span>0x</span>
                  </>
                ) : gameState.gameSpeed === 2 ? (
                  <>
                    <FastForward className="w-3 h-3" />
                    <span>2x</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    <span>1x</span>
                  </>
                )}
              </button>

              {/* Lo-fi Music */}
              <button
                onClick={handleToggleBgm}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all btn-tactile ${
                  bgmActive ? 'bg-[#FFE4B5] text-[#D35400] border-[#E6D5BC]' : 'bg-[#FFF8DC] text-[#A08875] border-[#E6D5BC]'
                }`}
                title={bgmActive ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
                aria-label="Bật/Tắt nhạc nền"
              >
                <Music className="w-3.5 h-3.5" />
              </button>

              {/* Quick Save with Floating Badge */}
              <button
                onClick={() => {
                  sound.playTap();
                  onQuickSave();
                }}
                className="w-8 h-8 rounded-xl bg-[#FFF8DC] text-[#8B5A2B] border border-[#E6D5BC] flex items-center justify-center transition-all btn-tactile relative"
                title="Lưu game"
                aria-label="Lưu game nhanh"
              >
                <Save className="w-3.5 h-3.5" />
                {saveMessage && (
                  <span className="absolute -bottom-6 right-0 bg-[#7CB342] text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow whitespace-nowrap z-50 animate-bounce">
                    {saveMessage}
                  </span>
                )}
              </button>

              {/* Settings / Menu */}
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenSettings();
                }}
                className="w-8 h-8 rounded-xl bg-[#FFF8DC] text-[#8B5A2B] border border-[#E6D5BC] flex items-center justify-center transition-all btn-tactile"
                title="Cài đặt"
                aria-label="Cài đặt"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Row 2: 4-Column Compact Metric Strip (Perfect thumb ergonomics) */}
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
            {/* Cash */}
            <div
              id="mobile-metric-cash"
              className="bg-[#FFF8DC] border border-[#E6D5BC] px-1.5 py-1 rounded-xl shadow-xs flex flex-col justify-center items-center text-center"
            >
              <div className="flex items-center gap-0.5">
                <span className="text-xs">💵</span>
                <span className="text-[9px] text-[#8C6D53] font-bold uppercase leading-none">Vốn</span>
              </div>
              <span className="text-xs font-black text-[#2E7D32] leading-tight truncate w-full">
                ${gameState.cash >= 1000 ? `${(gameState.cash / 1000).toFixed(1)}k` : Math.round(gameState.cash)}
              </span>
            </div>

            {/* Ready Plates */}
            <div
              id="mobile-metric-buffet"
              className="bg-[#FFF8DC] border border-[#E6D5BC] px-1.5 py-1 rounded-xl shadow-xs flex flex-col justify-center items-center text-center"
            >
              <div className="flex items-center gap-0.5">
                <span className="text-xs">♨️</span>
                <span className="text-[9px] text-[#8C6D53] font-bold uppercase leading-none">Quầy</span>
              </div>
              <span className="text-xs font-black text-[#E67E22] leading-tight truncate w-full">
                {totalCookedPlates} Suất
              </span>
            </div>

            {/* Creative Points */}
            <div
              id="mobile-metric-creative"
              className="bg-[#FFF8DC] border border-[#E6D5BC] px-1.5 py-1 rounded-xl shadow-xs flex flex-col justify-center items-center text-center"
            >
              <div className="flex items-center gap-0.5">
                <span className="text-xs">💡</span>
                <span className="text-[9px] text-[#8C6D53] font-bold uppercase leading-none">CP</span>
              </div>
              <span className="text-xs font-black text-[#D35400] leading-tight truncate w-full">
                {gameState.creativePoints}
              </span>
            </div>

            {/* Star Rating */}
            <div
              id="mobile-metric-rating"
              className="bg-[#FFF8DC] border border-[#E6D5BC] px-1.5 py-1 rounded-xl shadow-xs flex flex-col justify-center items-center text-center"
            >
              <div className="flex items-center gap-0.5">
                <span className="text-xs text-[#F39C12]">⭐</span>
                <span className="text-[9px] text-[#8C6D53] font-bold uppercase leading-none">Sao</span>
              </div>
              <span className="text-xs font-black text-[#B86B14] leading-tight truncate w-full">
                {gameState.starRating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
