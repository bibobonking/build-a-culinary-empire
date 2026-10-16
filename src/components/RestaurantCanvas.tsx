import React, { useEffect, useRef } from 'react';
import type { GameState, Order } from '../types';

/**
 * Animated restaurant scene drawn on a single <canvas>.
 *  - static layer (wall, windows, floor, counter, tables) is pre-rendered off-screen
 *  - dynamic layer: sky (day/night), season weather, walking customers, steam, coins, lamps
 *  - capped at 30fps, pauses when off-screen / tab hidden, near-static in low-graphic mode
 * The game state is read from a ref inside the loop, so ticks never re-create the scene.
 */

const EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

const PALETTE: Record<number, { wall: string; trim: string; floorA: string; floorB: string; counter: string }> = {
  1: { wall: '#F6E2BC', trim: '#C98F4E', floorA: '#CDA06A', floorB: '#BB8B55', counter: '#A8693A' },
  2: { wall: '#F8D9C4', trim: '#B9794B', floorA: '#C4905F', floorB: '#B2804F', counter: '#9A5C33' },
  3: { wall: '#E4F0D6', trim: '#8BA66A', floorA: '#B88F5F', floorB: '#A57E50', counter: '#7C5A3A' },
  4: { wall: '#E9E0F4', trim: '#9C86C4', floorA: '#A8825A', floorB: '#977450', counter: '#6D4F6B' },
  5: { wall: '#F0E2B8', trim: '#C9A24A', floorA: '#8C6A4B', floorB: '#7C5D42', counter: '#5B4330' },
  6: { wall: '#F8EBC9', trim: '#D4AF37', floorA: '#6E5038', floorB: '#5E432F', counter: '#3F2D20' },
};

interface Sprite {
  id: string;
  avatar: string;
  dish: string;
  sell: number;
  status: Order['status'];
  progress: number;
  x: number;
  y: number;
  slot: number; // table index, -1 = queue
  mode: 'enter' | 'seated' | 'leave';
  phase: number;
  alpha: number;
  paid: boolean;
}

interface Particle {
  kind: 'steam' | 'coin' | 'text' | 'weather';
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  text?: string;
  rot: number;
  vr: number;
}

interface Layout {
  W: number;
  H: number;
  band: number;
  doorX: number;
  doorY: number;
  counterW: number;
  counterTop: number;
  tables: { x: number; y: number }[];
  windows: { x: number; w: number }[];
}

