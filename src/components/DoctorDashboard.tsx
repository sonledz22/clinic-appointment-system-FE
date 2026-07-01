import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, Lock, Unlock, Users, FileText, Activity, LogOut, Award, Star } from 'lucide-react';
import { doLogout, getUserInfo } from '@/services/keycloak';

interface Patient {
  id: string;
  name: string;
  time: string;
  status: 'Chờ khám' | 'Đang khám' | 'Đã xong';
  symptoms: string;
  age: number;
  gender: string;
  ticket: string;
}

const initialPatients: Patient[] = [
  { id: '1', name: 'Nguyễn Văn Hải', time: '09:00', status: 'Đã xong', symptoms: 'Đau đầu âm ỉ kéo dài 3 ngày, cảm giác nặng ngực', age: 34, gender: 'Nam', ticket: '#A21-P' },
  { id: '2', name: 'Trần Thị Mai', time: '10:30', status: 'Đang khám', symptoms: 'Tái khám điều trị chàm da, da khô và đỏ ở vùng cẳng tay', age: 28, gender: 'Nữ', ticket: '#A29-P' },
  { id: '3', name: 'Lê Hoàng Nam', time: '11:00', status: 'Chờ khám', symptoms: 'Khám định kỳ hen suyễn và xin cấp lại đơn thuốc hít', age: 45, gender: 'Nam', ticket: '#A30-P' },
  { id: '4', name: 'Phạm Minh Thư', time: '14:00', status: 'Chờ khám', symptoms: 'Đau họng kèm sốt nhẹ dai dẳng', age: 10, gender: 'Nữ', ticket: '#A31-P' }
];

const daysOfWeek = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu'];

interface Slot {
  time: string;
  state: 'Đã đặt' | 'Trống' | 'Khóa';
  patient?: string;
}

const initialScheduleSlots: Record<string, Slot[]> = {
  'Thứ Hai': [
    { time: '09:00', state: 'Đã đặt', patient: 'Nguyễn Văn Hải' },
    { time: '10:00', state: 'Trống' },
    { time: '11:00', state: 'Đã đặt', patient: 'Lê Hoàng Nam' },
    { time: '12:00', state: 'Khóa' },
    { time: '14:00', state: 'Trống' },
    { time: '15:00', state: 'Trống' }
  ],
  'Thứ Ba': [
    { time: '09:00', state: 'Trống' },
    { time: '10:00', state: 'Trống' },
    { time: '11:00', state: 'Trống' },
    { time: '12:00', state: 'Khóa' },
    { time: '14:00', state: 'Đã đặt', patient: 'Trần Thị Mai' },
    { time: '15:00', state: 'Trống' }
  ],
  'Thứ Tư': [
    { time: '09:00', state: 'Trống' },
    { time: '10:00', state: 'Khóa' },
    { time: '11:00', state: 'Khóa' },
    { time: '12:00', state: 'Khóa' },
    { time: '14:00', state: 'Trống' },
    { time: '15:00', state: 'Trống' }
  ],
  'Thứ Năm': [
    { time: '09:05', state: 'Trống' },
    { time: '10:00', state: 'Trống' },
    { time: '11:00', state: 'Trống' },
    { time: '12:00', state: 'Khóa' },
    { time: '14:00', state: 'Trống' },
    { time: '15:00', state: 'Trống' }
  ],
  'Thứ Sáu': [
    { time: '09:00', state: 'Trống' },
    { time: '10:00', state: 'Trống' },
    { time: '11:00', state: 'Trống' },
    { time: '12:00', state: 'Khóa' },
    { time: '14:00', state: 'Khóa' },
    { time: '15:00', state: 'Khóa' }
  ]
};

