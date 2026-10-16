import React, { useSyncExternalStore } from 'react';
import { fx } from '../utils/fx';

/** Toast stack (bottom-center) + floating cash bubbles (top-right). CSS-only animation. */
export const ToastHost: React.FC = () => {
  const toasts = useSyncExternalStore(fx.subscribe, fx.getToasts);
  const pops = useSyncExternalStore(fx.subscribe, fx.getPops);

  return (
    <>
      <div
        className="fixed left-1/2 -translate-x-1/2 bottom-4 sm:bottom-6 z-[90] flex flex-col items-center gap-2 pointer-events-none w-[min(92vw,380px)]"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <button
            key={t.id}
            onClick={() => fx.dismiss(t.id)}
            className={`toast pointer-events-auto w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border-2 shadow-lg ${
              t.kind === 'achievement'
                ? 'toast-gold'
                : t.kind === 'success'
                ? 'toast-green'
                : t.kind === 'warn'
                ? 'toast-red'
                : 'toast-plain'
            }`}
          >
            <span className="text-2xl shrink-0 toast-icon">{t.icon}</span>
            <span className="min-w-0">
              <span className="block text-[13px] font-black leading-tight truncate">{t.title}</span>
              {t.text && <span className="block text-xs opacity-90 leading-tight mt-0.5">{t.text}</span>}
            </span>
          </button>
        ))}
      </div>

      <div className="fixed top-24 right-3 sm:right-6 z-[80] pointer-events-none flex flex-col items-end gap-1">
        {pops.map((p) => (
          <div key={p.id} className="cash-pop font-black text-sm sm:text-base px-2.5 py-1 rounded-full">
            🪙 +${p.amount.toLocaleString()}
          </div>
        ))}
      </div>
    </>
  );
};
