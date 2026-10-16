import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { sound } from '../utils/audio';

export interface TabItem {
  id: string;
  label: string;
  icon: string;
  badge?: number | string | null;
}

interface NavigationTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const NavigationTabBar: React.FC<NavigationTabBarProps> = ({
  tabs,
  activeTab,
  onSelectTab,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeftState, setScrollLeftState] = useState<number>(0);
  const dragDistanceRef = useRef<number>(0);

  // Check scroll boundary state
  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const atLeft = el.scrollLeft <= 5;
    const atRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;

    setCanScrollLeft(!atLeft);
    setCanScrollRight(!atRight);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleResize = () => updateScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScrollButtons, tabs]);

  // Scroll active tab into view whenever it changes
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const activeBtn = el.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement | null;
    if (activeBtn) {
      const containerRect = el.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();

      if (btnRect.left < containerRect.left || btnRect.right > containerRect.right) {
        activeBtn.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [activeTab]);

  // Scroll Left / Right buttons
  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;

    sound.playTap();
    const scrollAmount = direction === 'left' ? -240 : 240;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 300);
  };

  // Mouse Wheel horizontal scrolling for PC users
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    if (e.deltaY !== 0) {
      el.scrollLeft += e.deltaY;
      updateScrollButtons();
    }
  };

  // Mouse Drag to Scroll (PC swipe emulation)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
    dragDistanceRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5; // drag sensitivity
    dragDistanceRef.current += Math.abs(x - startX);
    el.scrollLeft = scrollLeftState - walk;
    updateScrollButtons();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTabClick = (tabId: string) => {
    // If user dragged more than 6px, ignore click to prevent accidental tab switch
    if (dragDistanceRef.current > 6) {
      dragDistanceRef.current = 0;
      return;
    }
    sound.playTap();
    onSelectTab(tabId);
  };

  const [isQuickJumpOpen, setIsQuickJumpOpen] = useState<boolean>(false);

  return (
    <>
      <div className="relative w-full bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-2xl p-1.5 shadow-sm select-none flex items-center group">
        {/* Left Scroll Button for PC / Desktop */}
        <button
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          aria-label="Cuộn sang trái"
          className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-xl bg-[#FAF3E0] border border-[#E6D5BC] text-[#8C6D53] hover:bg-[#FFE4B5] hover:text-[#5C3A21] active:scale-95 transition-all flex-shrink-0 mr-1.5 shadow-xs ${
            !canScrollLeft ? 'opacity-30 cursor-not-allowed' : 'opacity-90 hover:opacity-100 cursor-pointer'
          }`}
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Mobile Quick Menu / All Tabs Trigger Button */}
        <button
          onClick={() => {
            sound.playTap();
            setIsQuickJumpOpen(true);
          }}
          className="flex sm:hidden items-center justify-center w-8 h-8 rounded-xl bg-[#FFE4B5] border border-[#D2691E]/30 text-[#8B5A2B] text-xs font-black shrink-0 mr-1 shadow-xs btn-tactile"
          title="Xem danh sách tất cả các khu vực"
          aria-label="Mở danh sách tất cả tab"
        >
          ☰
        </button>

        {/* Scrollable Container with Drag + Wheel + Smooth Touch support */}
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollButtons}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex-1 overflow-x-auto scrollbar-none flex items-center gap-1.5 py-0.5 touch-pan-x ${
            isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
          style={{
            scrollBehavior: isDragging ? 'auto' : 'smooth',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap btn-tactile border relative flex-shrink-0 min-h-[38px] ${
                  isActive
                    ? 'bg-[#E67E22] text-white border-[#D35400] shadow-sm scale-[1.02]'
                    : 'bg-[#FFF8DC]/70 text-[#8C6D53] border-transparent hover:bg-[#FFE4B5] hover:text-[#5C3A21]'
                }`}
              >
                <span className="text-sm sm:text-base">{tab.icon}</span>
                <span>{tab.label}</span>
                {Boolean(tab.badge) && (
                  <span className="bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button for PC / Desktop */}
        <button
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          aria-label="Cuộn sang phải"
          className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-xl bg-[#FAF3E0] border border-[#E6D5BC] text-[#8C6D53] hover:bg-[#FFE4B5] hover:text-[#5C3A21] active:scale-95 transition-all flex-shrink-0 ml-1.5 shadow-xs ${
            !canScrollRight ? 'opacity-30 cursor-not-allowed' : 'opacity-90 hover:opacity-100 cursor-pointer'
          }`}
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Mobile Quick-Jump Modal / Sheet */}
      {isQuickJumpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsQuickJumpOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#FFFDF7] border-3 border-[#E6D5BC] rounded-3xl p-4 sm:p-5 shadow-2xl relative max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0E6D2]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🗺️</span>
                <h3 className="text-base font-black text-[#5C3A21]">Khu Vực Quản Lý</h3>
              </div>
              <button
                onClick={() => setIsQuickJumpOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FAF3E0] hover:bg-[#FFE4B5] text-[#8B5A2B] border border-[#E6D5BC] flex items-center justify-center text-xs font-bold btn-tactile"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      sound.playTap();
                      onSelectTab(tab.id);
                      setIsQuickJumpOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-left border-2 transition-all btn-tactile ${
                      isActive
                        ? 'bg-[#E67E22] text-white border-[#D35400] shadow-sm font-black'
                        : 'bg-[#FFF8DC]/70 hover:bg-[#FFE4B5] border-[#E6D5BC] text-[#5C3A21] font-bold'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{tab.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{tab.label}</div>
                      {Boolean(tab.badge) && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-black inline-block mt-0.5 ${
                            isActive ? 'bg-white text-[#D35400]' : 'bg-[#EF4444] text-white'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