// sky keyframes: hour -> [top, bottom]
const SKY: [number, [number, number, number], [number, number, number]][] = [
  [6, [154, 200, 235], [255, 224, 190]],
  [9, [120, 190, 245], [220, 238, 255]],
  [13, [86, 177, 250], [200, 232, 255]],
  [16.5, [126, 192, 238], [255, 226, 166]],
  [18.5, [112, 100, 180], [255, 160, 100]],
  [20, [40, 44, 110], [200, 110, 120]],
  [22, [12, 16, 52], [38, 48, 112]],
  [30, [12, 16, 52], [38, 48, 112]],
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function skyColors(hour: number) {
  let i = 0;
  while (i < SKY.length - 2 && hour > SKY[i + 1][0]) i++;
  const [h0, t0, b0] = SKY[i];
  const [h1, t1, b1] = SKY[i + 1];
  const t = Math.max(0, Math.min(1, (hour - h0) / (h1 - h0)));
  const mix = (a: number[], b: number[]) =>
    `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
  return { top: mix(t0, t1), bottom: mix(b0, b1) };
}

function makeLayout(W: number, H: number, seats: number): Layout {
  const band = Math.round(H * 0.44);
  const doorX = W - Math.max(46, W * 0.07);
  const counterW = Math.max(110, W * 0.2);
  const n = Math.max(2, Math.min(8, seats));
  const cols = Math.ceil(n / 2);
  const x0 = counterW + 54;
  const x1 = doorX - 70;
  const tables: { x: number; y: number }[] = [];
  const floorH = H - band;
  for (let i = 0; i < n; i++) {
    const row = i % 2;
    const col = Math.floor(i / 2);
    const x = cols === 1 ? (x0 + x1) / 2 : lerp(x0, x1, col / (cols - 1)) + (row ? 22 : -10);
    tables.push({ x, y: band + floorH * (row ? 0.74 : 0.42) });
  }
  const wc = W < 520 ? 2 : 3;
  const windows: { x: number; w: number }[] = [];
  const ww = Math.min(110, (W - counterW - 80) / (wc + 0.6));
  const wx0 = counterW + 24;
  const span = doorX - 60 - wx0;
  for (let i = 0; i < wc; i++) {
    windows.push({ x: wx0 + (span - ww) * (i / (wc - 1)), w: ww });
  }
  return { W, H, band, doorX, doorY: band + floorH * 0.62, counterW, counterTop: band + 6, tables, windows };
}

function buildStatic(L: Layout, level: number, icon: string, dpr: number, season: string = 'spring'): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.round(L.W * dpr);
  c.height = Math.round(L.H * dpr);
  const g = c.getContext('2d')!;
  g.scale(dpr, dpr);
  const P = PALETTE[level] || PALETTE[1];
  const { W, H, band } = L;

  // Wall with window holes (even-odd)
  g.fillStyle = P.wall;
  g.beginPath();
  g.rect(0, 0, W, band);
  L.windows.forEach((w) => g.rect(w.x, 10, w.w, band - 24));
  g.fill('evenodd');
  // soft wall gradient
  const wg = g.createLinearGradient(0, 0, 0, band);
  wg.addColorStop(0, 'rgba(255,255,255,0.35)');
  wg.addColorStop(1, 'rgba(0,0,0,0.06)');
  g.save();
  g.beginPath();
  g.rect(0, 0, W, band);
  L.windows.forEach((w) => g.rect(w.x, 10, w.w, band - 24));
  g.clip('evenodd');
  g.fillStyle = wg;
  g.fillRect(0, 0, W, band);
  g.restore();

  // Window frames + mullions + sills
  L.windows.forEach((w) => {
    g.strokeStyle = P.trim;
    g.lineWidth = 5;
    g.strokeRect(w.x, 10, w.w, band - 24);
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(w.x + w.w / 2, 10);
    g.lineTo(w.x + w.w / 2, band - 14);
    g.moveTo(w.x, 10 + (band - 24) / 2);
    g.lineTo(w.x + w.w, 10 + (band - 24) / 2);
    g.stroke();
    g.fillStyle = P.trim;
    g.fillRect(w.x - 5, band - 15, w.w + 10, 6);
    // curtains
    g.fillStyle = 'rgba(214,69,65,0.78)';
    g.beginPath();
    g.moveTo(w.x - 2, 8);
    g.quadraticCurveTo(w.x + 14, band * 0.42, w.x - 2, band - 18);
    g.lineTo(w.x - 8, band - 18);
    g.lineTo(w.x - 8, 8);
    g.fill();
    g.beginPath();
    g.moveTo(w.x + w.w + 2, 8);
    g.quadraticCurveTo(w.x + w.w - 14, band * 0.42, w.x + w.w + 2, band - 18);
    g.lineTo(w.x + w.w + 8, band - 18);
    g.lineTo(w.x + w.w + 8, 8);
    g.fill();
  });

  // Baseboard trim
  g.fillStyle = P.trim;
  g.fillRect(0, band - 8, W, 8);
  g.fillStyle = 'rgba(0,0,0,0.12)';
  g.fillRect(0, band, W, 3);

  // Floor planks (diagonal-perspective-ish)
  const fh = H - band;
  const fg = g.createLinearGradient(0, band, 0, H);
  fg.addColorStop(0, P.floorB);
  fg.addColorStop(1, P.floorA);
  g.fillStyle = fg;
  g.fillRect(0, band, W, fh);
  g.strokeStyle = 'rgba(70,40,15,0.18)';
  g.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    const y = band + (fh * i) / 5;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }
  for (let x = -W; x < W * 2; x += 46) {
    g.beginPath();
    g.moveTo(W / 2 + (x - W / 2) * 0.82, band);
    g.lineTo(x, H);
    g.stroke();
  }
  // Rug under tables
  g.fillStyle = 'rgba(196,60,60,0.16)';
  const rx0 = L.counterW + 30;
  g.beginPath();
  (g as CanvasRenderingContext2D & { roundRect: (...a: number[]) => void }).roundRect(rx0, band + fh * 0.18, L.doorX - rx0 - 46, fh * 0.74, 18);
  g.fill();

  // Tables + chairs
  L.tables.forEach((t) => {
    // chairs
    g.fillStyle = '#8B5A2B';
    g.beginPath();
    g.ellipse(t.x - 25, t.y + 3, 7, 9, 0, 0, Math.PI * 2);
    g.ellipse(t.x + 25, t.y + 3, 7, 9, 0, 0, Math.PI * 2);
    g.fill();
    // shadow
    g.fillStyle = 'rgba(40,20,5,0.22)';
    g.beginPath();
    g.ellipse(t.x, t.y + 15, 26, 7, 0, 0, Math.PI * 2);
    g.fill();
    // leg
    g.fillStyle = '#7A4A22';
    g.fillRect(t.x - 3, t.y + 3, 6, 12);
    // top
    const tg = g.createLinearGradient(0, t.y - 12, 0, t.y + 6);
    tg.addColorStop(0, '#F4D9A8');
    tg.addColorStop(1, '#D9A864');
    g.fillStyle = tg;
    g.beginPath();
    g.ellipse(t.x, t.y - 2, 24, 11, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#A8693A';
    g.lineWidth = 1.5;
    g.stroke();
    // tablecloth stripe
    g.strokeStyle = 'rgba(214,69,65,0.55)';
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(t.x, t.y - 2, 17, 7, 0, 0, Math.PI * 2);
    g.stroke();
  });

  // Kitchen counter (left)
  const cx = 0;
  const cTop = L.counterTop + 20;
  g.fillStyle = 'rgba(0,0,0,0.15)';
  g.fillRect(cx, cTop + 40, L.counterW + 8, 8);
  const cg = g.createLinearGradient(0, cTop, 0, cTop + 46);
  cg.addColorStop(0, P.counter);
  cg.addColorStop(1, 'rgba(0,0,0,0.35)');
  g.fillStyle = P.counter;
  g.fillRect(cx, cTop, L.counterW, 44);
  g.fillStyle = cg;
  g.fillRect(cx, cTop, L.counterW, 44);
  g.fillStyle = '#F2E4CC';
  g.fillRect(cx, cTop - 5, L.counterW + 4, 8); // worktop
  g.fillStyle = 'rgba(255,255,255,0.45)';
  g.fillRect(cx, cTop - 5, L.counterW + 4, 2);
  // counter panels
  g.strokeStyle = 'rgba(0,0,0,0.22)';
  g.lineWidth = 1.5;
  for (let x = 14; x < L.counterW - 8; x += 42) g.strokeRect(x, cTop + 8, 34, 28);

  // Sign board
  g.fillStyle = P.trim;
  const sx = 10;
  g.beginPath();
  (g as CanvasRenderingContext2D & { roundRect: (...a: number[]) => void }).roundRect(sx, 12, Math.min(150, L.counterW + 20), 34, 10);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.88)';
  g.beginPath();
  (g as CanvasRenderingContext2D & { roundRect: (...a: number[]) => void }).roundRect(sx + 4, 16, Math.min(150, L.counterW + 20) - 8, 26, 7);
  g.fill();
  g.font = `18px ${EMOJI}`;
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.fillText(icon, sx + 10, 30);
  g.fillStyle = '#7A4A22';
  g.font = '700 12px Nunito, sans-serif';
  g.fillText('Culinary Empire', sx + 34, 30);

  // Door (right)
  const dw = 46;
  const dx = L.doorX - dw / 2;
  g.fillStyle = P.trim;
  g.fillRect(dx - 5, band - 62, dw + 10, 66 + 4);
  const dg = g.createLinearGradient(dx, 0, dx + dw, 0);
  dg.addColorStop(0, '#8B5A2B');
  dg.addColorStop(1, '#A8693A');
  g.fillStyle = dg;
  g.fillRect(dx, band - 58, dw, 62);
  g.fillStyle = 'rgba(190,225,255,0.65)';
  g.fillRect(dx + 7, band - 50, dw - 14, 28);
  g.fillStyle = '#FFD152';
  g.beginPath();
  g.arc(dx + dw - 8, band - 22, 2.6, 0, Math.PI * 2);
  g.fill();
  // door mat
  g.fillStyle = 'rgba(122,74,34,0.8)';
  g.beginPath();
  g.ellipse(L.doorX, band + 12, 32, 8, 0, 0, Math.PI * 2);
  g.fill();

  // Tier decorations
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.font = `22px ${EMOJI}`;
  if (level >= 3) g.fillText('🪴', L.counterW + 14, band + 2);
  if (level >= 4) g.fillText('🖼️', (L.windows[0]?.x ?? 200) - 24, 40);
  if (level >= 5) g.fillText('🪴', L.doorX - 52, band + 2);
  if (level >= 6) {
    g.font = `26px ${EMOJI}`;
    g.fillText('👑', L.W / 2, 28);
  }

  // Seasonal / festival decorations (vẽ vào static layer — gần như miễn phí về hiệu năng)
  g.font = `20px ${EMOJI}`;
  if (season === 'tet') {
    // Lì xì & đèn đỏ ngày Tết
    g.fillText('🧧', L.counterW + 40, band + 2);
    g.fillText('🧧', L.doorX - 84, band + 2);
    g.font = `16px ${EMOJI}`;
    g.fillText('🏮', (L.windows[0]?.x ?? 200) + 8, 30);
    g.fillText('🌺', (L.windows[1]?.x ?? 300) + 8, 30);
  } else if (season === 'halloween') {
    // Bí ngô & dơi Halloween
    g.fillText('🎃', L.counterW + 40, band + 2);
    g.fillText('🎃', L.doorX - 84, band + 2);
    g.font = `16px ${EMOJI}`;
    g.fillText('🦇', (L.windows[0]?.x ?? 200) + 8, 30);
    g.fillText('👻', (L.windows[1]?.x ?? 300) + 8, 30);
  } else if (season === 'christmas') {
    // Cây thông & vòng nguyệt quế Giáng Sinh
    g.font = `26px ${EMOJI}`;
    g.fillText('🎄', L.doorX - 88, band + 2);
    g.font = `16px ${EMOJI}`;
    g.fillText('🎁', L.counterW + 40, band + 2);
    g.fillText('❄️', (L.windows[0]?.x ?? 200) + 8, 30);
    g.fillText('⭐', (L.windows[1]?.x ?? 300) + 8, 30);
  } else if (season === 'midAutumn') {
    // Đèn lồng & bánh trung thu
    g.font = `18px ${EMOJI}`;
    g.fillText('🏮', (L.windows[0]?.x ?? 200) + 8, 30);
    g.fillText('🏮', (L.windows[1]?.x ?? 300) + 8, 30);
    g.font = `20px ${EMOJI}`;
    g.fillText('🥮', L.counterW + 40, band + 2);
    g.fillText('🐇', L.doorX - 84, band + 2);
  }

  // Bunting
  const colors = ['#E74C3C', '#F1C40F', '#2ECC71', '#3498DB', '#E67E22'];
  g.strokeStyle = 'rgba(80,50,20,0.5)';
  g.lineWidth = 1.2;
  g.beginPath();
  const by = 6;
  const bx0 = L.counterW + 10;
  const bx1 = L.doorX - 40;
  g.moveTo(bx0, by);
  g.quadraticCurveTo((bx0 + bx1) / 2, by + 14, bx1, by);
  g.stroke();
  const flags = Math.max(4, Math.floor((bx1 - bx0) / 26));
  for (let i = 0; i < flags; i++) {
    const t = (i + 0.5) / flags;
    const x = lerp(bx0, bx1, t);
    const y = by + 14 * 2 * t * (1 - t) + 1;
    g.fillStyle = colors[i % colors.length];
    g.beginPath();
    g.moveTo(x - 6, y);
    g.lineTo(x + 6, y);
    g.lineTo(x, y + 12);
    g.fill();
  }
  return c;
}

export const RestaurantCanvas: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d', { alpha: false })!;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let W = 0;
    let H = 0;
    let dpr = 1;
    let L: Layout | null = null;
    let layer: HTMLCanvasElement | null = null;
    let layerKey = '';
    let visible = true;
    let raf = 0;
    let last = 0;
    let time = 0;
    const sprites = new Map<string, Sprite>();
    const parts: Particle[] = [];
    let steamAcc = 0;
    let weatherAcc = 0;
    let lastSeats = 0;

    const resize = () => {
      const w = Math.max(280, Math.floor(wrap.clientWidth));
      const h = w < 520 ? 210 : w < 900 ? 235 : 260;
      // Low graphics renders at 1x resolution to reduce canvas pixel work on
      // high-DPI/mobile displays. Include DPR in the resize check so toggling
      // graphics mode takes effect immediately even when the container is unchanged.
      const nextDpr = low() ? 1 : Math.min(window.devicePixelRatio || 1, 1.75);
      if (w === W && h === H && nextDpr === dpr) return;
      W = w;
      H = h;
      dpr = nextDpr;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.height = `${H}px`;
      layerKey = '';
    };

    const ensureLayer = (gs: GameState) => {
      const n = Math.max(2, Math.min(8, gs.seats));
      const key = `${W}x${H}:${gs.restaurantLevel}:${n}:${gs.season}`;
      if (key === layerKey && layer && L) return;
      L = makeLayout(W, H, gs.seats);
      const tier = gs.restaurantLevel;
      layer = buildStatic(L, tier, tierIcon(tier), dpr, gs.season);
      layerKey = key;
      lastSeats = n;
    };

    const tierIcon = (lvl: number) => ['🛒', '🍜', '🍽️', '🥂', '⭐', '👑'][Math.min(5, Math.max(0, lvl - 1))];

    const low = () => !!stateRef.current.lowGraphicMode || !!reduceMotion?.matches;

    // --- simulation ------------------------------------------------------
    const seatPos = (slot: number) => {
      const t = L!.tables[slot];
      return { x: t.x, y: t.y - 12 };
    };

    const sync = () => {
      const gs = stateRef.current;
      const Lo = L!;
      const ids = new Set<string>();
      const taken = new Set<number>();
      sprites.forEach((s) => {
        if (s.mode !== 'leave' && s.slot >= 0) taken.add(s.slot);
      });

      gs.activeOrders.forEach((o) => {
        ids.add(o.id);
        let s = sprites.get(o.id);
        if (!s) {
          s = {
            id: o.id,
            avatar: o.customerAvatar,
            dish: o.recipeIcon,
            sell: o.sellPrice,
            status: o.status,
            progress: o.progress ?? 0,
            x: Lo.doorX,
            y: Lo.doorY,
            slot: -1,
            mode: 'enter',
            phase: Math.random() * 6,
            alpha: 0,
            paid: false,
          };
          sprites.set(o.id, s);
        }
        s.status = o.status;
        s.progress = o.progress ?? 0;
        s.dish = o.recipeIcon;
        if (s.slot < 0 || s.slot >= Lo.tables.length) {
          s.slot = -1;
          for (let i = 0; i < Lo.tables.length; i++) {
            if (!taken.has(i)) {
              s.slot = i;
              taken.add(i);
              break;
            }
          }
        }
      });

      sprites.forEach((s) => {
        if (!ids.has(s.id) && s.mode !== 'leave') {
          s.mode = 'leave';
          s.slot = -1;
          if (!s.paid) {
            s.paid = true;
            parts.push({ kind: 'text', x: s.x, y: s.y - 34, vx: 0, vy: -26, life: 0, max: 1.5, size: 13, text: `+$${s.sell}`, rot: 0, vr: 0 });
            for (let k = 0; k < 3; k++) {
              parts.push({ kind: 'coin', x: s.x + (k - 1) * 8, y: s.y - 24, vx: (k - 1) * 14, vy: -50 - k * 12, life: 0, max: 0.9 + k * 0.15, size: 15, rot: 0, vr: 0 });
            }
          }
        }
      });
    };

    const updateSprites = (dt: number, instant: boolean) => {
      const Lo = L!;
      const speed = 120;
      sprites.forEach((s, id) => {
        let tx: number;
        let ty: number;
        if (s.mode === 'leave') {
          tx = Lo.doorX;
          ty = Lo.doorY;
        } else if (s.slot >= 0) {
          const p = seatPos(s.slot);
          tx = p.x;
          ty = p.y;
        } else {
          // waiting in line near the door
          const idx = [...sprites.values()].filter((q) => q.slot < 0 && q.mode !== 'leave').indexOf(s);
          tx = Lo.doorX - 38 - Math.max(0, idx) * 24;
          ty = Lo.doorY + 6;
        }
        const dx = tx - s.x;
        const dy = ty - s.y;
        const d = Math.hypot(dx, dy);
        if (instant || d < 2) {
          s.x = tx;
          s.y = ty;
          if (s.mode === 'enter' && s.slot >= 0) s.mode = 'seated';
          if (s.mode === 'leave') s.alpha = 0;
        } else {
          const step = Math.min(d, speed * dt);
          s.x += (dx / d) * step;
          s.y += (dy / d) * step;
          if (s.mode === 'leave' && d < 26) s.alpha = Math.max(0, d / 26);
        }
        if (s.mode !== 'leave') s.alpha = Math.min(1, s.alpha + dt * 4);
        s.phase += dt * (d > 2 ? 14 : 2.4);
        if (s.mode === 'leave' && s.alpha <= 0.01) sprites.delete(id);
      });
    };

    const spawnWeather = (dt: number, gs: GameState) => {
      const Lo = L!;
      const isSnowy = gs.season === 'winter' || gs.season === 'christmas';
      const rate = gs.season === 'summer' ? 0 : isSnowy ? 14 : gs.season === 'halloween' ? 8 : 5;
      weatherAcc += dt * rate;
      while (weatherAcc >= 1) {
        weatherAcc -= 1;
        if (parts.length > 70) return;
        const x = Lo.windows.length
          ? Lo.windows[Math.floor(Math.random() * Lo.windows.length)].x + Math.random() * Lo.windows[0].w
          : Math.random() * W;
        parts.push({
          kind: 'weather',
          x,
          y: 10,
          vx: isSnowy ? (Math.random() - 0.5) * 8 : 10 + Math.random() * 16,
          vy: isSnowy ? 18 + Math.random() * 14 : 22 + Math.random() * 14,
          life: 0,
          max: (Lo.band - 24) / 22,
          size: isSnowy ? 1.6 + Math.random() * 1.6 : 3 + Math.random() * 2,
          rot: Math.random() * 6,
          vr: (Math.random() - 0.5) * 4,
        });
      }
    };

    const updateParticles = (dt: number) => {
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        if (p.life >= p.max) {
          parts.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        if (p.kind === 'coin') p.vy += 120 * dt;
        if (p.kind === 'steam') p.vx += Math.sin(p.life * 4 + p.x) * 6 * dt;
      }
    };

    // --- drawing ---------------------------------------------------------
    const drawSky = (gs: GameState, isLow: boolean) => {
      const Lo = L!;
      const hour = gs.hour + gs.minute / 60;
      const { top, bottom } = skyColors(hour);
      const g = ctx.createLinearGradient(0, 0, 0, Lo.band);
      g.addColorStop(0, top);
      g.addColorStop(1, bottom);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, Lo.band);

      const night = Math.max(0, Math.min(1, (hour - 18.5) / 2));
      if (night > 0.2) {
        ctx.fillStyle = `rgba(255,255,255,${0.8 * night})`;
        for (let i = 0; i < 26; i++) {
          const sx = (i * 97.3) % W;
          const sy = (i * 41.7) % (Lo.band - 20);
          // Low-graphic mode: static stars (no per-frame twinkle math)
          const tw = isLow ? 0.8 : 0.5 + 0.5 * Math.sin(time * 2 + i);
          ctx.globalAlpha = night * tw;
          ctx.fillRect(sx, sy, 1.6, 1.6);
        }
        ctx.globalAlpha = 1;
      }

      // sun / moon along an arc
      const dayT = (hour - 6) / 13; // 6..19
      if (dayT >= 0 && dayT <= 1) {
        const sx = lerp(W * 0.18, W * 0.9, dayT);
        const sy = Lo.band * (0.82 - 0.62 * Math.sin(Math.PI * dayT));
        const glow = ctx.createRadialGradient(sx, sy, 2, sx, sy, 34);
        glow.addColorStop(0, hour > 17.5 ? 'rgba(255,160,90,0.85)' : 'rgba(255,240,170,0.9)');
        glow.addColorStop(1, 'rgba(255,240,170,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(sx - 36, sy - 36, 72, 72);
        ctx.fillStyle = hour > 17.5 ? '#FF9A52' : '#FFE27A';
        ctx.beginPath();
        ctx.arc(sx, sy, 11, 0, Math.PI * 2);
        ctx.fill();
      }
      if (hour > 18.8) {
        const mt = Math.min(1, (hour - 18.8) / 4);
        const mx = lerp(W * 0.3, W * 0.78, mt);
        const my = Lo.band * (0.7 - 0.35 * Math.sin(Math.PI * Math.min(1, mt * 0.9)));
        ctx.globalAlpha = Math.min(1, (hour - 18.8) / 1.2);
        ctx.fillStyle = '#FFF6D0';
        ctx.beginPath();
        ctx.arc(mx, my, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(60,70,140,0.55)';
        ctx.beginPath();
        ctx.arc(mx + 4, my - 2, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // drifting clouds (day only); skipped in low-graphic mode
      if (!isLow && night < 0.8) {
        ctx.fillStyle = `rgba(255,255,255,${0.75 * (1 - night)})`;
        for (let i = 0; i < 3; i++) {
          const cx = ((time * (6 + i * 3) + i * 220) % (W + 120)) - 60;
          const cy = 22 + i * 18;
          ctx.beginPath();
          ctx.ellipse(cx, cy, 24, 8, 0, 0, Math.PI * 2);
          ctx.ellipse(cx + 14, cy - 5, 16, 8, 0, 0, Math.PI * 2);
          ctx.ellipse(cx - 14, cy - 3, 14, 7, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Trung Thu: mặt trăng tròn rực rỡ treo suốt đêm
      if (gs.season === 'midAutumn' && hour > 16) {
        const alpha = Math.min(1, (hour - 16) / 2);
        const mx = W * 0.82;
        const my = Lo.band * 0.2;
        const glow = ctx.createRadialGradient(mx, my, 4, mx, my, 30);
        glow.addColorStop(0, `rgba(255,244,200,${0.8 * alpha})`);
        glow.addColorStop(1, 'rgba(255,244,200,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(mx - 32, my - 32, 64, 64);
        ctx.fillStyle = `rgba(255,240,190,${alpha})`;
        ctx.beginPath();
        ctx.arc(mx, my, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawParticlesWeather = (gs: GameState) => {
      for (const p of parts) {
        if (p.kind !== 'weather') continue;
        if (gs.season === 'winter' || gs.season === 'christmas') {
          ctx.fillStyle = gs.season === 'christmas' ? 'rgba(240,250,255,0.95)' : 'rgba(255,255,255,0.92)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          if (gs.season === 'tet') {
            // Phấn hoa đỏ vàng may mắn ngày Tết
            ctx.fillStyle = Math.sin(p.rot * 3) > 0 ? 'rgba(229,57,53,0.95)' : 'rgba(255,213,79,0.95)';
          } else if (gs.season === 'halloween') {
            ctx.fillStyle = Math.sin(p.rot * 3) > 0 ? 'rgba(255,140,0,0.95)' : 'rgba(156,39,176,0.9)';
          } else if (gs.season === 'midAutumn') {
            ctx.fillStyle = 'rgba(255,193,7,0.9)';
          } else {
            ctx.fillStyle = gs.season === 'spring' ? 'rgba(255,170,200,0.95)' : 'rgba(224,120,40,0.95)';
          }
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    };

    const drawSprite = (s: Sprite) => {
      const bob = s.mode === 'seated' ? Math.sin(s.phase) * 0.8 : Math.abs(Math.sin(s.phase)) * 3;
      ctx.globalAlpha = s.alpha;
      // shadow
      ctx.fillStyle = 'rgba(40,20,5,0.22)';
      ctx.beginPath();
      ctx.ellipse(s.x, s.y + 6, 11, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `26px ${EMOJI}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(s.avatar, s.x, s.y + 4 - bob);

      if (s.mode === 'seated') {
        // dish on the table
        ctx.font = `15px ${EMOJI}`;
        ctx.fillText(s.status === 'cooking' ? '' : s.dish, s.x, s.y + 22);
        // status bubble
        const by = s.y - 34;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.strokeStyle = 'rgba(139,90,43,0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(s.x, by, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (s.status === 'cooking') {
          ctx.strokeStyle = '#E67E22';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(s.x, by, 8.5, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * Math.min(100, s.progress)) / 100);
          ctx.stroke();
          ctx.font = `10px ${EMOJI}`;
          ctx.fillText('🔥', s.x, by + 3.6);
        } else {
          ctx.font = `13px ${EMOJI}`;
          ctx.fillText(Math.sin(time * 3 + s.phase) > 0 ? '😋' : '💛', s.x, by + 4.5);
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawChefAndCounter = (gs: GameState, dt: number, animate: boolean) => {
      const Lo = L!;
      const cooking = gs.cookingBatches.length > 0 || gs.activeOrders.some((o) => o.status === 'cooking');
      const hasChef = gs.staff.some((s) => s.role === 'chef' && s.status === 'working');
      const top = Lo.counterTop + 20 - 5;
      const chefX = Lo.counterW * 0.3;
      const bob = cooking && animate ? Math.abs(Math.sin(time * 7)) * 3 : 0;
      ctx.font = `30px ${EMOJI}`;
      ctx.textAlign = 'center';
      ctx.fillText(hasChef ? '👩‍🍳' : '🧑‍🍳', chefX, top - 2 - bob);
      ctx.font = `20px ${EMOJI}`;
      ctx.fillText(cooking ? '🍳' : '🥘', chefX + 34, top - 1);

      // plates ready on the counter
      const icons: string[] = [];
      for (const r of gs.recipes) {
        if ((gs.cookedDishes[r.id] || 0) > 0 && icons.length < 4) icons.push(r.icon);
      }
      ctx.font = `16px ${EMOJI}`;
      icons.forEach((ic, i) => ctx.fillText(ic, chefX + 68 + i * 19, top - 1));

      if (cooking && animate) {
        steamAcc += dt * 5;
        while (steamAcc >= 1) {
          steamAcc -= 1;
          if (parts.length < 90) {
            parts.push({ kind: 'steam', x: chefX + 34 + (Math.random() - 0.5) * 8, y: top - 18, vx: (Math.random() - 0.5) * 6, vy: -18 - Math.random() * 10, life: 0, max: 1.2 + Math.random() * 0.6, size: 3 + Math.random() * 3, rot: 0, vr: 0 });
          }
        }
      }

      // waiter pacing along the aisle
      if (gs.staff.some((s) => s.role === 'server' && s.status === 'working')) {
        const wx = animate ? lerp(Lo.counterW + 30, Lo.doorX - 90, 0.5 + 0.5 * Math.sin(time * 0.45)) : Lo.counterW + 60;
        const wy = Lo.band + (Lo.H - Lo.band) * 0.58;
        ctx.fillStyle = 'rgba(40,20,5,0.2)';
        ctx.beginPath();
        ctx.ellipse(wx, wy + 6, 10, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = `24px ${EMOJI}`;
        ctx.fillText('💁‍♀️', wx, wy + 3 - (animate ? Math.abs(Math.sin(time * 6)) * 2 : 0));
      }
    };

    const drawFx = () => {
      for (const p of parts) {
        const k = p.life / p.max;
        if (p.kind === 'steam') {
          ctx.fillStyle = `rgba(255,255,255,${0.55 * (1 - k)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + k), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'coin') {
          ctx.globalAlpha = 1 - k * k;
          ctx.font = `${p.size}px ${EMOJI}`;
          ctx.textAlign = 'center';
          ctx.fillText('🪙', p.x, p.y);
          ctx.globalAlpha = 1;
        } else if (p.kind === 'text') {
          ctx.globalAlpha = 1 - k * k;
          ctx.font = `800 ${p.size}px Nunito, sans-serif`;
          ctx.textAlign = 'center';
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'rgba(255,255,255,0.9)';
          ctx.strokeText(p.text!, p.x, p.y);
          ctx.fillStyle = '#2E7D32';
          ctx.fillText(p.text!, p.x, p.y);
          ctx.globalAlpha = 1;
        }
      }
    };

    const drawLighting = (gs: GameState) => {
      const Lo = L!;
      const hour = gs.hour + gs.minute / 60;
      const night = Math.max(0, Math.min(1, (hour - 17.5) / 3));
      if (night <= 0.02) return;
      ctx.fillStyle = `rgba(14,18,60,${0.4 * night})`;
      ctx.fillRect(0, Lo.band - 8, W, Lo.H - Lo.band + 8);
      ctx.globalCompositeOperation = 'lighter';
      const pts: { x: number; y: number; r: number }[] = [
        ...Lo.tables.map((t) => ({ x: t.x, y: t.y - 6, r: 52 })),
        { x: Lo.counterW * 0.4, y: Lo.counterTop + 16, r: 70 },
        { x: Lo.doorX, y: Lo.band - 30, r: 46 },
      ];
      for (const p of pts) {
        const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(255,190,100,${0.42 * night})`);
        g.addColorStop(1, 'rgba(255,190,100,0)');
        ctx.fillStyle = g;
        ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const isLow = low();
      // Keep the scene responsive in low mode; 1 FPS caused visibly frozen
      // customers while still scheduling requestAnimationFrame continuously.
      // Low mode redraws at ~4 FPS: sprites move instantly (no walk animation),
      // so a scene that is 95% static gains nothing from 20 repainted frames.
      const interval = isLow ? 1000 / 4 : 1000 / 30;
      if (now - last < interval) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      time += dt;

      const gs = stateRef.current;
      resize();
      ensureLayer(gs);
      void lastSeats;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sync();
      updateSprites(dt, isLow);
      if (!isLow) {
        spawnWeather(dt, gs);
        updateParticles(dt);
      } else {
        parts.length = 0;
      }

      drawSky(gs, isLow);
      if (!isLow) drawParticlesWeather(gs);
      ctx.drawImage(layer!, 0, 0, W, H);
      drawChefAndCounter(gs, dt, !isLow);

      // sprites sorted by y for correct overlap
      const list = [...sprites.values()].sort((a, b) => a.y - b.y);
      for (const s of list) drawSprite(s);
      if (!isLow) drawLighting(gs);
      if (!isLow) drawFx();
    };

    const start = () => {
      if (raf || !visible) return;
      last = performance.now() - 100;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    start();

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(wrap);
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible) start();
        else stop();
      },
      { threshold: 0.01 }
    );
    io.observe(wrap);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div ref={wrapRef} className="scene-canvas-wrap">
      <canvas ref={canvasRef} className="scene-canvas" role="img" aria-label="Cảnh nhà hàng đang hoạt động" />
    </div>
  );
};
