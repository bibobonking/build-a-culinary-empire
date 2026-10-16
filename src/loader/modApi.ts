import type { GameState } from '../types';
import { fx } from '../utils/fx';

export interface ModApi {
  version: string;
  getState: () => GameState;
  /** Replace/patch state. Accepts a new state or an updater function. */
  setState: (u: GameState | ((p: GameState) => GameState)) => void;
  patch: (partial: Partial<GameState>) => void;
  addCash: (n: number) => void;
  addCP: (n: number) => void;
  toast: (title: string, text?: string, icon?: string) => void;
  log: (msg: unknown) => void;
}

interface Deps {
  getState: () => GameState;
  setState: ModApi['setState'];
  log: (m: string) => void;
}

export function createModApi({ getState, setState, log }: Deps): ModApi {
  const api: ModApi = {
    version: '1.0',
    getState,
    setState,
    patch: (partial) => setState((p) => ({ ...p, ...partial })),
    addCash: (n) => setState((p) => ({ ...p, cash: Math.max(0, p.cash + Number(n || 0)) })),
    addCP: (n) => setState((p) => ({ ...p, creativePoints: Math.max(0, p.creativePoints + Number(n || 0)) })),
    toast: (title, text, icon = '🧩') => fx.toast({ kind: 'info', icon, title: String(title), text }),
    log: (msg) => log(typeof msg === 'string' ? msg : safeStringify(msg)),
  };
  return api;
}

function safeStringify(v: unknown): string {
  try {
    return typeof v === 'object' ? JSON.stringify(v) : String(v);
  } catch {
    return String(v);
  }
}

/** Executes user-supplied JS with `api` in scope. Supports async scripts. */
export async function runScript(
  code: string,
  api: ModApi,
  name: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    // Exposed to devtools/scripts only once a script is actually executed
    (window as unknown as { CulinaryAPI?: ModApi }).CulinaryAPI = api;
    const fn = new Function('api', `"use strict";\n${code}\n//# sourceURL=mod:${name.replace(/[^\w.-]/g, '_')}`);
    await fn(api);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error(`[loader] ${name}`, err);
    return { ok: false, message };
  }
}
