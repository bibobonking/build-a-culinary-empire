import type { GameState } from '../types';

export interface AchievementDef {
  id: string;
  icon: string;
  title: string;
  desc: string;
  target: number;
  unit: string;
  rewardCash: number;
  rewardCp: number;
  metric: (s: GameState) => number;
}

const owned = (s: GameState) => s.recipes.filter((r) => r.unlocked);
const rarityCount = (s: GameState, ...r: string[]) =>
  owned(s).filter((x) => r.includes(x.rarity)).length;

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'serve_10', icon: '🍽️', title: 'Khách Quen Đầu Tiên', desc: 'Phục vụ 10 thực khách.', target: 10, unit: 'khách', rewardCash: 500, rewardCp: 5, metric: (s) => s.totalCustomersServedAllTime },
  { id: 'serve_100', icon: '🧑‍🤝‍🧑', title: 'Quán Đông Khách', desc: 'Phục vụ 100 thực khách.', target: 100, unit: 'khách', rewardCash: 3000, rewardCp: 20, metric: (s) => s.totalCustomersServedAllTime },
  { id: 'serve_500', icon: '🎪', title: 'Biển Người Mỗi Ngày', desc: 'Phục vụ 500 thực khách.', target: 500, unit: 'khách', rewardCash: 15000, rewardCp: 50, metric: (s) => s.totalCustomersServedAllTime },
  { id: 'serve_2000', icon: '🏟️', title: 'Huyền Thoại Phố Ẩm Thực', desc: 'Phục vụ 2,000 thực khách.', target: 2000, unit: 'khách', rewardCash: 80000, rewardCp: 150, metric: (s) => s.totalCustomersServedAllTime },

  { id: 'earn_10k', icon: '💵', title: 'Những Đồng Đầu Tiên', desc: 'Kiếm tổng cộng $10,000 từ khách.', target: 10000, unit: '$', rewardCash: 1500, rewardCp: 10, metric: (s) => s.counters?.cashEarnedAllTime || 0 },
  { id: 'earn_100k', icon: '💰', title: 'Triệu Phú Tương Lai', desc: 'Kiếm tổng cộng $100,000 từ khách.', target: 100000, unit: '$', rewardCash: 10000, rewardCp: 40, metric: (s) => s.counters?.cashEarnedAllTime || 0 },
  { id: 'earn_1m', icon: '🏦', title: 'Ông Trùm Ẩm Thực', desc: 'Kiếm tổng cộng $1,000,000 từ khách.', target: 1000000, unit: '$', rewardCash: 75000, rewardCp: 200, metric: (s) => s.counters?.cashEarnedAllTime || 0 },
  { id: 'hold_1m', icon: '💎', title: 'Két Sắt Đầy Ắp', desc: 'Đồng thời nắm giữ $1,000,000 tiền mặt.', target: 1000000, unit: '$', rewardCash: 50000, rewardCp: 100, metric: (s) => s.cash },

  { id: 'recipes_10', icon: '📖', title: 'Cuốn Sổ Công Thức', desc: 'Sở hữu 10 công thức khác nhau.', target: 10, unit: 'món', rewardCash: 2000, rewardCp: 15, metric: (s) => owned(s).length },
  { id: 'recipes_30', icon: '📚', title: 'Thư Viện Mỹ Vị', desc: 'Sở hữu 30 công thức khác nhau.', target: 30, unit: 'món', rewardCash: 12000, rewardCp: 60, metric: (s) => owned(s).length },
  { id: 'legendary_1', icon: '🌟', title: 'Ánh Hào Quang Legendary', desc: 'Sở hữu 1 món Legendary trở lên.', target: 1, unit: 'món', rewardCash: 8000, rewardCp: 40, metric: (s) => rarityCount(s, 'Legendary', 'Mythical', 'Secret') },
  { id: 'mythical_1', icon: '🔮', title: 'Chạm Tới Huyền Thoại', desc: 'Sở hữu 1 món Mythical trở lên.', target: 1, unit: 'món', rewardCash: 30000, rewardCp: 120, metric: (s) => rarityCount(s, 'Mythical', 'Secret') },
  { id: 'secret_1', icon: '🗝️', title: 'Người Giữ Bí Mật', desc: 'Khám phá 1 món Secret.', target: 1, unit: 'món', rewardCash: 100000, rewardCp: 300, metric: (s) => rarityCount(s, 'Secret') },

  { id: 'craft_10', icon: '⚗️', title: 'Nhà Giả Kim Bếp Núc', desc: 'Sáng chế 10 lần ở Bếp Sáng Chế.', target: 10, unit: 'lần', rewardCash: 3000, rewardCp: 25, metric: (s) => s.counters?.crafted || 0 },
  { id: 'craft_50', icon: '🧪', title: 'Bậc Thầy Phối Vị', desc: 'Sáng chế 50 lần.', target: 50, unit: 'lần', rewardCash: 25000, rewardCp: 100, metric: (s) => s.counters?.crafted || 0 },
  { id: 'box_10', icon: '🎁', title: 'Thợ Săn Hộp Bí Ẩn', desc: 'Mở 10 FoodBox.', target: 10, unit: 'hộp', rewardCash: 4000, rewardCp: 30, metric: (s) => s.counters?.boxesOpened || 0 },
  { id: 'box_50', icon: '📦', title: 'Đại Gia FoodBox', desc: 'Mở 50 FoodBox.', target: 50, unit: 'hộp', rewardCash: 30000, rewardCp: 120, metric: (s) => s.counters?.boxesOpened || 0 },
  { id: 'cook_20', icon: '🍳', title: 'Tay Chảo Cừ Khôi', desc: 'Tự tay nấu 20 suất ăn.', target: 20, unit: 'suất', rewardCash: 2500, rewardCp: 15, metric: (s) => s.counters?.manualCooked || 0 },

  { id: 'tier_3', icon: '🏠', title: 'Lên Đời Nhà Hàng', desc: 'Đạt cấp cơ sở 3.', target: 3, unit: 'cấp', rewardCash: 8000, rewardCp: 40, metric: (s) => s.restaurantLevel },
  { id: 'tier_6', icon: '🏰', title: 'Đế Chế Michelin', desc: 'Đạt cấp cơ sở tối đa (6).', target: 6, unit: 'cấp', rewardCash: 150000, rewardCp: 300, metric: (s) => s.restaurantLevel },
  { id: 'staff_5', icon: '👥', title: 'Đội Ngũ Hùng Hậu', desc: 'Có 5 nhân viên cùng lúc.', target: 5, unit: 'người', rewardCash: 4000, rewardCp: 20, metric: (s) => s.staff.length },
  { id: 'rep_100', icon: '📣', title: 'Tiếng Lành Đồn Xa', desc: 'Đạt 100% danh tiếng.', target: 100, unit: '%', rewardCash: 10000, rewardCp: 50, metric: (s) => s.reputation },
  { id: 'franchise_3', icon: '🏪', title: 'Chuỗi Nhượng Quyền', desc: 'Sở hữu 3 chi nhánh nhượng quyền.', target: 3, unit: 'chi nhánh', rewardCash: 40000, rewardCp: 100, metric: (s) => s.franchises.filter((f) => f.owned).length },
  { id: 'rival_1', icon: '🤝', title: 'Thâu Tóm Đối Thủ', desc: 'Sáp nhập 1 đối thủ.', target: 1, unit: 'đối thủ', rewardCash: 20000, rewardCp: 80, metric: (s) => s.rivals.filter((r) => r.acquired).length },
  { id: 'day_7', icon: '📅', title: 'Một Tuần Khởi Nghiệp', desc: 'Sống sót đến Ngày 7.', target: 7, unit: 'ngày', rewardCash: 1500, rewardCp: 10, metric: (s) => s.day },
  { id: 'day_30', icon: '🗓️', title: 'Một Tháng Bền Bỉ', desc: 'Sống sót đến Ngày 30.', target: 30, unit: 'ngày', rewardCash: 12000, rewardCp: 60, metric: (s) => s.day },
  { id: 'day_100', icon: '🏆', title: 'Trăm Ngày Rực Rỡ', desc: 'Sống sót đến Ngày 100.', target: 100, unit: 'ngày', rewardCash: 90000, rewardCp: 250, metric: (s) => s.day },

  // --- NEW ACHIEVEMENTS ---
  { id: 'serve_5000', icon: '🎡', title: 'Biểu Tượng Thành Phố', desc: 'Phục vụ 5,000 thực khách.', target: 5000, unit: 'khách', rewardCash: 400000, rewardCp: 500, metric: (s) => s.totalCustomersServedAllTime },
  { id: 'earn_10m', icon: '🪙', title: 'Huyền Thoại Tỉ Phú', desc: 'Kiếm tổng cộng $10,000,000 từ khách.', target: 10000000, unit: '$', rewardCash: 500000, rewardCp: 800, metric: (s) => s.counters?.cashEarnedAllTime || 0 },
  { id: 'recipes_44', icon: '📖', title: 'Sổ Bách Khoa Ẩm Thực', desc: 'Sở hữu toàn bộ 44 công thức.', target: 44, unit: 'món', rewardCash: 300000, rewardCp: 600, metric: (s) => owned(s).length },
  { id: 'secret_3', icon: '🌌', title: 'Bậc Thầy Bí Ẩn', desc: 'Khám phá 3 món Secret.', target: 3, unit: 'món', rewardCash: 500000, rewardCp: 1000, metric: (s) => rarityCount(s, 'Secret') },
  { id: 'craft_200', icon: '🏺', title: 'Bàn Tay Ma Thuật', desc: 'Sáng chế 200 lần.', target: 200, unit: 'lần', rewardCash: 120000, rewardCp: 300, metric: (s) => s.counters?.crafted || 0 },
  { id: 'box_100', icon: '🎊', title: 'Trùm Gacha Cuồng Nhiệt', desc: 'Mở 100 FoodBox.', target: 100, unit: 'hộp', rewardCash: 150000, rewardCp: 400, metric: (s) => s.counters?.boxesOpened || 0 },
  { id: 'staff_8', icon: '🧑‍🍳', title: 'Đội Quân Nhà Bếp', desc: 'Có 8 nhân viên cùng lúc.', target: 8, unit: 'người', rewardCash: 30000, rewardCp: 150, metric: (s) => s.staff.length },
  { id: 'seats_25', icon: '🪑', title: 'Sảnh Tiệc Hoành Tráng', desc: 'Mở rộng lên 25 chỗ ngồi.', target: 25, unit: 'chỗ', rewardCash: 25000, rewardCp: 120, metric: (s) => s.seats },
  { id: 'streak_7', icon: '🔥', title: 'Nghị Lực Bảy Ngày', desc: 'Đăng nhập 7 ngày liên tiếp.', target: 7, unit: 'ngày', rewardCash: 20000, rewardCp: 100, metric: (s) => s.dailyReward?.streak || 0 },
  { id: 'star_4_8', icon: '🌟', title: 'Đánh Giá Giàu Sao', desc: 'Đạt điểm đánh giá trung bình 4.8 sao.', target: 48, unit: '×0.1★', rewardCash: 50000, rewardCp: 200, metric: (s) => Math.round((s.starRating || 0) * 10) },
  { id: 'equip_6', icon: '🛠️', title: 'Nhà Bếp Xương Rồng', desc: 'Sở hữu 6 thiết bị nhà bếp.', target: 6, unit: 'thiết bị', rewardCash: 60000, rewardCp: 250, metric: (s) => s.equipment.filter((e) => e.unlocked).length },
  { id: 'resto_5', icon: '🏬', title: 'Chuỗi Nhà Hàng Lớn', desc: 'Sở hữu 5 chi nhánh nhượng quyền.', target: 5, unit: 'chi nhánh', rewardCash: 250000, rewardCp: 500, metric: (s) => s.franchises.filter((f) => f.owned).length },
];

export const DAILY_REWARDS = [
  { cash: 800, cp: 5 },
  { cash: 1500, cp: 8 },
  { cash: 2500, cp: 12 },
  { cash: 4000, cp: 18 },
  { cash: 6000, cp: 25 },
  { cash: 9000, cp: 35 },
  { cash: 15000, cp: 60 },
];

export function localDateKey(d = new Date()): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
