import React, { useState } from 'react';
import { sound } from '../../utils/sound';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Tutorial "Đầu Bếp Đồng Hành": mỗi bước được dẫn dắt như một cuộc chuyện trò
 * giữa chủ quán và người đầu bếp kỳ cựu — có lời thoại riêng cho từng bước,
 * kèm ví dụ thực tế bằng số liệu và mẹo bám vào vòng lặp chơi thật của game.
 */

interface Step {
  title: string;
  chapter: string;
  icon: string;
  subtitle: string;
  chefIntro: string;
  content: React.ReactNode;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps: Step[] = [
    {
      title: 'Nhận Quán — Vốn Còn Ít, Khát Vọng Thì Lớn',
      chapter: 'Mở Đầu',
      icon: '👑',
      subtitle: 'Từ xe bánh mì vỉa hè đến đế chế Michelin toàn cầu',
      chefIntro: 'Chào sếp mới! Tôi là đầu bếp kỳ cựu nhất khu này — 20 năm lưng quần soong. Quyết định nhận quán của anh chuẩn không cần chỉnh, để tôi dẫn anh một vòng cho khỏi chập chững nhé!',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#5C3A21] leading-relaxed text-left">
          <p>
            Bắt đầu với một <strong>quầy xe bánh mì khiêm tốn</strong>, vài triệu tiền mặt và đúng <strong>2 công thức</strong> trong sổ tay. Nghe ít — nhưng chính từ đây, mọi đế chế ẩm thực đều như thế! Mục tiêu của mình: chuỗi nhà hàng <strong>5 sao Michelin</strong> đắt khách nhất thế giới.
          </p>
          <div className="bg-[#FFF8DC] p-3 rounded-2xl border border-[#E6D5BC] space-y-1.5">
            <div className="font-bold text-[#E67E22] flex items-center gap-1.5">
              <span>🗺️</span>
              <span>Vòng lặp kinh doanh — chỉ 4 bước, lặp tới khi giàu:</span>
            </div>
            <ol className="list-decimal list-inside text-xs text-[#8C6D53] space-y-1.5">
              <li><strong>Mua nguyên liệu</strong> ở Chợ (tự restock mỗi 3 phút, có đợt giảm giá ngẫu nhiên).</li>
              <li><strong>Sáng chế công thức</strong> hoặc mở FoodBox gacha để làm giàu thực đơn.</li>
              <li><strong>Nấu món hoàn toàn miễn phí</strong> — món chín xếp ngay trên quẩy ra món.</li>
              <li><strong>Khách tự ghé, ăn, tip tiền</strong> — mình chỉ việc gom vào quỹ đế chế. 💰</li>
            </ol>
          </div>
          <div className="bg-[#E8F5E9] p-2.5 rounded-xl border border-[#A5D6A7] text-xs text-[#2E7D32] flex items-start gap-2">
            <span className="text-base leading-none mt-0.5">🎯</span>
            <span><strong>Lộ trình của tôi:</strong> 10 phút đầu — quen chợ & nấu. 30 phút — mở FoodBox đầu tiên. 1 giờ — có nhân viên và bàn ghế mới. Từ đó trở đi — toàn là chuyện của anh rồi!</span>
          </div>
          <p className="text-[11px] text-[#8C6D53] italic">
            Tutorial chỉ 2 phút — anh có thể đóng bất cứ lúc nào và mở lại qua nút <strong>❓ Hướng Dẫn</strong> trên thanh trên cùng.
          </p>
        </div>
      ),
    },
    {
      title: 'Chợ Nguyên Liệu — Đọc Vị, Canh Giá, Lua Lời Phố',
      chapter: 'Chương 1 · Nguồn Cung',
      icon: '🥬',
      subtitle: 'Ama chưa từng để bạn "cháy túi" — để tôi dạy anh cách này ngay',
      chefIntro: 'Hết nguyên liệu tức là mất khách — và mất khách tức là lời cứ chảy ra миг mỗi ngày. Nguyên liệu là phổi của quán, sếp à. Đây là mấy thủ thuật tôi moi từ chợ cả thập kỷ:',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#5C3A21] leading-relaxed text-left">
          <p>
            <strong>Chợ Nguyên Liệu</strong> tự làm mới toàn bộ hàng mỗi <strong>3 phút</strong>. Tồn kho là có hạn — món ngon có thể <strong>hết hàng ban đầu</strong>; có món lại được <strong>giảm giá ngẫu nhiên 15–25%</strong>. Nguyên tắc của tôi: <strong>hàng rẻ thì ôm, hàng đắt thì chờ</strong>.
          </p>
          <div className="bg-[#FFF8E7] p-3 rounded-2xl border border-[#E6D5BC] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#5C3A21]">
              <span>🥤</span>
              <span>Chiêu "Sống Sót" cho người mới — tôi từng dùng đúng như này:</span>
            </div>
            <ul className="list-disc list-inside text-xs text-[#8C6D53] space-y-1.5">
              <li><strong>Bán Trà Đá (+$10)</strong> — bấm là ra tiền nóng, không tốn nguyên liệu gì (phím tắt <kbd>T</kbd>). Ngày đầu tôi bán 30 ly mới đủ đóng cửa hàng!</li>
              <li>Mua thừa nguyên liệu? Bán lại trong tab kho với <strong>75% giá gốc</strong> — không bị lỗ nặng.</li>
              <li><strong>Quà Đăng Nhập</strong> mỗi ngày (tab 🏅) — chuỗi 7 ngày thưởng mình ngất với phần thưởng đắt giá).</li>
              <li>Nguyên liệu đắt thường có chỉ số <strong>May Mắn (luckBonus)</strong> cao hơn — đáng tiền khi sáng chế.</li>
            </ul>
          </div>
          <div className="bg-[#FFF3E0] p-2.5 rounded-xl border border-[#FFE0B2] text-xs text-[#8B5A2B]">
            🧠 <strong>Cách bố trí thông minh:</strong> giữ nguyên liệu để dự trữ nền (10–20 đơn vị mặt hàng hay dùng), phần còn lại dùng để sáng chế. Chợ restock liên tục — không cần ôm quá nhiều.
          </div>
        </div>
      ),
    },
    {
      title: 'Bếp Sáng Chế — Alchemist Ẩm Thực',
      chapter: 'Chương 2 · Sáng Chế',
      icon: '⚗️',
      subtitle: 'Phối 2–4 nguyên liệu, quay ra công thức theo tỉ lệ Gacha',
      chefIntro: 'Đây là nơi tôi thấy vui nhất sếp ơi — mỗi lần bấm "Sáng Chế", nó giống như chia bài, mà mình là người giỏi chia bài nhất khu! Kinh nghiệm 20 năm cho anh đây:',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#5C3A21] leading-relaxed text-left">
          <p>
            Ở <strong>Bếp Sáng Chế</strong>, chọn từ <strong>2 đến 4 nguyên liệu</strong> rồi bấm chế. Bản thân tôi thích phối theo <strong>chủ đề</strong>: (
            <em>thịt + gia vị nóng</em> hay <em>biển + rau mát</em> — tinh tế như một công thức bản địa thật). Nguyên liệu càng hiếm, thiết bị bếp càng xịn, cấp nhà hàng càng cao → chỉ số <strong>May Mắn</strong> càng lớn → tỉ lệ ra món đỉnh cao càng nhiều:
          </p>
          <div className="grid grid-cols-5 gap-1 text-[10px] font-black text-center">
            <span className="bg-blue-100 text-blue-800 p-1.5 rounded-md">Rare</span>
            <span className="bg-purple-100 text-purple-800 p-1.5 rounded-md">Epic</span>
            <span className="bg-amber-100 text-amber-800 p-1.5 rounded-md">Legendary</span>
            <span className="bg-rose-100 text-rose-800 p-1.5 rounded-md">Mythical</span>
            <span className="bg-pink-100 text-pink-900 p-1.5 rounded-md">Secret</span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
            🎄 <strong>Mẹo theo mùa:</strong> trong các dịp lễ (Tết, Halloween, Giáng Sinh, Trung Thu...), may mắn sáng chế được <strong>boost thêm tới +20%</strong> — canh lễ hội mà chế biến, sếp à!
          </div>
          <p className="text-[11px] text-[#8C6D53]">
            Công thức trùng? Khỏi lo — nó <strong>quy đổi thành Điểm Sáng Tạo (CP)</strong>, tiền của trí tuệ đấy. Món mới còn được thưởng <strong>+10 CP</strong> ngay tức khắc.
          </p>
        </div>
      ),
    },
    {
      title: 'Hộp Bí Ẩn FoodBox — Gambit May Mắn',
      chapter: 'Chương 3 · Gacha Ẩm Thực',
      icon: '📦',
      subtitle: '6 hộp, 5 độ hiếm, và chỉ Secret mới có hiệu ứng "vũ trụ" riêng',
      chefIntro: 'Có những món tôi chẳng bao giờ chế nổi — không phải vì thiếu tài, mà vì công thức nó nằm trong hộp này. Tôi gọi đây là Nghệ Thuật Của Chiếc Hộp!',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#5C3A21] leading-relaxed text-left">
          <p>
            Ngoài sáng chế, anh có thể mở <strong>6 loại Hộp FoodBox</strong> — từ <strong>Đường Phố 📦</strong> giá dễ thở, đến <strong>Hộp Mỹ Vị Á Đông 🥡</strong>, <strong>Yến Tiệc Hoàng Gia 🍱</strong>, <strong>Kho Báu Bếp Trưởng 🗝️</strong>, <strong>Thần Thoại Vô Cực 🔮</strong> và hộp đỉnh cao <strong>Dải Ngân Hà Huyền Bí 🌌</strong>. Mỗi hộp bung ra một công thức thật — không cần phối nguyên liệu gì hết:
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-2xl border border-purple-200 space-y-1.5">
            <div className="font-bold text-purple-900 text-xs">📊 Tỉ lệ minh bạch (áp dụng mọi hộp):</div>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
              <div className="bg-white p-1.5 rounded-lg border border-purple-100 text-blue-700">Rare: 50%</div>
              <div className="bg-white p-1.5 rounded-lg border border-purple-100 text-purple-700">Epic: 30%</div>
              <div className="bg-white p-1.5 rounded-lg border border-purple-100 text-amber-700">Legendary: 14%</div>
              <div className="bg-white p-1.5 rounded-lg border border-purple-100 text-rose-700">Mythical: 5%</div>
              <div className="bg-white p-1.5 rounded-lg border border-purple-100 text-pink-700 col-span-2 text-center">Secret Bí Ẩn: 1% ✨</div>
            </div>
          </div>
          <div className="bg-[#EDE7F6] p-2.5 rounded-xl border border-[#D1C4E9] text-xs text-[#4527A0] space-y-1">
            <p>🌌 <strong>Hộp Dải Ngân Hà</strong> là hộp mới nhất trong đồ đế — giá cầu vui nhưng danh giá không hỡi ai: công thức phù hợp trong đó đều là hàng top đầu lợi nhuận.</p>
            <p>🎁 Mẹo của tôi: <strong>xả nhiệm vụ và sự kiện</strong> — nhiều nhiệm vụ tặng FoodBox miễn phí, anh không cần tốn đồng nào.</p>
          </div>
          <p className="text-[11px] text-[#8C6D53]">
            Và đỉnh cao hơn hết: chỉ <strong>Secret</strong> mới sở hữu hiệu ứng màn sao vũ trụ & âm thanh huyền thoại riêng biệt! 🌌
          </p>
        </div>
      ),
    },
    {
      title: 'Nấu Món Miễn Phí & Đón Khách Đúng Vào',
      chapter: 'Chương 4 · Phục Vụ',
      icon: '🍳',
      subtitle: 'Quầy giữ nhiệt tự phục vụ — khách vào ăn là có tiền',
      chefIntro: 'Câu vàng của nghề tôi: bếp sẵn sàng thì khách sẵn lòng. Mắt đầu bếp học trò của tôi từng để khách chờ — đời không bao giờ quên. Đây là cách làm đúng:',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#5C3A21] leading-relaxed text-left">
          <p>
            Có công thức rồi thì việc nấu <strong>hoàn toàn miễn phí</strong> — không tốn nguyên liệu. Tự bấm <strong>"Nấu 1 / 3 / 5"</strong> hoặc để các đầu bếp tự chuẩn bị liên tục (nếu anh đã thuê người).
          </p>
          <div className="bg-[#FFF8E7] p-3 rounded-2xl border border-[#E6D5BC] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#5C3A21]">
              <span>♨️</span>
              <span>Quầy Ra Món Giữ Nhiệt — hệ thống mà tôi yêu nhất:</span>
            </div>
            <p className="text-xs text-[#8C6D53]">
              Món chín nằm trên quầy. Khách vào bàn sẽ được bưng ra <strong>tức thì</strong> nếu còn món sẵn — nhanh hơn, được <strong>tip siêu hào phóng</strong>! Trống quầy? Tự nấu thêm ngay — đừng bao giờ để quầy đói gió.
            </p>
            <div className="flex items-center gap-2 font-bold text-[#5C3A21] pt-1 border-t border-[#E6D5BC]">
              <span>👋</span>
              <span>Khách vắng? Vẫy tay gọi thôi:</span>
            </div>
            <p className="text-xs text-[#8C6D53]">
              Bấm <strong>"Mời Khách"</strong> (phím <kbd>C</kbd>) để kéo thực khách ngay lập tức. Danh tiếng cao, bàn ghế nhiều và mùa lễ hội = khách ra vào nườm nượp!
            </p>
            <div className="flex items-center gap-2 font-bold text-[#5C3A21] pt-1 border-t border-[#E6D5BC]">
              <span>⏳</span>
              <span>Khách có kiên nhẫn — đừng để lọt khách:</span>
            </div>
            <p className="text-xs text-[#8C6D53]">
              Mỗi loại khách có độ kiên nhẫn và tiêu khác nhau — sinh viên thì tiết kiệm, blogger thì nghiện món hot, <strong>food critic</strong> chấm ảnh từ tên tuổi quán. Bưng món nhanh = điểm hài lòng cao = tip dày.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Nhân Sự — Xây Đội Bếp Của Riêng Anh',
      chapter: 'Chương 5 · Đội Hình',
      icon: '👥',
      subtitle: 'Bếp, phục vụ, thu ngân, quản lý — mỗi người một vai, cả đội một lòng',
      chefIntro: 'Một đầu bếp giỏi không làm được hết mọi thứ — tôi biết thế vì tôi từng cố làm một mình và suýt gục gần chết. Tuyển người đi, sếp, và đừng chọn hời hợt:',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#5C3A21] leading-relaxed text-left">
          <p>
            Nhân viên giúp <strong>nấu nhanh hơn</strong>, <strong>đón khách nhiều hơn</strong>, và quán chạy mượt khi anh bận mở rộng. Nhưng người thì có cảm xúc — chú ý <strong>Tinh thần</strong> và <strong>Mệt mỏi</strong>:
          </p>
          <div className="bg-[#FFF8E7] p-3 rounded-2xl border border-[#E6D5BC] space-y-1.5">
            <ul className="list-disc list-inside text-xs text-[#8C6D53] space-y-1">
              <li>Tinh thần thấp thì làm chậm, nghỉ ngơi nhiều — cho nghỉ hoặc bấm <strong>"Khích Lệ"</strong> (miễn phí, có hồi chiêu).</li>
              <li>Càng lên cấp, số slot <strong>lập nghiệp và nấu</strong> càng mở ra — đầu tư vào người trước, đồ sau.</li>
            </ul>
          </div>
          <div className="bg-[#FFF8E7] p-3 rounded-2xl border border-[#E6D5BC] space-y-1.5">
            <div className="font-bold text-[#5C3A21]">📈 Mở Rộng Kinh Doanh (tab Thị Trường):</div>
            <ul className="list-disc list-inside text-xs text-[#8C6D53] space-y-1">
              <li><strong>Xe Food Truck / Pop-up / Giao Hàng Online</strong> — mua một lần, đón khách bền lâu.</li>
              <li><strong>Chiến dịch truyền thông</strong> — đổi tiền lấy danh tiếng nhanh.</li>
              <li><strong>Vay ngân hàng, nhượng quyền, sáp nhập đối thủ</strong> — đế chế nằm ở tab 💰 Tài Chính.</li>
            </ul>
          </div>
          <p className="text-[11px] text-[#8C6D53] italic">
            Tôi vẫn nhớ ngày đầu tuyển <strong>chị phục vụ đầu tiên</strong> — doanh thu tăng gấp rưỡi trong tuần đó. Đầu tư vào con người luôn lời nhất, sếp!
          </p>
        </div>
      ),
    },
    {
      title: 'Mùa Lễ Hội, Nhiệm Vụ & Thành Tựu',
      chapter: 'Chương 6 · Nhịp Thở Trò Chơi',
      icon: '🏆',
      subtitle: 'Chu kỳ 8 mùa × 15 ngày — mỗi mùa một kiểu boost',
      chefIntro: 'Quán anh không sống trong chân không — thế giới quanh nó chuyển với <strong>nhịp mùa</strong>, và người biết đón mùa là người thắng lớn. Nghe tôi chỉ:',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#5C3A21] leading-relaxed text-left">
          <p>
            Thế giới game xoay vòng qua <strong>8 mùa/lễ hội</strong>: Xuân 🌸 → Hè ☀️ → Thu 🍂 → Đông ❄️ → <strong>Tết 🧧 → Trung Thu 🏮 → Halloween 🎃 → Giáng Sinh 🎄</strong>. Mỗi mùa có boost riêng cho <strong>lượng khách, giá bán và may mắn sáng chế</strong> — xem chip mùa ngay trên khung cảnh nhà hàng!
          </p>
          <div className="bg-[#FFF3E0] p-2.5 rounded-2xl border border-[#FFE0B2] text-xs text-[#8B5A2B] space-y-1">
            <p>🧧 <strong>Tết:</strong> lì xì & hoa mai rơi trong quán — khách đông gấp rưỡi!</p>
            <p>🎃 <strong>Halloween:</strong> bí ngô & dơi treo — khách thích cảm giác rùng rợn lạ miệng!</p>
            <p>🎄 <strong>Giáng Sinh:</strong> tuyết rơi ngoài cửa sổ, cây thông lấp lánh — gia đình ghé nhiều nhất năm!</p>
            <p>🏮 <strong>Trung Thu:</strong> đèn lồng & bánh trung thu — trăng sáng rực trên bầu trời quán.</p>
          </div>
          <div className="bg-[#FFF8DC] p-3 rounded-2xl border border-[#E6D5BC] space-y-1.5">
            <div className="font-bold text-[#5C3A21]">🎯 Vòng phát triển liên tục:</div>
            <ul className="list-disc list-inside text-xs text-[#8C6D53] space-y-1">
              <li><strong>Nhiệm Vụ</strong> (tab 🏆): hằng ngày & cột mốc — nhận thưởng tiền, CP, FoodBox.</li>
              <li><strong>Thành Tựu</strong> (tab 🏅): milestone vĩnh viễn với phần thưởng hậu hĩnh.</li>
              <li>Mẹo nhỏ: gom CP để mua thiết bị & FoodBox; đừng để tiền mặt âm nhé!</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'Nâng Cấp Cơ Sở — Sáu Bậc Thang Đế Chế',
      chapter: 'Chương 7 · Lên Đời',
      icon: '🏰',
      subtitle: '6 cấp bậc, mỗi cấp một giao diện nhà hàng riêng biệt',
      chefIntro: 'Chiếc xe bánh mì đầu tiên của anh rồi sẽ thành hoàng cung — nhưng phải bước từng bậc một. Chưa đủ điều kiện mà gồng nâng cấp là tôi điều trị cho anh khỏi luôn á!',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#5C3A21] leading-relaxed text-left">
          <p>
            Hành trình thăng hạng của mình: <strong>Xe Bánh Mì 🛒 → Quán Ăn Gia Đình 🍜 → Nhà Hàng Phố Thị 🍽️ → Trung Tâm Yến Tiệc 🥂 → Chuỗi 5 Sao ⭐ → Đế Chế Michelin 👑</strong>
          </p>
          <div className="bg-[#FFF8E7] p-3 rounded-2xl border border-[#E6D5BC] space-y-1.5">
            <div className="font-bold text-[#5C3A21]">📋 Điều Kiện Nâng Cấp (tab Cấp Bậc & Thiết Bị):</div>
            <ul className="list-disc list-inside text-xs text-[#8C6D53] space-y-1">
              <li><strong>Đủ tiền mặt</strong> theo yêu cầu của cấp.</li>
              <li><strong>Đủ danh tiếng</strong> (lưu ý: phục vụ nhanh & món ngon là cách lên điểm).</li>
              <li><strong>Hoàn thành & nhận thưởng đủ số nhiệm vụ</strong> — chơi đều tay là lên đời!</li>
            </ul>
            <p className="text-xs text-[#8C6D53] pt-1 border-t border-[#E6D5BC]">
              Mỗi cấp unlock thêm <strong>bàn ghế, thiết bị xịn, giao diện mới toanh</strong>, và <strong>thưởng nóng tiền + CP</strong> vượt trội. Đicular còn có thể đổi màu & phong cách theo từng cấp!
            </p>
          </div>
          <div className="bg-[#E8F5E9] p-2.5 rounded-xl border border-[#A5D6A7] text-xs text-[#2E7D32]">
            ⚡ Cấp cao mở <strong>thêm slot nấu</strong> — tức là cùng lúc nấu được nhiều mẻ hơn. Đây là lợi nhuận lâu dài lớn nhất của mỗi lần thăng cấp.
          </div>
        </div>
      ),
    },
    {
      title: 'Phím Tắt & Mẹo Vàng Của Dân Chuyên',
      chapter: 'Chương Cuối · Thực Chiến',
      icon: '⚡',
      subtitle: 'Chơi nhanh như dân chuyên nghiệp — và mấy câu tôi răn dạy học trò lão lành',
      chefIntro: 'Đây là lúc tôi trao lại bí kíp mẹ truyền cho — nghe kỹ, vì mấy mẹo này cứu tôi bao lần khi quầy trống và khách xếp hàng dài!',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#5C3A21] leading-relaxed text-left">
          <div className="bg-[#FFF8DC] p-3 rounded-2xl border border-[#E6D5BC]">
            <div className="font-bold text-[#5C3A21] mb-1.5">⌨️ Bàn Phím Kỳ Diệu:</div>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-[#8C6D53]">
              <span><kbd>Space</kbd> Tạm dừng</span>
              <span><kbd>F</kbd> Tăng tốc 2x</span>
              <span><kbd>T</kbd> Bán trà đá</span>
              <span><kbd>C</kbd> Mời khách</span>
              <span><kbd>M</kbd> Bật/tắt tiếng</span>
              <span><kbd>1</kbd>–<kbd>0</kbd> Đổi tab</span>
              <span><kbd>Ctrl</kbd>+<kbd>S</kbd> Lưu nhanh</span>
              <span>🖱️ Nhấp trực tiếp tab</span>
            </div>
          </div>
          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 space-y-1.5">
            <div className="font-bold text-emerald-900">🌟 4 Mẹo Vàng Cho Người Mới:</div>
            <ol className="list-decimal list-inside text-xs text-emerald-900 space-y-1">
              <li>Luôn nấu sẵn vài dĩa trên quầy — khách đến là ăn ngay, không phải chờ.</li>
              <li>Canh đợt giảm giá chợ & mùa lễ hội để mua rẻ, bán đắt, chế may mắn cao.</li>
              <li>Nhận hết thưởng nhiệm vụ mỗi ngày — đó là con đường nhanh nhất lên cấp Michelin!</li>
              <li>Game tự lưu mỗi 15 giây, và chơi lại vẫn nhận <strong>thu nhập offline</strong> khi anh vắng mặt — nghỉ ngơi cũng được tiền, sếp ơi!</li>
            </ol>
          </div>
          <div className="bg-[#FFF3E0] p-2.5 rounded-xl border border-[#FFE0B2] text-xs text-[#8B5A2B]">
            🎨 <strong>Chế độ Đồ Họa Thấp</strong> trong ⚙️ Cài đặt: nếu máy khựng hay pin tụt nhanh, bật nó lên — game vẫn đầy đủ tính năng, chỉ dịu hơn trên GPU.
          </div>
          <p className="text-center text-base sm:text-lg font-black text-[#E67E22]">
            Sẵn sàng rồi, sếp? Bếp đã hồng lửa — hãy mở quán thôi! 🍜🔥
          </p>
        </div>
      ),
    },
  ];

  const step = steps[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFDF7] border-3 sm:border-4 border-[#E6D5BC] rounded-3xl max-w-lg w-full p-4 sm:p-6 text-center shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col justify-between max-h-[88vh] overflow-y-auto">
        <div>
          {/* Chapter tag */}
          <div className="flex justify-center mb-2">
            <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-[#B8905F] bg-[#FFF8DC] border border-[#E6D5BC] rounded-full px-3 py-0.5">
              {step.chapter}
            </span>
          </div>

          {/* Chat-bubble style header */}
          <div className="flex items-start gap-2.5 mb-2 text-left">
            <div className="w-11 h-11 rounded-full bg-[#FFE4B5] border-2 border-[#D2691E]/30 flex items-center justify-center text-2xl shrink-0 select-none boot-avatar">
              {step.icon}
            </div>
            <div className="bg-[#FFF8DC] border border-[#E6D5BC] rounded-2xl rounded-tl-sm px-3 py-2 flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-black text-[#5C3A21] leading-snug">
                {step.title}
              </h3>
              <span className="text-[10px] text-[#8C6D53] font-bold">{step.subtitle}</span>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="text-gray-400 hover:text-[#5C3A21] text-lg font-black w-8 h-8 rounded-full bg-[#FAF3E0] flex items-center justify-center btn-tactile shrink-0"
              title="Bỏ qua hướng dẫn"
              aria-label="Đóng hướng dẫn"
            >
              ✕
            </button>
          </div>

          {/* Chef companion intro speech */}
          <div className="flex items-start gap-2 mb-3 text-left">
            <div className="w-8 h-8 rounded-full bg-[#E67E22] flex items-center justify-center text-base shrink-0 border-2 border-[#D35400]/40 select-none">
              🧑{'‍'}🍳
            </div>
            <div className="bg-[#F1F8E9] border border-[#C5E1A5] rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-[#33691E] leading-relaxed flex-1 min-w-0">
              <span className="font-bold text-[#558B2F] mr-1">Đầu bếp già:</span>
              {step.chefIntro}
            </div>
          </div>

          {/* Step counter + progress */}
          <div className="flex items-center justify-between text-[10px] font-black text-[#8C6D53] mb-2">
            <span>Bước {currentStep + 1} / {steps.length}</span>
            <span className="text-[#E67E22]">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#E6D5BC]/60 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF8C42] to-[#E67E22] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Content Body */}
          <div className="py-1">{step.content}</div>
        </div>

        {/* Step Navigation Footer */}
        <div className="pt-4 mt-3 border-t border-[#F0E6D2] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  sound.playTap();
                  setCurrentStep(i);
                }}
                className={`h-2 rounded-full transition-all btn-tactile ${
                  currentStep === i ? 'w-6 bg-[#E67E22]' : 'w-2 bg-[#E6D5BC] hover:bg-[#D4C3A3]'
                }`}
                title={s.title}
                aria-label={s.title}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => {
                  sound.playTap();
                  setCurrentStep((prev) => prev - 1);
                }}
                className="px-3 py-1.5 rounded-xl border border-[#E6D5BC] text-xs font-bold text-[#8C6D53] hover:bg-[#FAF3E0] btn-tactile"
              >
                &larr; Quay lại
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => {
                  sound.playTap();
                  setCurrentStep((prev) => prev + 1);
                }}
                className="px-4 py-1.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-black shadow-sm btn-tactile"
              >
                Tiếp tục &rarr;
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playCelebration();
                  onClose();
                }}
                className="px-4 py-1.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-black shadow-sm animate-pulse btn-tactile"
              >
                Bắt Đầu Ngay! ✨
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
