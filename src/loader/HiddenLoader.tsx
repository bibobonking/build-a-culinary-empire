import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState } from '../types';
import { sha256Hex } from './sha256';
import { createModApi, runScript } from './modApi';
import { fx } from '../utils/fx';

/**
 * Hidden script loader. Open with Ctrl+Shift+D. There is no visible entry point anywhere in the UI.
 * The access code is never stored in plain text — only a salted SHA-256 digest.
 */
const CODE_DIGEST = 'c02069b82025a5ad37a4997723ae7f46772ade855eef45dfd368c297158c8f67';
const SALT = 'ce-loader::';
const SESSION_KEY = 'ce_ldr_ok';
const MODS_KEY = 'ce_ldr_mods';

interface StoredMod {
  id: string;
  name: string;
  code: string;
  auto: boolean;
}

interface LoadedMod extends StoredMod {
  status: 'idle' | 'ok' | 'error';
  message?: string;
}

interface Props {
  getState: () => GameState;
  setState: (u: GameState | ((p: GameState) => GameState)) => void;
}

const readMods = (): StoredMod[] => {
  try {
    const raw = localStorage.getItem(MODS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};
const writeMods = (mods: StoredMod[]) => {
  try {
    localStorage.setItem(MODS_KEY, JSON.stringify(mods.map(({ id, name, code, auto }) => ({ id, name, code, auto }))));
  } catch {
    /* storage unavailable */
  }
};

export const HiddenLoader: React.FC<Props> = ({ getState, setState }) => {
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [code, setCode] = useState('');
  const [shake, setShake] = useState(false);
  const [fails, setFails] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [mods, setMods] = useState<LoadedMod[]>(() => readMods().map((m) => ({ ...m, status: 'idle' as const })));
  const [paste, setPaste] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const apiRef = useRef<ReturnType<typeof createModApi> | null>(null);
  if (!apiRef.current) {
    apiRef.current = createModApi({
      getState,
      setState,
      log: (m) => setLogs((l) => [...l.slice(-80), m]),
    });
  }

  const run = useCallback(async (mod: StoredMod): Promise<{ ok: boolean; message?: string }> => {
    const res = await runScript(mod.code, apiRef.current!, mod.name);
    setMods((list) =>
      list.map((m) => (m.id === mod.id ? { ...m, status: res.ok ? 'ok' : 'error', message: res.message } : m))
    );
    setLogs((l) => [...l.slice(-80), res.ok ? `✔ ${mod.name} đã chạy` : `✖ ${mod.name}: ${res.message}`]);
    return res;
  }, []);

  // Auto-run scripts the owner marked for startup (they were added through the unlocked loader)
  useEffect(() => {
    const t = setTimeout(() => {
      readMods()
        .filter((m) => m.auto)
        .forEach((m) => {
          void run(m);
        });
    }, 400);
    return () => clearTimeout(t);
  }, [run]);

  // Secret hotkey
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        e.stopPropagation();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() < lockUntil) return;
    const ok = sha256Hex(SALT + code.trim()) === CODE_DIGEST;
    setCode('');
    if (ok) {
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* ignore */
      }
      setUnlocked(true);
      setFails(0);
    } else {
      const n = fails + 1;
      setFails(n);
      setShake(true);
      setTimeout(() => setShake(false), 450);
      if (n >= 5) {
        setLockUntil(Date.now() + 30_000);
        setFails(0);
      }
    }
  };

  const addMod = (name: string, content: string, runNow = true) => {
    const mod: LoadedMod = {
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name || 'script.js',
      code: content,
      auto: false,
      status: 'idle',
    };
    setMods((list) => {
      const next = [...list, mod];
      writeMods(next);
      return next;
    });
    if (runNow) void run(mod);
  };

  const readFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      if (!/\.(m?js|txt)$/i.test(f.name)) {
        setLogs((l) => [...l, `✖ Bỏ qua ${f.name} (chỉ nhận .js)`]);
        continue;
      }
      if (f.size > 2_000_000) {
        setLogs((l) => [...l, `✖ ${f.name} quá lớn (>2MB)`]);
        continue;
      }
      addMod(f.name, await f.text());
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const toggleAuto = (id: string) =>
    setMods((list) => {
      const next = list.map((m) => (m.id === id ? { ...m, auto: !m.auto } : m));
      writeMods(next);
      return next;
    });
  const removeMod = (id: string) =>
    setMods((list) => {
      const next = list.filter((m) => m.id !== id);
      writeMods(next);
      return next;
    });

  if (!open) return null;
  const locked = Date.now() < lockUntil;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 modal-backdrop"
      onClick={() => setOpen(false)}
    >
      <div
        className={`loader-card w-full max-w-lg ${shake ? 'shake' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Loader"
      >
        <div className="loader-head">
          <span className="loader-dot" />
          <span className="font-mono text-xs tracking-widest">LOADER</span>
          <button className="ml-auto text-xs opacity-70 hover:opacity-100" onClick={() => setOpen(false)}>
            ESC ✕
          </button>
        </div>

        {!unlocked ? (
          <form onSubmit={submitCode} className="p-5 space-y-3">
            <label className="block text-xs font-mono opacity-80">Nhập mã bí mật</label>
            <input
              autoFocus
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={locked}
              autoComplete="off"
              spellCheck={false}
              className="loader-input w-full"
              placeholder={locked ? 'Bị khóa tạm thời...' : '••••••••••••'}
            />
            <button type="submit" disabled={locked || !code} className="loader-btn w-full">
              Mở khóa
            </button>
          </form>
        ) : (
          <div className="p-4 space-y-3">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                void readFiles(e.dataTransfer.files);
              }}
              onClick={() => fileRef.current?.click()}
              className={`loader-drop ${dragOver ? 'over' : ''}`}
            >
              <div className="text-2xl">📜</div>
              <div className="text-xs font-mono mt-1">Kéo thả hoặc bấm để chọn file .js</div>
              <input
                ref={fileRef}
                type="file"
                accept=".js,.mjs,.txt,text/javascript"
                multiple
                hidden
                onChange={(e) => void readFiles(e.target.files)}
              />
            </div>

            <details className="text-xs">
              <summary className="cursor-pointer font-mono opacity-80">Hoặc dán code trực tiếp</summary>
              <textarea
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                rows={5}
                spellCheck={false}
                className="loader-input w-full mt-2 font-mono text-xs"
                placeholder="api.addCash(1000); api.toast('Hello!');"
              />
              <button
                className="loader-btn mt-2"
                disabled={!paste.trim()}
                onClick={() => {
                  addMod('inline.js', paste);
                  setPaste('');
                }}
              >
                Chạy
              </button>
            </details>

            {mods.length > 0 && (
              <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {mods.map((m) => (
                  <li key={m.id} className="loader-row">
                    <span className={`status ${m.status}`} />
                    <span className="flex-1 min-w-0 truncate font-mono text-xs" title={m.message}>
                      {m.name}
                    </span>
                    <label className="text-[10px] opacity-80 flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={m.auto} onChange={() => toggleAuto(m.id)} /> auto
                    </label>
                    <button className="loader-mini" onClick={() => void run(m)}>▶</button>
                    <button className="loader-mini" onClick={() => removeMod(m.id)}>🗑</button>
                  </li>
                ))}
              </ul>
            )}

            <div className="loader-log" aria-live="polite">
              {logs.length === 0 ? (
                <span className="opacity-50">Chưa có log. Script nhận biến <b>api</b> (xem window.CulinaryAPI).</span>
              ) : (
                logs.map((l, i) => <div key={i}>{l}</div>)
              )}
            </div>
            <button
              className="text-[10px] font-mono opacity-60 hover:opacity-100"
              onClick={() => {
                try {
                  sessionStorage.removeItem(SESSION_KEY);
                } catch {
                  /* ignore */
                }
                setUnlocked(false);
                fx.toast({ kind: 'info', icon: '🔒', title: 'Đã khóa lại' });
              }}
            >
              🔒 khóa lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
