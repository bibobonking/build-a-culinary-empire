import React from 'react';
import { GameState } from '../../types';
import { Newspaper, Bell, Sparkles, BookOpen } from 'lucide-react';

interface EventsTabProps {
  gameState: GameState;
}

export const EventsTab: React.FC<EventsTabProps> = ({ gameState }) => {
  const culinaryTips = [
    {
      title: 'Bí Quyết Vàng: Đảo Chảo Bánh Mì',
      content: 'Để bánh mì giòn tan như mới ra lò, hãy nướng lại trên chảo gang nóng 1 phút trước khi phết pate và kẹp thịt.',
    },
    {
      title: 'Nước Dùng Phở Chuẩn Vị',
      content: 'Ninh xương bò với gừng nướng, hành tím và hoa hồi trên lửa liu riu, hớt bọt liên tục để nước dùng trong vắt ngọt thanh.',
    },
    {
      title: 'Giữ Chân Nhân Sự Tài Năng',
      content: 'Đừng quên thưởng nóng cho đầu bếp sau các đợt khách đông kỷ lục. Tinh thần cao sẽ giúp món ăn nấu nhanh và ngon hơn!',
    },
    {
      title: 'Nắm Bắt Xu Hướng Ẩm Thực',
      content: 'Khi thị trường chuộng Street Food hoặc Fine Dining, hãy đẩy mạnh các món tương ứng trong thực đơn để tối đa hóa doanh thu.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Event Logs List */}
      <div>
        <h4 className="text-sm font-bold text-[#8B5A2B] mb-3 flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-[#E67E22]" /> Dòng Sự Kiện & Biến Động Đã Qua
        </h4>

        <div className="bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-2xl p-4 shadow-cozy space-y-2.5">
          {gameState.eventLogs.map((log, index) => (
            <div
              key={index}
              className="flex items-start gap-2.5 text-xs text-[#5C3A21] pb-2 border-b border-[#E6D5BC]/60 last:border-none last:pb-0"
            >
              <span className="text-base mt-0.5">📢</span>
              <p className="leading-relaxed">{log}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Culinary Knowledge & Tips */}
      <div>
        <h4 className="text-sm font-bold text-[#8B5A2B] mb-3 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-[#7CB342]" /> Cẩm Nang & Mẹo Quản Lý Bếp
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {culinaryTips.map((tip, idx) => (
            <div
              key={idx}
              className="bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-2xl p-4 shadow-sm"
            >
              <h5 className="text-sm font-bold text-[#8B5A2B] flex items-center gap-1.5">
                <span>💡</span> {tip.title}
              </h5>
              <p className="text-xs text-[#8C6D53] mt-2 leading-relaxed">{tip.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
