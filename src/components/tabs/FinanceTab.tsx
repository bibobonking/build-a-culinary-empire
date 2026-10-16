import React from 'react';
import { GameState } from '../../types';
import { sound } from '../../utils/audio';
import confetti from '../../utils/confettiFx';
import { DollarSign, Landmark, TrendingUp, Briefcase, Building, ShoppingBag, PieChart } from 'lucide-react';

interface FinanceTabProps {
  gameState: GameState;
  onTakeLoan: (loanId: string) => void;
  onRepayLoan: (loanId: string) => void;
  onBuyFranchise: (branchId: string) => void;
  onAcquireRival: (rivalId: string) => void;
  onClaimEmergencyRelief?: () => void;
  onEarnQuickCash?: () => void;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({
  gameState,
  onTakeLoan,
  onRepayLoan,
  onBuyFranchise,
  onAcquireRival,
  onClaimEmergencyRelief,
  onEarnQuickCash,
}) => {
  const today = gameState.todayStats;
  const totalSalaries = gameState.staff.reduce((acc, s) => acc + s.salary, 0);
  const estimatedTax = Math.round(today.revenue * 0.08 * 10) / 10;
  const estimatedProfit = Math.round((today.revenue + today.tips - today.foodCost - totalSalaries - estimatedTax) * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Today's Income Statement Breakdown */}
      <div className="bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-3xl p-5 shadow-cozy">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFE4B5] border border-[#D2691E]/30 flex items-center justify-center text-xl">
              📊
            </div>
            <div>
              <h3 className="text-base font-bold text-[#8B5A2B]">Báo Cáo Tài Chính Ngày {gameState.day}</h3>
              <p className="text-xs text-[#8C6D53]">Thống kê dòng tiền theo thời gian thực</p>
            </div>
          </div>

          <span
            className={`text-sm font-black px-3 py-1 rounded-xl border ${
              estimatedProfit >= 0
                ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]'
                : 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]'
            }`}
          >
            Lợi nhuận ước tính: {estimatedProfit >= 0 ? `+$${estimatedProfit}` : `-$${Math.abs(estimatedProfit)}`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#FAF3E0] p-3 rounded-2xl border border-[#E6D5BC]">
            <span className="text-[11px] font-semibold text-[#8C6D53] block">Doanh thu bán món</span>
            <span className="text-base font-black text-[#2E7D32]">+${today.revenue}</span>
          </div>

          <div className="bg-[#FAF3E0] p-3 rounded-2xl border border-[#E6D5BC]">
            <span className="text-[11px] font-semibold text-[#8C6D53] block">Tiền tip thực khách</span>
            <span className="text-base font-black text-[#2E7D32]">+${today.tips}</span>
          </div>

          <div className="bg-[#FAF3E0] p-3 rounded-2xl border border-[#E6D5BC]">
            <span className="text-[11px] font-semibold text-[#8C6D53] block">Chi phí nguyên liệu</span>
            <span className="text-base font-black text-[#C0392B]">-${today.foodCost}</span>
          </div>

          <div className="bg-[#FAF3E0] p-3 rounded-2xl border border-[#E6D5BC]">
            <span className="text-[11px] font-semibold text-[#8C6D53] block">Lương nhân viên</span>
            <span className="text-base font-black text-[#C0392B]">-${totalSalaries}</span>
          </div>
        </div>
      </div>

      {/* Bank Loans & Emergency Rescue Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-[#8B5A2B] flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-[#8B5A2B]" /> Vay Vốn & Quỹ Cứu Trợ Khởi Nghiệp F&B
          </h4>
          {onEarnQuickCash && (
            <button
              onClick={onEarnQuickCash}
              className="px-3 py-1 rounded-xl bg-[#FFF8DC] hover:bg-[#FFE4B5] border border-[#E6D5BC] text-xs font-bold text-[#8B5A2B] btn-tactile flex items-center gap-1.5"
            >
              <span>🥤</span>
              <span>Bán Trà Đá Vỉa Hè (+$10)</span>
            </button>
          )}
        </div>

        {/* Emergency Relief Grant Card if low cash */}
        {onClaimEmergencyRelief && (
          <div className="mb-4 bg-gradient-to-r from-[#FFF8E7] via-[#FFF3D6] to-[#FFE8B8] border-2 border-[#D4AF37] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🏛️</span>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-black text-[#7A5812]">Quỹ Cứu Trợ Khởi Nghiệp Hiệp Hội Ẩm Thực</h5>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#2E7D32] text-white">
                    Miễn Phí
                  </span>
                </div>
                <p className="text-xs text-[#8C6D53] mt-0.5">
                  Tài trợ khẩn cấp <strong>+$200 tiền mặt</strong> và <strong>gói nguyên liệu cơ bản</strong> (Bánh mì, thịt, rau, gia vị, trà đào) giúp quán vượt qua nguy cơ đình trệ, tuyệt đối không lo phá sản!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playCelebration();
                onClaimEmergencyRelief();
              }}
              className="shrink-0 w-full sm:w-auto px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-black shadow-sm btn-tactile"
            >
              Nhận Cứu Trợ ($200 + Kho Hàng)
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gameState.loans.map((loan) => {
            return (
              <div
                key={loan.id}
                className={`bg-[#FFFDF7] border-2 rounded-2xl p-4 shadow-sm flex flex-col justify-between ${
                  loan.taken ? 'border-[#C8E6C9] bg-[#F1F8E9]' : 'border-[#E6D5BC]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🏦</span>
                    <span className="text-sm font-black text-[#2E7D32]">+${loan.amount}</span>
                  </div>

                  <h5 className="text-sm font-bold text-[#8B5A2B] mt-2">{loan.name}</h5>
                  <p className="text-xs text-[#8C6D53] mt-1">
                    Trả góp: <strong className="text-[#C0392B]">${loan.dailyInterest}/ngày</strong> trong 20 ngày
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E6D5BC]">
                  {!loan.taken ? (
                    <button
                      onClick={() => {
                        sound.playCashRegister();
                        onTakeLoan(loan.id);
                      }}
                      className="w-full py-1.5 rounded-xl bg-[#7CB342] hover:bg-[#689F38] text-white text-xs font-bold btn-tactile shadow-sm"
                    >
                      Nhận Khoản Vay (${loan.amount})
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-[#2E7D32] block text-center">
                      Đang trả góp ({loan.remainingDays} ngày còn lại)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Franchise Branches (Nhượng quyền thương hiệu) */}
      <div>
        <h4 className="text-sm font-bold text-[#8B5A2B] mb-3 flex items-center gap-1.5">
          <Building className="w-4 h-4 text-[#E67E22]" /> Mạng Lưới Nhượng Quyền (Franchise)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {gameState.franchises.map((branch) => {
            const canAfford = gameState.cash >= branch.cost;

            return (
              <div
                key={branch.id}
                className={`bg-[#FFFDF7] border-2 rounded-2xl p-4 shadow-sm flex flex-col justify-between ${
                  branch.owned ? 'border-[#A5D6A7] bg-[#F1F8E9]' : 'border-[#E6D5BC]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{branch.icon}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFE4B5] text-[#8B5A2B]">
                      {branch.location}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-[#8B5A2B] mt-2 leading-snug">{branch.name}</h5>
                  <span className="text-xs font-black text-[#2E7D32] mt-1 block">
                    Tiền bản quyền: +${branch.dailyRoyalty}/ngày
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E6D5BC]">
                  {!branch.owned ? (
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        sound.playCelebration();
                        confetti({ particleCount: 50, spread: 60 });
                        onBuyFranchise(branch.id);
                      }}
                      className={`w-full py-1.5 rounded-xl text-xs font-bold btn-tactile shadow-sm ${
                        canAfford
                          ? 'bg-[#E67E22] hover:bg-[#D35400] text-white'
                          : 'bg-[#E0D3C1] text-[#9A8775] cursor-not-allowed'
                      }`}
                    >
                      Mở Chi Nhánh (${branch.cost})
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-[#2E7D32] block text-center">
                      ✓ Đang thu lợi nhuận thụ động
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Acquire Rivals (Mua lại đối thủ cạnh tranh) */}
      <div>
        <h4 className="text-sm font-bold text-[#8B5A2B] mb-3 flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-[#8B5A2B]" /> Sáp Nhập & Mua Lại Đối Thủ Cạnh Tranh
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gameState.rivals.map((rival) => {
            const canAfford = gameState.cash >= rival.cost;

            return (
              <div
                key={rival.id}
                className={`bg-[#FFFDF7] border-2 rounded-2xl p-4 shadow-sm flex flex-col justify-between ${
                  rival.acquired ? 'border-[#C8E6C9] bg-[#F1F8E9]' : 'border-[#E6D5BC]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{rival.icon}</span>
                    <span className="text-xs font-black text-[#8B5A2B]">${rival.cost}</span>
                  </div>

                  <h5 className="text-sm font-bold text-[#8B5A2B] mt-2">{rival.name}</h5>
                  <p className="text-xs text-[#8C6D53] mt-0.5">{rival.cuisine}</p>
                  <span className="text-xs font-bold text-[#7CB342] mt-1.5 block">
                    + {rival.marketShareBoost}% Thị phần thực khách
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E6D5BC]">
                  {!rival.acquired ? (
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        sound.playCelebration();
                        confetti({ particleCount: 60, spread: 60 });
                        onAcquireRival(rival.id);
                      }}
                      className={`w-full py-1.5 rounded-xl text-xs font-bold btn-tactile shadow-sm ${
                        canAfford
                          ? 'bg-[#8B5A2B] hover:bg-[#6D421B] text-white'
                          : 'bg-[#E0D3C1] text-[#9A8775] cursor-not-allowed'
                      }`}
                    >
                      Mua Lại Cửa Hàng (${rival.cost})
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-[#2E7D32] block text-center">
                      ✓ Đã sáp nhập vào đế chế
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
