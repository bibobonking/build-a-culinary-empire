/**
 * Tiny event bus for UI feedback (toasts + floating cash).
 * Lives outside React state so game ticks never re-render the whole tree for a popup.
 */
export type ToastKind = 'info' | 'success' | 'achievement' | 'warn';

export interface ToastData {
  id: number;
  kind: ToastKind;
  icon: string;
  title: string;
  text?: string;
  ttl: number;
}

export interface CashPop {
  id: number;
  amount: number;
}

type Listener = () => void;

let toasts: ToastData[] = [];
let pops: CashPop[] = [];
let seq = 1;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

let pendingCash = 0;
let cashTimer: ReturnType<typeof setTimeout> | null = null;

export const fx = {
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  getToasts: () => toasts,
  getPops: () => pops,

  toast(t: Omit<ToastData, 'id' | 'ttl'> & { ttl?: number }) {
    const id = seq++;
    const ttl = t.ttl ?? (t.kind === 'achievement' ? 5200 : 3200);
    toasts = [...toasts.slice(-3), { ...t, id, ttl }];
    emit();
    setTimeout(() => fx.dismiss(id), ttl);
  },
  dismiss(id: number) {
    if (!toasts.some((t) => t.id === id)) return;
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  },

  /** Floating "+$" bubble. Merges bursts within 450ms into a single bubble. */
  cash(amount: number) {
    pendingCash += amount;
    if (cashTimer) return;
    cashTimer = setTimeout(() => {
      cashTimer = null;
      const id = seq++;
      pops = [...pops.slice(-4), { id, amount: Math.round(pendingCash) }];
      pendingCash = 0;
      emit();
      setTimeout(() => {
        pops = pops.filter((p) => p.id !== id);
        emit();
      }, 1400);
    }, 450);
  },
};