const DoctorDashboard: React.FC = () => {
  const userInfo = getUserInfo();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [scheduleSlots, setScheduleSlots] = useState(initialScheduleSlots);
  const [selectedDay, setSelectedDay] = useState('Thứ Hai');
  const [activePatient, setActivePatient] = useState<Patient | null>(null);

  const updateStatus = (patientId: string, newStatus: 'Chờ khám' | 'Đang khám' | 'Đã xong') => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, status: newStatus } : p));
    if (activePatient && activePatient.id === patientId) {
      setActivePatient(prev => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleSlotToggle = (index: number) => {
    const daySlots = [...scheduleSlots[selectedDay]];
    const slot = daySlots[index];

    if (slot.state === 'Đã đặt') return;

    if (slot.state === 'Trống') {
      slot.state = 'Khóa';
    } else {
      slot.state = 'Trống';
    }

    setScheduleSlots({
      ...scheduleSlots,
      [selectedDay]: daySlots
    });
  };

  const totalWaiting = patients.filter(p => p.status === 'Chờ khám').length;
  const totalInProgress = patients.filter(p => p.status === 'Đang khám').length;
  const totalCompleted = patients.filter(p => p.status === 'Đã xong').length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-700 font-sans flex flex-col w-full antialiased">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#007BFF] to-[#00BFFF] flex items-center justify-center text-white shadow-md shadow-[#007BFF]/20">
              <Activity className="w-5.5 h-5.5" />
            </div>
            <span className="text-xl font-extrabold text-[#007BFF] tracking-tight">Bác sĩ - Đặtkhámnhanh</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-medium">Bác sĩ chuyên khoa</p>
              <p className="text-xs font-bold text-slate-700">{userInfo.name || 'Hệ thống Bác sĩ'}</p>
            </div>
            <button
              onClick={() => doLogout()}
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-white border border-red-200 hover:bg-red-500 hover:border-red-500 px-4 py-2.5 rounded-xl transition-all-300 bg-white shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 max-w-7xl mx-auto px-8 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column (5 cols) - Patient queue */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2.5 mb-5 font-display">
              <Users className="w-5 h-5 text-[#007BFF]" />
              Danh sách bệnh nhân khám hôm nay
            </h2>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/60 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Chờ khám</span>
                <p className="text-xl font-extrabold text-amber-500 mt-1">{totalWaiting}</p>
              </div>
              <div className="bg-[#E6F7FF] p-3 rounded-xl border border-[#007BFF]/20 text-center">
                <span className="text-[10px] text-[#007BFF] font-bold uppercase tracking-wider block">Đang khám</span>
                <p className="text-xl font-extrabold text-[#007BFF] mt-1">{totalInProgress}</p>
              </div>
              <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/60 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Đã xong</span>
                <p className="text-xl font-extrabold text-slate-400 mt-1">{totalCompleted}</p>
              </div>
            </div>

            {/* Queue List */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {patients.map(p => (
                <div
                  key={p.id}
                  onClick={() => setActivePatient(p)}
                  className={`border rounded-2xl p-4 transition-all duration-350 cursor-pointer ${
                    activePatient?.id === p.id 
                      ? 'bg-[#E6F7FF]/35 border-[#007BFF] shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-slate-250 shadow-premium'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{p.name}</h4>
                      <p className="text-[10.5px] text-slate-450 mt-1 font-semibold">Tuổi: {p.age} • Giới tính: {p.gender}</p>
                      <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#007BFF]" />
                        <span>Giờ hẹn: {p.time}</span>
                        <span className="font-mono text-[#007BFF] font-extrabold ml-2">{p.ticket}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                      p.status === 'Đã xong' ? 'bg-slate-100 text-slate-500' :
                      p.status === 'Đang khám' ? 'bg-[#E6F7FF] text-[#007BFF]' :
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {activePatient?.id === p.id && (
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                      {p.status === 'Chờ khám' && (
                        <button
                          onClick={() => updateStatus(p.id, 'Đang khám')}
                          className="bg-[#007BFF] hover:bg-[#0056b3] text-white font-bold text-[10.5px] py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all-300 shadow-sm shadow-[#007BFF]/10"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          Bắt đầu khám
                        </button>
                      )}
                      {p.status === 'Đang khám' && (
                        <button
                          onClick={() => updateStatus(p.id, 'Đã xong')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10.5px] py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all-300 shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Hoàn thành khám
                        </button>
                      )}
                      <button
                        onClick={() => alert(`Xem hồ sơ bệnh án của ${p.name}`)}
                        className="bg-white border border-slate-200 hover:border-slate-350 text-slate-700 font-bold text-[10.5px] py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all-300"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        Hồ sơ bệnh án
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Patient Details */}
          {activePatient && (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-premium space-y-3">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <h3 className="text-xs font-extrabold text-[#007BFF] uppercase tracking-wider font-display">Lý do & Triệu chứng khám</h3>
                <span className="font-mono text-[10px] font-bold text-slate-405">{activePatient.ticket}</span>
              </div>
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-slate-500">Họ tên bệnh nhân: <span className="text-slate-800 font-bold ml-1">{activePatient.name}</span></p>
                <p className="bg-[#F8F9FA] border border-slate-200/80 p-3.5 rounded-xl text-slate-700 leading-relaxed font-semibold">
                  {activePatient.symptoms}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Right Column (7 cols) - Schedule Availability Manager */}
        <section className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-7 shadow-premium">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2.5 font-display">
                <Calendar className="w-5 h-5 text-[#007BFF]" />
                Quản lý lịch làm việc bác sĩ
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">Nhấp vào một khung giờ để Khóa hoặc Mở khóa lịch hẹn.</p>
            </div>
            <div className="flex bg-[#F8F9FA] p-1.5 rounded-xl border border-slate-200 gap-1.5">
              {daysOfWeek.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`text-xs font-bold px-3.5 py-2.5 rounded-lg transition-all cursor-pointer ${
                    selectedDay === d ? 'bg-[#007BFF] text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="grid grid-cols-2 gap-4">
            {scheduleSlots[selectedDay].map((slot, index) => (
              <div
                key={index}
                onClick={() => handleSlotToggle(index)}
                className={`border p-4.5 rounded-2xl flex items-center justify-between transition-all duration-350 cursor-pointer ${
                  slot.state === 'Đã đặt' ? 'bg-[#E6F7FF]/40 border-[#007BFF]/20 cursor-not-allowed shadow-inner' :
                  slot.state === 'Khóa' ? 'bg-[#F8F9FA] border-slate-200 opacity-60 hover:opacity-85 shadow-sm' :
                  'bg-white border-slate-100 hover:border-[#007BFF]/30 shadow-premium'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Clock className={`w-5 h-5 ${slot.state === 'Đã đặt' ? 'text-[#007BFF]' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-extrabold text-slate-800 block">{slot.time}</span>
                    <span className="text-[10px] block mt-0.5 font-semibold text-slate-400">
                      {slot.state === 'Đã đặt' ? `Bệnh nhân: ${slot.patient}` :
                       slot.state === 'Khóa' ? 'Đã khóa lịch hẹn' : 'Khung giờ trống'}
                    </span>
                  </div>
                </div>

                <div>
                  {slot.state === 'Đã đặt' ? (
                    <span className="text-[9px] font-extrabold text-[#007BFF] bg-[#E6F7FF] px-2.5 py-0.5 rounded-full uppercase tracking-wider">Đã đặt</span>
                  ) : slot.state === 'Khóa' ? (
                    <div className="p-1 bg-red-50 rounded-lg text-red-500 border border-red-150">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="p-1 bg-emerald-50 rounded-lg text-emerald-550 border border-emerald-100">
                      <Unlock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DoctorDashboard;
