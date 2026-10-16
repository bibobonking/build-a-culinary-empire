import React, { useState } from 'react';
import { GameState, Difficulty, FixSaveReport, CURRENT_VERSION_STRING } from '../../types';
import { sound } from '../../utils/audio';
import { exportSaveCode, importSaveCode } from '../../utils/storage';
import {
  X,
  Volume2,
  Save,
  RotateCcw,
  Download,
  Upload,
  Check,
  Zap,
  Wrench,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onChangeDifficulty: (difficulty: Difficulty) => void;
  onSetLowGraphic: (enabled: boolean) => void;
  onSave: () => void;
  onReset: (difficulty: Difficulty) => void;
  onLoadImported: (state: GameState, report?: FixSaveReport | null) => void;
  onTriggerFixSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onChangeDifficulty,
  onSetLowGraphic,
  onSave,
  onReset,
  onLoadImported,
  onTriggerFixSave,
}) => {
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [volume, setVolume] = useState(sound.volume);

  if (!isOpen) return null;

  const handleCopySave = () => {
    const code = exportSaveCode(gameState);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const res = importSaveCode(importText);
    if (res.state) {
      sound.playCelebration();
      onLoadImported(res.state, res.report);
      onClose();
    } else {
      sound.playWarning();
      alert(res.error || 'Mã lưu không hợp lệ! Vui lòng kiểm tra lại chuỗi mã lưu.');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    sound.setVolume(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A2E18]/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-[#FFFDF7] border-3 border-[#D2691E] rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#FAF3E0] hover:bg-[#FFE4B5] text-[#8B5A2B] border border-[#E6D5BC] btn-tactile"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-xl font-bold text-[#8B5A2B] flex items-center gap-2">
          <span>⚙️</span> Cài Đặt & Quản Lý Dữ Liệu
        </h3>
        <p className="text-xs text-[#8C6D53] mt-0.5">Tùy chỉnh trải nghiệm và sao lưu tiến trình chơi</p>

        {/* Auto FixSave Feature Card */}
        <div className="mt-5 bg-gradient-to-r from-[#FFF8DC] to-[#FAF3E0] p-4 rounded-2xl border-2 border-[#E6D5BC] space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8B5A2B] flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-[#D35400]" />
              <span>Hệ Thống Auto FixSave Thông Minh</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#2E7D32]" /> {CURRENT_VERSION_STRING}
            </span>
          </div>

          <p className="text-[11px] text-[#8C6D53] leading-relaxed">
            Tự động kiểm tra phiên bản và sửa chữa các dữ liệu lỗi thời hoặc thiếu sót từ các bản trước.
            Cam kết <strong>bảo toàn 100% dữ liệu</strong> (tiền bạc, cấp độ, công thức đã mở và kho nguyên liệu).
          </p>

          <button
            onClick={() => {
              sound.playTap();
              onTriggerFixSave();
            }}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#D35400] to-[#E67E22] hover:from-[#BA4A00] hover:to-[#D35400] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm btn-tactile border border-[#B94A00]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kiểm Tra & Tự Động Sửa Save Ngay (Auto FixSave)</span>
          </button>
        </div>

        {/* Difficulty Selection */}
        <div className="mt-4 bg-[#FAF3E0] p-4 rounded-2xl border border-[#E6D5BC]">
          <span className="text-xs font-bold text-[#8B5A2B] block mb-2">Độ Khó Trò Chơi:</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'easy' as const, label: 'Dễ 🐣', desc: 'Vốn khởi đầu cao, khách kiên nhẫn' },
              { id: 'normal' as const, label: 'Thường 🍲', desc: 'Cân bằng, thử thách vừa vặn' },
              { id: 'hard' as const, label: 'Khó 🔥', desc: 'Vốn thấp, khách khó tính & khắt khe' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  sound.playTap();
                  onChangeDifficulty(d.id);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all btn-tactile ${
                  gameState.difficulty === d.id
                    ? 'bg-[#8B5A2B] text-white border-[#8B5A2B] shadow-sm font-bold'
                    : 'bg-[#FFFDF7] text-[#8C6D53] border-[#E6D5BC] hover:bg-[#FFE4B5]'
                }`}
              >
                <div className="text-xs font-bold">{d.label}</div>
                <div className="text-[9px] mt-0.5 opacity-80 leading-tight">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Volume Slider */}
        <div className="mt-4 bg-[#FAF3E0] p-4 rounded-2xl border border-[#E6D5BC]">
          <div className="flex items-center justify-between text-xs font-bold text-[#8B5A2B] mb-2">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[#E67E22]" /> Âm Lượng Nhạc & Hiệu Ứng
            </span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full accent-[#D2691E] cursor-pointer"
          />
        </div>

        {/* Graphics & 60 FPS Optimization Mode */}
        <div className="mt-4 bg-[#FAF3E0] p-4 rounded-2xl border border-[#E6D5BC]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#8B5A2B] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#E67E22]" /> Chế Độ Đồ Họa & Tối Ưu FPS:
            </span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                gameState.lowGraphicMode
                  ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]'
                  : 'bg-[#FFF3E0] text-[#E67E22] border-[#FFE0B2]'
              }`}
            >
              {gameState.lowGraphicMode ? '⚡ 60 FPS Mượt Mà' : '✨ Tiêu Chuẩn (Standard)'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sound.playTap();
                onSetLowGraphic(false);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all btn-tactile ${
                !gameState.lowGraphicMode
                  ? 'bg-[#8B5A2B] text-white border-[#8B5A2B] shadow-sm'
                  : 'bg-[#FFFDF7] text-[#8C6D53] border-[#E6D5BC] hover:bg-[#FFE4B5]'
              }`}
            >
              <div className="text-xs font-bold flex items-center gap-1">
                <span>✨ Chuẩn Đầy Đủ</span>
              </div>
              <div className="text-[9px] mt-1 opacity-80 leading-tight">
                Hiệu ứng mờ nền (blur), bóng đổ & pháo hoa.
              </div>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onSetLowGraphic(true);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all btn-tactile ${
                gameState.lowGraphicMode
                  ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm'
                  : 'bg-[#FFFDF7] text-[#8C6D53] border-[#E6D5BC] hover:bg-[#FFE4B5]'
              }`}
            >
              <div className="text-xs font-bold flex items-center gap-1">
                <span>🚀 Low Graphic (60 FPS)</span>
              </div>
              <div className="text-[9px] mt-1 opacity-80 leading-tight">
                Tắt mờ nền & pháo hoa. Giảm tải tối đa, siêu mượt và nét!
              </div>
            </button>
          </div>
        </div>

        {/* Save & Backup Controls */}
        <div className="mt-4 bg-[#FAF3E0] p-4 rounded-2xl border border-[#E6D5BC] space-y-3">
          <span className="text-xs font-bold text-[#8B5A2B] block">Lưu & Xuất Dữ Liệu:</span>

          <div className="flex gap-2">
            <button
              onClick={() => {
                sound.playTap();
                onSave();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-[#7CB342] hover:bg-[#689F38] text-white text-xs font-bold flex items-center justify-center gap-1.5 btn-tactile shadow-sm"
            >
              <Save className="w-4 h-4" /> Lưu Vào Trình Duyệt Ngay
            </button>

            <button
              onClick={handleCopySave}
              className="py-2 px-3 rounded-xl bg-[#FFFDF7] hover:bg-[#FFE4B5] text-[#8B5A2B] text-xs font-bold border border-[#E6D5BC] flex items-center gap-1.5 btn-tactile"
              title="Sao chép chuỗi mã lưu để chuyển sang máy khác"
            >
              {copied ? <Check className="w-4 h-4 text-[#2E7D32]" /> : <Download className="w-4 h-4" />}
              <span>{copied ? 'Đã chép mã!' : 'Xuất Save'}</span>
            </button>
          </div>

          {/* Import Code Input */}
          <div className="pt-2 border-t border-[#E6D5BC]/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-[#8C6D53]">
                Nhập mã sao lưu (Import Save):
              </span>
              <span className="text-[10px] text-[#2E7D32] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Tự sửa mã cũ
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Dán mã sao lưu (hỗ trợ mọi phiên bản)..."
                className="flex-1 bg-[#FFFDF7] border border-[#E6D5BC] rounded-xl px-3 py-1.5 text-xs text-[#5C3A21] outline-none focus:border-[#D2691E]"
              />
              <button
                onClick={handleImport}
                className="px-4 py-1.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-bold flex items-center gap-1 btn-tactile"
              >
                <Upload className="w-3.5 h-3.5" /> Nạp
              </button>
            </div>
            <span className="text-[10px] text-[#A08875] mt-1 block">
              💡 Bạn có thể dán mã lưu từ các phiên bản cũ, hệ thống sẽ tự động FixSave và giữ nguyên toàn bộ dữ liệu.
            </span>
          </div>
        </div>

        {/* Reset Game Section */}
        <div className="mt-4 p-4 rounded-2xl border border-[#FFCDD2] bg-[#FFEBEE]/50">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full py-2 rounded-xl text-xs font-bold text-[#C62828] bg-white border border-[#FFCDD2] hover:bg-[#FFEBEE] flex items-center justify-center gap-1.5 btn-tactile"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Khởi Động Lại Trò Chơi Mới (Reset)
            </button>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-xs text-[#C62828] font-bold">
                ⚠️ Bạn có chắc muốn xóa toàn bộ tiến trình và bắt đầu lại từ đầu không?
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => {
                    sound.playTap();
                    onReset(gameState.difficulty);
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#C0392B] text-white text-xs font-bold btn-tactile"
                >
                  Đồng Ý Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-4 py-1.5 rounded-xl bg-white text-[#5C3A21] border border-[#E6D5BC] text-xs font-bold btn-tactile"
                >
                  Hủy Bỏ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
