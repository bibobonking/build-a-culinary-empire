/**
 * Shared lazy wrapper around canvas-confetti.
 * The library (~5KB gz) is only fetched the first time a celebration actually fires,
 * instead of being bundled into every chunk that imports it statically.
 * Low-Graphic mode: confetti hoàn toàn bị tắt để tiết kiệm GPU/CPU.
 */
import type { Options } from 'canvas-confetti';

export const confetti = (opts?: Options): void => {
  if (typeof document !== 'undefined' && document.body.classList.contains('low-graphic-mode')) {
    return; // Low-Graphic: bỏ qua mọi hiệu ứng confetti
  }
  import('canvas-confetti').then((m) => m.default(opts));
};

export default confetti;
