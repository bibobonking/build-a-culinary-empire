import React, { useState } from 'react';
import { Recipe } from '../../types';
import { sound } from '../../utils/audio';
import { X, Sparkles, Check, Flame } from 'lucide-react';

interface CustomRecipeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onSaveSignature: (recipeId: string, customName: string, signatureBonus: number) => void;
}

export const CustomRecipeModal: React.FC<CustomRecipeModalProps> = ({
  recipe,
  onClose,
  onSaveSignature,
}) => {
  // Hooks phải chạy trước mọi early return (React yêu cầu thứ tự ổn định)
  const [name, setName] = useState(recipe?.customName || recipe?.name || '');
  const [selectedTwist, setSelectedTwist] = useState<number>(0);

  if (!recipe) return null;

  const twists = [
    {
      name: 'Gia Vị Mộc Mạc Truyền Thống',
      bonus: 10,
      desc: 'Giữ nguyên hương vị cổ truyền, tăng nhẹ độ béo và hương thơm thảo mộc.',
      costCP: 5,
    },
    {
      name: 'Sốt Tiêu Rừng Tây Bắc & Mật Ong Rừng',
      bonus: 20,
      desc: 'Vị cay the nhẹ nồng nàn của tiêu sẻ kết hợp vị ngọt dịu của mật ong hoa nhãn.',
      costCP: 12,
    },
    {
      name: 'Bơ Tỏi Phô Mai Chảy Kéo Sợi',
      bonus: 25,
      desc: 'Lớp phô mai béo ngậy đút lò vàng xém, cực kỳ hút mắt thực khách trẻ tuổi.',
      costCP: 18,
    },
    {
      name: 'Dầu Nấm Truffle Đen & Vàng Lá Michelin',
      bonus: 35,
      desc: 'Hương thơm nấm truffle quý hiếm quyến rũ bậc nhất, đưa món ăn lên tầm cao xa xỉ.',
      costCP: 30,
    },
  ];

  const currentTwist = twists[selectedTwist];
  const newSellPrice = Math.round(recipe.sellPrice * (1 + currentTwist.bonus / 100));

  const handleSave = () => {
    sound.playCelebration();
    onSaveSignature(recipe.id, name.trim() || recipe.name, currentTwist.bonus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A2E18]/45 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-[#FFFDF7] border-3 border-[#D2691E] rounded-3xl shadow-2xl p-6 relative">
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#FAF3E0] hover:bg-[#FFE4B5] text-[#8B5A2B] border border-[#E6D5BC] btn-tactile"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="text-4xl inline-block mb-1">{recipe.icon}</span>
          <h3 className="text-lg font-black text-[#8B5A2B]">Sáng Tạo Món Ăn Signature</h3>
          <p className="text-xs text-[#8C6D53]">Tùy biến bí quyết công thức để tăng giá trị món ăn</p>
        </div>

        {/* Custom Dish Name Input */}
        <div className="mt-4">
          <label className="text-xs font-bold text-[#8B5A2B] block mb-1">
            Tên Món Ăn Độc Quyền Của Bạn:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#FAF3E0] border-2 border-[#E6D5BC] rounded-xl px-3.5 py-2 text-xs font-bold text-[#5C3A21] outline-none focus:border-[#D2691E]"
            placeholder="Ví dụ: Bánh Mì Hoàng Gia Cô Ba..."
          />
        </div>

        {/* Twist Selection */}
        <div className="mt-4">
          <label className="text-xs font-bold text-[#8B5A2B] block mb-2">
            Chọn Bí Quyết Nước Sốt / Điểm Nhấn:
          </label>
          <div className="space-y-2">
            {twists.map((t, idx) => (
              <button
                key={idx}
                onClick={() => {
                  sound.playTap();
                  setSelectedTwist(idx);
                }}
                className={`w-full p-2.5 rounded-xl border-2 text-left transition-all btn-tactile ${
                  selectedTwist === idx
                    ? 'bg-[#FFE4B5] border-[#D2691E] shadow-sm'
                    : 'bg-[#FAF3E0] border-[#E6D5BC] hover:bg-[#FFF8DC]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8B5A2B]">{t.name}</span>
                  <span className="text-[11px] font-black text-[#2E7D32]">+{t.bonus}% Giá Bán</span>
                </div>
                <p className="text-[10px] text-[#8C6D53] mt-0.5 leading-snug">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Sell Price Preview */}
        <div className="mt-4 bg-[#FAF3E0] p-3 rounded-2xl border border-[#E6D5BC] flex items-center justify-between text-xs">
          <span className="text-[#8C6D53]">Giá bán mới sau khi nâng cấp:</span>
          <span className="text-base font-black text-[#2E7D32]">
            ${newSellPrice} <span className="text-[10px] text-[#8C6D53] line-through">${recipe.sellPrice}</span>
          </span>
        </div>

        {/* Save Button */}
        <div className="mt-4 pt-3 border-t border-[#E6D5BC] flex gap-2">
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm btn-tactile"
          >
            <Sparkles className="w-4 h-4" /> Xác Nhận Công Thức Signature (+{currentTwist.bonus}%)
          </button>
        </div>
      </div>
    </div>
  );
};
