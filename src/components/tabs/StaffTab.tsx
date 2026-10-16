import React from 'react';
import { GameState, Staff, StaffRole } from '../../types';
import { AVAILABLE_STAFF_CANDIDATES } from '../../data/gameData';
import { sound } from '../../utils/audio';
import { Users, Heart, Coffee, DollarSign, UserPlus, Award, UserX } from 'lucide-react';

interface StaffTabProps {
  gameState: GameState;
  onBonusStaff: (staffId: string) => void;
  onRestStaff: (staffId: string) => void;
  onFireStaff: (staffId: string) => void;
  onHireStaff: (candidateIndex: number) => void;
  onAdjustSalary: (staffId: string, amount: number) => void;
}

export const StaffTab: React.FC<StaffTabProps> = ({
  gameState,
  onBonusStaff,
  onRestStaff,
  onFireStaff,
  onHireStaff,
  onAdjustSalary,
}) => {
  const getRoleBadge = (role: StaffRole) => {
    switch (role) {
      case 'chef':
        return { label: 'Đầu Bếp', bg: 'bg-[#FFE4B5] text-[#D35400]' };
      case 'server':
        return { label: 'Phục Vụ', bg: 'bg-[#E8F5E9] text-[#2E7D32]' };
      case 'cashier':
        return { label: 'Thu Ngân', bg: 'bg-[#E1F5FE] text-[#0288D1]' };
      case 'manager':
        return { label: 'Quản Lý', bg: 'bg-[#F3E5F5] text-[#7B1FA2]' };
      default:
        return { label: 'Nhân Viên', bg: 'bg-[#FAF3E0] text-[#8B5A2B]' };
    }
  };

  const totalDailySalaries = gameState.staff.reduce((sum, s) => sum + s.salary, 0);

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFE4B5] border border-[#D2691E]/30 flex items-center justify-center text-2xl">
            👥
          </div>
          <div>
            <h3 className="text-base font-bold text-[#8B5A2B]">Đội Ngũ Nhân Sự Quán</h3>
            <p className="text-xs text-[#8C6D53]">
              Hiện có <strong className="text-[#8B5A2B]">{gameState.staff.length} nhân viên</strong> đang cống hiến
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-[#8C6D53]">
          <span className="bg-[#FFF8DC] px-3 py-1.5 rounded-xl border border-[#E6D5BC]">
            Tổng quỹ lương: <strong className="text-[#C0392B]">${totalDailySalaries}/ngày</strong>
          </span>
        </div>
      </div>

      {/* Active Staff List */}
      <div>
        <h4 className="text-sm font-bold text-[#8B5A2B] mb-3 flex items-center gap-1.5">
          <span>👔</span> Danh Sách Nhân Viên Hiện Tại
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameState.staff.map((staff) => {
            const roleInfo = getRoleBadge(staff.role);
            const isQuittingRisk = staff.morale < 35 || staff.fatigue > 75;

            return (
              <div
                key={staff.id}
                className={`bg-[#FFFDF7] border-2 rounded-2xl p-4 shadow-cozy flex flex-col justify-between transition-all ${
                  isQuittingRisk ? 'border-[#E57373] ring-1 ring-[#EF5350]/30' : 'border-[#E6D5BC]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{staff.avatar}</span>
                      <div>
                        <h4 className="text-sm font-bold text-[#8B5A2B] leading-tight">{staff.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${roleInfo.bg}`}>
                          {roleInfo.label}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        staff.status === 'working'
                          ? 'bg-[#E8F5E9] text-[#2E7D32]'
                          : 'bg-[#FFF3E0] text-[#E65100]'
                      }`}
                    >
                      {staff.status === 'working' ? 'Đang làm việc' : 'Nghỉ phép 🏖️'}
                    </span>
                  </div>

                  {/* Morale & Fatigue Bars */}
                  <div className="mt-3 space-y-2 text-xs text-[#8C6D53]">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-[#E57373]" /> Tinh thần:
                        </span>
                        <strong className="text-[#8B5A2B]">{staff.morale}%</strong>
                      </div>
                      <div className="w-full bg-[#E6D5BC] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            staff.morale > 60 ? 'bg-[#7CB342]' : staff.morale > 30 ? 'bg-[#F39C12]' : 'bg-[#E74C3C]'
                          }`}
                          style={{ width: `${staff.morale}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1">
                          <Coffee className="w-3.5 h-3.5 text-[#8C6D53]" /> Mệt mỏi:
                        </span>
                        <strong className="text-[#8B5A2B]">{staff.fatigue}%</strong>
                      </div>
                      <div className="w-full bg-[#E6D5BC] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            staff.fatigue < 40 ? 'bg-[#7CB342]' : staff.fatigue < 75 ? 'bg-[#F39C12]' : 'bg-[#E74C3C]'
                          }`}
                          style={{ width: `${staff.fatigue}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span>Lương ngày:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onAdjustSalary(staff.id, -2)}
                          className="w-5 h-5 rounded bg-[#FAF3E0] hover:bg-[#FFE4B5] border border-[#E6D5BC] font-bold text-xs btn-tactile"
                        >
                          -
                        </button>
                        <strong className="text-[#2E7D32]">${staff.salary}</strong>
                        <button
                          onClick={() => onAdjustSalary(staff.id, 2)}
                          className="w-5 h-5 rounded bg-[#FAF3E0] hover:bg-[#FFE4B5] border border-[#E6D5BC] font-bold text-xs btn-tactile"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Staff Actions */}
                <div className="mt-4 pt-3 border-t border-[#E6D5BC] flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => {
                      sound.playCashRegister();
                      onBonusStaff(staff.id);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-[#FFF8DC] hover:bg-[#FFE4B5] text-[#8B5A2B] text-xs font-bold border border-[#E6D5BC] btn-tactile"
                    title="Thưởng nóng $20 để phục hồi +30 tinh thần"
                  >
                    🎁 Thưởng $20
                  </button>

                  <button
                    onClick={() => {
                      sound.playTap();
                      onRestStaff(staff.id);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] text-xs font-bold border border-[#C8E6C9] btn-tactile"
                    title="Cho nghỉ ngơi 1 ngày để hết mệt mỏi"
                  >
                    🏖️ Nghỉ Phép
                  </button>

                  <button
                    onClick={() => {
                      sound.playTap();
                      onFireStaff(staff.id);
                    }}
                    className="p-1.5 rounded-xl bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] border border-[#FFCDD2] btn-tactile"
                    title="Cho thôi việc"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recruitment Hiring Pool */}
      <div>
        <h4 className="text-sm font-bold text-[#8B5A2B] mb-3 flex items-center gap-1.5">
          <UserPlus className="w-4 h-4 text-[#7CB342]" /> Ứng Viên Đang Tìm Việc
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVAILABLE_STAFF_CANDIDATES.map((cand, idx) => {
            const roleInfo = getRoleBadge(cand.role);
            const isAlreadyHired = gameState.staff.some((s) => s.name === cand.name);

            return (
              <div
                key={idx}
                className="bg-[#FFFDF7] border-2 border-[#E6D5BC] rounded-2xl p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{cand.avatar}</span>
                      <div>
                        <h4 className="text-sm font-bold text-[#8B5A2B] leading-tight">{cand.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${roleInfo.bg}`}>
                          {roleInfo.label}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#2E7D32]">${cand.salary}/ngày</span>
                  </div>

                  <div className="flex items-center gap-3 mt-3 text-xs text-[#8C6D53]">
                    <span>⚡ Tốc độ: {cand.speed}%</span>
                    <span>•</span>
                    <span>🌟 Tay nghề: {cand.skill}%</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E6D5BC] flex justify-end">
                  <button
                    disabled={isAlreadyHired}
                    onClick={() => {
                      sound.playCashRegister();
                      onHireStaff(idx);
                    }}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold btn-tactile shadow-sm text-center ${
                      isAlreadyHired
                        ? 'bg-[#E0D3C1] text-[#9A8775] cursor-not-allowed'
                        : 'bg-[#7CB342] hover:bg-[#689F38] text-white'
                    }`}
                  >
                    {isAlreadyHired ? 'Đã Tuyển Dụng' : 'Tuyển Dụng Ngay'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
