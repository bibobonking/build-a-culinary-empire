import React, { useEffect, useRef, useState } from 'react';

/**
 * Màn hình khởi độngBoot Splash Screen: trình bày một "cảnh bếp" hoạt hình nhẹ nhàng
 * trong ~2 giây đầu tiên để che khoảng trống khi JS bundle + font đang load,
 * đồng thời tạo cảm giác "nhóm lửa bếp" trước khi vào quán.
 * - Low Graphic mode: chỉ giữ lửa + progress, bỏ steam/float/glow (đã confirmation với CSS riêng).
 * - prefers-reduced-motion: bị index.css chặn animation sẵn.
 */

const TIPS = [
  '💡 Mẹo: Chợ làm mới mỗi 3 phút — canh đợt giảm giá 15–25% để mua nguyên liệu rẻ!',
  '🥤 Củ chừng tiền mặt? Bấm "Trà Đá (+$10)" là có tiền nóng liền tay.',
  '📦 FoodBox ra công thức trực tiếp — hộp càng đắt, hương vị càng huyền bí.',
  '🍳 Nấu món hoàn toàn MIỄN PHÍ — món chín nằm trên quầy chờ khách ghé bàn.',
  '🏆 Nhận thưởng nhiệm vụ mỗi ngày — con đường nhanh nhất lên đế chế Michelin!',
  '⚗️ Bếp Sáng Chế: 2–4 nguyên liệu — may mắn càng cao, món càng đỉnh.',
  '🎉 Công thức trùng không phí — quy đổi thành Điểm Sáng Tạo (CP) luôn!',
];

const FLOAT_EMOJIS = ['🥖', '🍜', '📦', '✨', '🧑‍🍳', '⭐', '👑', '🥘'];

export const BootSplash: React.FC<{ isLowGraphic?: boolean; onDone: () => void }> = ({
  isLowGraphic = false,
  onDone,
}) => {
  const [progress, setProgress] = useState(4);
  const [tip, setTip] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(false);

  // Giữ onDone trong ref để timer kết thúc không bị hủy khi App re-render
  // (App tick game mỗi giây nên callback onDone được tạo lại liên tục).
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Progress giả lập mượt: tăng nhanh đầu, chậm dần cuối (tránh cảm giác "treo").
  useEffect(() => {
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        const jump = 3 + Math.ceil((100 - p) * 0.085);
        return Math.min(100, p + jump);
      });
    }, 80);
    return () => clearInterval(iv);
  }, []);

  // Tips luân phiên mỗi 950ms
  useEffect(() => {
    const iv = setInterval(() => setTip((t) => (t + 1) % TIPS.length), 950);
    return () => clearInterval(iv);
  }, []);

  // Lưới an toàn tuyệt đối: kể cả có lỗi gì làm kẹt tiến trình,
  // splash vẫn tự đóng sau 6 giây (setBooting(false) gọi 2 lần vô hại).
  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), 6000);
    return () => clearTimeout(t);
  }, []);

  // Kết thúc: giữ 350ms ở 100% -> fade out -> gỡ khỏi cây.
  // deps không chứa onDone (đã ổn định qua onDoneRef phía trên).
  useEffect(() => {
    if (progress < 100 || doneRef.current) return;
    doneRef.current = true;
    const t1 = setTimeout(() => setLeaving(true), 350);
    const t2 = setTimeout(() => onDoneRef.current(), 350 + (isLowGraphic ? 60 : 520));
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [progress, isLowGraphic]);

  return (
    <div
      className={`fixed inset-0 z-[110] boot-splash ${leaving ? 'boot-splash-leave' : ''}`}
      role="status"
      aria-label="Đang tải trò chơi"
    >
      {/* Nền tối ấm + ánh sáng bếp lò */}
      <div className="absolute inset-0 boot-bg" />
      {!isLowGraphic && <div className="absolute inset-0 boot-glow" />}

      <div className="relative w-full h-full flex flex-col items-center justify-center px-6 select-none">
        {/* Dòng emoji nổi lơ lửng phía trên */}
        {!isLowGraphic && (
          <div className="flex gap-3 sm:gap-5 text-2xl sm:text-3xl mb-5" aria-hidden="true">
            {FLOAT_EMOJIS.map((e, i) => (
              <span
                key={i}
                className="boot-float"
                style={{ animationDelay: `${i * 0.22}s` }}
              >
                {e}
              </span>
            ))}
          </div>
        )}

        {/* Nồi lửa chính */}
        <div className="relative mb-4">
          {!isLowGraphic && (
            <>
              <span className="boot-steam boot-steam-1" aria-hidden="true" />
              <span className="boot-steam boot-steam-2" aria-hidden="true" />
              <span className="boot-steam boot-steam-3" aria-hidden="true" />
            </>
          )}
          <div className={`text-7xl sm:text-8xl ${isLowGraphic ? '' : 'boot-wobble'}`} aria-hidden="true">
            🍳
          </div>
        </div>

        {/* Tựa đề */}
        <h1 className="text-center font-black leading-tight boot-title text-3xl sm:text-5xl">
          Build a Culinary Empire
        </h1>
        <p className="text-[#E8D5B5] text-[11px] sm:text-sm font-bold tracking-wide mt-1.5 text-center">
          Từ xe bánh mì vỉa hè đến Đế Chế Michelin 👑
        </p>

        {/* Thanh tiến trình */}
        <div className="w-full max-w-xs sm:max-w-sm mt-6">
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-black text-[#E8D5B5]/80 mb-1.5">
            <span>{progress < 100 ? '🔥 Đang nhóm lửa bếp...' : '✅ Bếp đã sẵn sàng!'}</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-black/35 border border-white/10 overflow-hidden">
            <div
              className="h-full rounded-full boot-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Mẹo luân phiên */}
        <p
          key={tip}
          className={`text-[11px] sm:text-xs text-center text-[#E8D5B5]/90 max-w-sm mt-5 ${isLowGraphic ? '' : 'boot-tip-in'}`}
        >
          {TIPS[tip]}
        </p>
      </div>
    </div>
  );
};

export default BootSplash;
