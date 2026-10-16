import React from 'react';
import { RandomEvent, RandomEventChoice } from '../../types';
import { sound } from '../../utils/audio';
import { Sparkles, HelpCircle } from 'lucide-react';

interface EventModalProps {
  event: RandomEvent | null;
  onChoose: (choice: RandomEventChoice) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onChoose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#4A2E18]/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-[#FFFDF7] border-3 border-[#D2691E] rounded-3xl shadow-2xl p-4 sm:p-6 relative max-h-[88vh] overflow-y-auto">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FFE4B5] border-2 border-[#D2691E]/30 flex items-center justify-center text-3xl shadow-sm mb-3">
            {event.icon}
          </div>

          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D35400] bg-[#FFE4B5] px-2.5 py-0.5 rounded-full">
            Biến Động Bất Ngờ
          </span>

          <h3 className="text-lg font-black text-[#8B5A2B] mt-2 leading-snug">{event.title}</h3>
          <p className="text-xs text-[#6D4C3D] mt-2 leading-relaxed bg-[#FAF3E0] p-3 rounded-2xl border border-[#E6D5BC]">
            {event.description}
          </p>
        </div>

        {/* Choices List */}
        <div className="mt-5 space-y-2.5">
          <span className="text-xs font-bold text-[#8B5A2B] block">Lựa chọn cách xử lý của bạn:</span>

          {event.choices.map((choice, index) => {
            return (
              <button
                key={index}
                onClick={() => {
                  sound.playTap();
                  onChoose(choice);
                }}
                className="w-full p-3.5 rounded-2xl border-2 border-[#E6D5BC] bg-[#FFF8DC]/60 hover:bg-[#FFE4B5] hover:border-[#D2691E] text-left transition-all btn-tactile group shadow-sm"
              >
                <div className="text-xs font-bold text-[#8B5A2B] group-hover:text-[#D35400] flex items-center gap-1.5">
                  <span>👉</span>
                  <span>{choice.text}</span>
                </div>

                {/* Impact badges */}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] font-semibold">
                  {choice.costCash && choice.costCash > 0 && (
                    <span className="text-[#C0392B] bg-[#FFEBEE] px-2 py-0.5 rounded-md border border-[#FFCDD2]">
                      Chi phí: -${choice.costCash}
                    </span>
                  )}
                  {choice.gainCash && choice.gainCash > 0 && (
                    <span className="text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-md border border-[#C8E6C9]">
                      Nhận: +${choice.gainCash}
                    </span>
                  )}
                  {choice.reputationChange && (
                    <span className="text-[#8B5A2B] bg-[#FAF3E0] px-2 py-0.5 rounded-md border border-[#E6D5BC]">
                      Danh tiếng: {choice.reputationChange > 0 ? `+${choice.reputationChange}%` : `${choice.reputationChange}%`}
                    </span>
                  )}
                  {choice.creativePointsGain && (
                    <span className="text-[#D35400] bg-[#FFF3E0] px-2 py-0.5 rounded-md border border-[#FFE0B2]">
                      +{choice.creativePointsGain} CP
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
