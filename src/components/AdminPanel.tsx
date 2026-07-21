import React, { useState } from 'react';
import { Server, Activity, Cpu, ShieldAlert, LogOut, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '@/constants/appRoutes';
import { useAuthStore } from '@/stores/auth.store';

interface Log {
  time: string;
  type: 'info' | 'warning';
  message: string;
}

const initialLogs: Log[] = [
  { time: '23:15:02', type: 'info', message: 'Xác thực JWT nội bộ: Đã xác thực thành công phiên làm việc của doctor-service.' },
  { time: '23:15:20', type: 'info', message: 'Đồng bộ Cache: Đã đồng bộ 14 khung giờ lịch khám vào Redis cache.' },
  { time: '23:18:44', type: 'info', message: 'Gửi thông báo: Đã gửi SMS nhắc lịch cho Lịch hẹn #APP-998 (BS. Lý Thị Mỹ Dung).' }
];

interface SimLog {
  time: string;
  text: string;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const [simRunning, setSimRunning] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simLogs, setSimLogs] = useState<SimLog[]>([]);

  const [stats, setStats] = useState({
    todayAppts: 48,
    activeDocs: '12/15',
    pendingNotifs: 3,
    conflictsPrevented: 142
  });

  const runSimulation = () => {
    if (simRunning) return;
    setSimRunning(true);
    setSimStep(1);
    setSimLogs([]);

    const steps = [
      { step: 1, log: '⚡ Nhận yêu cầu: Gateway phát hiện 2 yêu cầu đặt lịch trùng khung giờ của BS. Mỹ Dung (25/06 - 10:30).', delay: 800 },
      { step: 2, log: '🧵 Phân phối luồng: Luồng A (Bệnh nhân Nguyễn Hải) và Luồng B (Bệnh nhân Trần Mai) gửi tới Appointment Service.', delay: 1500 },
      { step: 3, log: '🔒 Khởi tạo Khóa: Gọi acquireLock("lock:doctor:1:2026-06-25:10:30") trên Redis Cluster (Redisson).', delay: 2200 },
      { step: 4, log: '✅ Cấp khóa thành công: Luồng A chiếm được khóa Redis. Luồng B bị chặn khóa, chuyển sang chế độ đợi thử lại.', delay: 3000 },
      { step: 5, log: '🗄️ Lưu cơ sở dữ liệu: Luồng A xác nhận chỗ trống, lưu lịch hẹn #APP-7712. Kích hoạt sự kiện AppointmentBookedEvent.', delay: 3800 },
      { step: 6, log: '🔓 Giải phóng khóa: Luồng A hoàn tất giao dịch và mở khóa Redis.', delay: 4500 },
      { step: 7, log: '🔄 Thử lại khóa: Luồng B lấy được khóa sau giải phóng, kiểm tra dữ liệu trạng thái: ĐÃ ĐẶT.', delay: 5300 },
      { step: 8, log: '🛑 Phát hiện xung đột: Tiến trình Luồng B bị hủy bỏ. Trả về DoubleBookingException. Hủy giao dịch an toàn.', delay: 6000 },
      { step: 9, log: '⚠️ Phản hồi Client: Trả về mã 201 Thành công cho Luồng A, và 409 Xung đột (Đã có lịch hẹn) cho Luồng B.', delay: 6800 }
    ];

    steps.forEach((s) => {
      setTimeout(() => {
        setSimStep(s.step);
        setSimLogs(prev => [...prev, { time: new Date().toLocaleTimeString('vi-VN'), text: s.log }]);

        if (s.step === 9) {
          setSimRunning(false);
          setStats(prev => ({
            ...prev,
            todayAppts: prev.todayAppts + 1,
            conflictsPrevented: prev.conflictsPrevented + 1
          }));

          setLogs(prev => [
            { time: new Date().toLocaleTimeString('vi-VN'), type: 'warning', message: 'Ngăn chặn đặt lịch trùng: Đã giải quyết xung đột đặt lịch trùng bằng khóa phân tán Redisson thành công.' },
            ...prev
          ]);
        }
      }, s.delay);
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate(APP_ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-700 font-sans flex flex-col w-full antialiased">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-red-650 flex items-center justify-center text-white shadow-md shadow-rose-500/10">
              <Layers className="w-5.5 h-5.5" />
            </div>
            <span className="text-xl font-extrabold text-slate-800 tracking-tight font-display">Quản trị viên - Đặtkhámnhanh</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-medium">Vai trò: Admin</p>
              <p className="text-xs font-bold text-slate-700">{user?.email || 'Người quản trị'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-white border border-red-200 hover:bg-red-500 hover:border-red-500 px-4 py-2.5 rounded-xl transition-all-300 bg-white shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-8 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Top Statistics Bar */}
        <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-premium">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Lịch hẹn hôm nay</span>
            <p className="text-2xl font-black text-[#007BFF] mt-1.5">{stats.todayAppts}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-premium">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Bác sĩ hoạt động</span>
            <p className="text-2xl font-black text-emerald-500 mt-1.5">{stats.activeDocs}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-premium">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">RabbitMQ Queue</span>
            <p className="text-2xl font-black text-amber-500 mt-1.5">{stats.pendingNotifs}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-premium">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Xung đột ngăn chặn (Redis)</span>
            <p className="text-2xl font-black text-rose-500 mt-1.5">{stats.conflictsPrevented}</p>
          </div>
        </section>

        {/* Distributed Lock Simulation (7 cols) */}
        <section className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6.5 shadow-premium flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 font-display">
                <Cpu className="w-5 h-5 text-[#007BFF]" />
                Giả lập Đặt trùng (Distributed Lock Redisson)
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-semibold">Bấm nút để mô phỏng 2 bệnh nhân cùng lúc đặt trùng khung giờ bác sĩ.</p>
            </div>
            <button
              onClick={runSimulation}
              disabled={simRunning}
              className={`text-xs font-bold py-2.5 px-4 rounded-xl transition-all-300 shadow-sm cursor-pointer ${
                simRunning 
                  ? 'bg-slate-100 text-slate-400 border border-slate-200/50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#007BFF] to-[#0056b3] hover:from-[#0056b3] hover:to-[#004085] text-white shadow-[#007BFF]/10'
              }`}
            >
              Chạy mô phỏng
            </button>
          </div>

          <div className="bg-[#F8F9FA] border border-slate-150 rounded-2xl p-5 flex-1 min-h-[320px] flex flex-col justify-between">
            {simStep === 0 ? (
              <div className="text-center py-14 space-y-3.5 my-auto">
                <ShieldAlert className="w-12 h-12 text-slate-350 mx-auto" />
                <h3 className="text-sm font-extrabold text-slate-700">Trạng thái: Sẵn sàng thử nghiệm</h3>
                <p className="text-xs text-slate-400 max-w-[340px] mx-auto leading-relaxed font-semibold">
                  Mô hình giúp kiểm nghiệm tính toàn vẹn dữ liệu, chống xung đột Race Condition qua Redis Cluster.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center px-4">
                  {/* Luồng A */}
                  <div className={`p-4 rounded-2xl border text-center transition-all duration-350 ${
                    simStep >= 4 ? 'bg-[#E6F7FF] border-[#007BFF]/30 text-[#007BFF]' : 'bg-white border-slate-150 shadow-sm'
                  }`}>
                    <span className="text-[9px] block font-bold text-slate-400 uppercase tracking-wider">Luồng A</span>
                    <span className="text-xs font-bold block mt-1">Nguyễn Hải</span>
                  </div>

                  {/* Trung tâm Khóa */}
                  <div className="flex flex-col items-center gap-1.5 px-4 flex-1">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">Khóa Redis</span>
                    <div className={`w-20 h-8 rounded-full flex items-center justify-center border font-extrabold text-[10.5px] transition-all duration-350 ${
                      simStep >= 4 && simStep < 6
                        ? 'bg-red-50 text-red-550 border-red-200 animate-pulse'
                        : 'bg-white border-slate-200 text-slate-450'
                    }`}>
                      {simStep >= 4 && simStep < 6 ? 'LOCKED' : 'FREE'}
                    </div>
                  </div>

                  {/* Luồng B */}
                  <div className={`p-4 rounded-2xl border text-center transition-all duration-350 ${
                    simStep >= 8 ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-150 shadow-sm'
                  }`}>
                    <span className="text-[9px] block font-bold text-slate-400 uppercase tracking-wider">Luồng B</span>
                    <span className="text-xs font-bold block mt-1">Trần Mai</span>
                  </div>
                </div>

                {/* Console Logs */}
                <div className="bg-[#1E293B] text-emerald-450 font-mono text-[11px] rounded-xl p-4.5 space-y-2 max-h-[200px] overflow-y-auto shadow-inner leading-relaxed">
                  {simLogs.map((l, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-slate-450 shrink-0">[{l.time}]</span>
                      <span className="text-slate-100">{l.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Microservices Health status and Audit logs (5 cols) */}
        <section className="lg:col-span-5 space-y-6">
          {/* Cluster Status */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-4 font-display">
              <Server className="w-5 h-5 text-[#007BFF]" />
              Trạng thái Cụm Hệ thống
            </h2>
            <div className="space-y-3.5">
              {[
                { name: 'API Gateway (8080)', status: 'Hoạt động', color: 'bg-emerald-500' },
                { name: 'Patient Service (8081)', status: 'Hoạt động', color: 'bg-emerald-500' },
                { name: 'Doctor Service (8082)', status: 'Hoạt động', color: 'bg-emerald-500' },
                { name: 'Appointment Service (8083)', status: 'Hoạt động', color: 'bg-emerald-500' },
                { name: 'Redis / Redisson Cluster', status: 'Hoạt động', color: 'bg-emerald-500' }
              ].map((svc) => (
                <div key={svc.name} className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">{svc.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${svc.color} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${svc.color}`}></span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-500">{svc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-4 font-display">
              <Activity className="w-5 h-5 text-[#007BFF]" />
              Nhật ký kiểm tra (System Audit)
            </h2>
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {logs.map((log, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-2 text-[11px] font-semibold">
                  <div className="flex justify-between items-center font-bold">
                    <span className={log.type === 'warning' ? 'text-red-500 bg-red-50 px-2 py-0.5 rounded' : 'text-slate-450 bg-slate-100 px-2 py-0.5 rounded'}>
                      {log.type === 'warning' ? 'ĐỒNG BỘ TRÙNG' : 'INFO'}
                    </span>
                    <span className="text-slate-400 font-normal">{log.time}</span>
                  </div>
                  <p className="text-slate-600 mt-1.5 leading-relaxed">{log.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminPanel;
