import React from 'react';
import { GameState, Review } from '../../types';
import { CUSTOMER_ARCHETYPES } from '../../data/gameData';
import { Star, MessageSquareQuote, Heart, Users, ThumbsUp } from 'lucide-react';

interface CustomersTabProps {
  gameState: GameState;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({ gameState }) => {
  return (
    <div className="space-y-6">
      {/* Top Rating Dashboard */}
      <div className="bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-3xl p-5 shadow-cozy flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFE4B5] border-2 border-[#D2691E]/30 flex flex-col items-center justify-center shadow-sm">
            <span className="text-2xl font-black text-[#8B5A2B]">{gameState.starRating.toFixed(1)}</span>
            <div className="flex text-[#F39C12] text-[10px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < Math.round(gameState.starRating) ? '★' : '☆'}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#8B5A2B]">Điểm Đánh Giá & Sự Hài Lòng Thực Khách</h3>
            <p className="text-xs text-[#8C6D53] mt-0.5">
              Dựa trên tổng cộng <strong className="text-[#8B5A2B]">{gameState.totalReviews} lượt đánh giá</strong> từ
              khách hàng
            </p>
            <div className="flex items-center gap-3 text-xs text-[#7CB342] font-semibold mt-1.5">
              <span>✓ Tỉ lệ hài lòng: {Math.round(gameState.starRating * 20)}%</span>
              <span>•</span>
              <span className="text-[#E67E22]">
                Tổng khách đã tiếp đón: {gameState.totalCustomersServedAllTime} thực khách
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#FAF3E0] border border-[#E6D5BC] rounded-2xl p-3 text-xs text-[#8C6D53] max-w-sm">
          <span className="font-bold text-[#8B5A2B] block mb-0.5">💡 Tác động của điểm đánh giá:</span>
          Điểm càng cao (&gt;4.5 sao) sẽ thu hút các nhà phê bình Michelin và food blogger ghé thăm, gia tăng đáng kể
          lượng khách và tiền boa (tip)!
        </div>
      </div>

      {/* Customer Archetypes Breakdown */}
      <div>
        <h4 className="text-sm font-bold text-[#8B5A2B] mb-3 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[#8B5A2B]" /> Các Nhóm Thực Khách Mục Tiêu
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CUSTOMER_ARCHETYPES.map((arch) => (
            <div
              key={arch.id}
              className="bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-2xl p-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{arch.icon}</span>
                  <div>
                    <h5 className="text-sm font-bold text-[#8B5A2B]">{arch.name}</h5>
                    <span className="text-[11px] text-[#D35400] font-semibold">
                      Ngân sách: x{arch.budgetMultiplier} &bull; Độ khó tính: {arch.strictness}/5
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#8C6D53] mt-2.5 leading-relaxed">{arch.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#E6D5BC] text-[11px] text-[#A0522D] flex items-center justify-between">
                <span className="font-semibold">Ngân sách chi tiêu:</span>
                <span className="font-bold text-[#2E7D32]">x{arch.budgetMultiplier} giá trị</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Recent Customer Reviews Feed */}
      <div>
        <h4 className="text-sm font-bold text-[#8B5A2B] mb-3 flex items-center gap-1.5">
          <MessageSquareQuote className="w-4 h-4 text-[#E67E22]" /> Nhật Ký Đánh Giá Gần Đây
        </h4>

        <div className="space-y-3">
          {gameState.recentReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{rev.avatar}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8B5A2B]">{rev.customerName}</span>
                    <span className="text-[10px] text-[#A08875]">• {rev.timestamp} (Ngày {rev.day})</span>
                    <span className="text-xs text-[#F39C12] font-black">
                      {'★'.repeat(rev.rating)}
                      {'☆'.repeat(5 - rev.rating)}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C3A21] mt-1 italic font-medium">"{rev.comment}"</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#8C6D53]">
                    <span className="bg-[#FAF3E0] px-2 py-0.5 rounded border border-[#E6D5BC] font-semibold">
                      {rev.dishIcon} {rev.dishName}
                    </span>
                    {rev.tip > 0 && (
                      <span className="text-[#2E7D32] font-bold">💵 Tiền tip: +${rev.tip}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
