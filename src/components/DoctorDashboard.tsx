import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Calendar, CheckCircle, Clock, FileText, LogOut, RefreshCcw, Trash2, UserRound } from 'lucide-react';
import { doLogout, getUserInfo } from '@/services/keycloak';
import {
  addDoctorSlot,
  bookDoctorSlot,
  cancelDoctorSlotBooking,
  deleteDoctorSlot,
  fetchDoctors,
  fetchDoctorSlots,
} from '@/features/doctors/services/doctorApi';
import type { Doctor, Slot } from '@/features/doctors/types/doctor';

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
  { id: '4', name: 'Phạm Minh Thư', time: '14:00', status: 'Chờ khám', symptoms: 'Đau họng kèm sốt nhẹ dai dẳng', age: 10, gender: 'Nữ', ticket: '#A31-P' },
];

const formatSlotTime = (value: string) =>
  new Date(value).toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const toDatetimeLocalValue = (date: Date) => {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const buildDefaultEndTime = (startTime: string) => {
  if (!startTime) {
    return '';
  }

  const startDate = new Date(startTime);
  startDate.setHours(startDate.getHours() + 1);
  return toDatetimeLocalValue(startDate);
};

const DoctorDashboard: React.FC = () => {
  const userInfo = getUserInfo();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [savingSlot, setSavingSlot] = useState(false);
  const [error, setError] = useState('');
  const [slotForm, setSlotForm] = useState(() => {
    const startDate = new Date();
    startDate.setMinutes(0, 0, 0);
    startDate.setHours(startDate.getHours() + 1);
    const startTime = toDatetimeLocalValue(startDate);
    return {
      startTime,
      endTime: buildDefaultEndTime(startTime),
    };
  });

  useEffect(() => {
    let mounted = true;

    const loadDoctors = async () => {
      try {
        const data = await fetchDoctors();
        if (!mounted) {
          return;
        }

        setDoctors(data);
        const matchedDoctor = data.find((doctor) => doctor.userId === userInfo.id);
        setSelectedDoctorId(matchedDoctor?.id ?? data[0]?.id ?? '');
        setError('');
      } catch {
        if (mounted) {
          setError('Khong the tai danh sach bac si tu doctor-service.');
        }
      } finally {
        if (mounted) {
          setLoadingDoctors(false);
        }
      }
    };

    loadDoctors();

    return () => {
      mounted = false;
    };
  }, [userInfo.id]);

  useEffect(() => {
    if (!selectedDoctorId) {
      setSlots([]);
      return;
    }

    let mounted = true;

    const loadSlots = async () => {
      setLoadingSlots(true);
      try {
        const data = await fetchDoctorSlots(selectedDoctorId);
        if (mounted) {
          setSlots(data);
          setError('');
        }
      } catch {
        if (mounted) {
          setError('Khong the tai lich lam viec cua bac si da chon.');
        }
      } finally {
        if (mounted) {
          setLoadingSlots(false);
        }
      }
    };

    loadSlots();

    return () => {
      mounted = false;
    };
  }, [selectedDoctorId]);

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === selectedDoctorId) ?? null,
    [doctors, selectedDoctorId],
  );

  const totalWaiting = patients.filter((patient) => patient.status === 'Chờ khám').length;
  const totalInProgress = patients.filter((patient) => patient.status === 'Đang khám').length;
  const totalCompleted = patients.filter((patient) => patient.status === 'Đã xong').length;

  const updateStatus = (patientId: string, newStatus: 'Chờ khám' | 'Đang khám' | 'Đã xong') => {
    setPatients((current) => current.map((patient) => (patient.id === patientId ? { ...patient, status: newStatus } : patient)));
    setActivePatient((current) => (current && current.id === patientId ? { ...current, status: newStatus } : current));
  };

  const refreshSlots = async () => {
    if (!selectedDoctorId) {
      return;
    }

    setLoadingSlots(true);
    try {
      const data = await fetchDoctorSlots(selectedDoctorId);
      setSlots(data);
      setError('');
    } catch {
      setError('Khong the tai lai lich lam viec tu doctor-service.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleAddSlot = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDoctorId || !slotForm.startTime || !slotForm.endTime) {
      setError('Can chon bac si va nhap day du gio bat dau, gio ket thuc.');
      return;
    }

    setSavingSlot(true);
    try {
      await addDoctorSlot(selectedDoctorId, slotForm.startTime, slotForm.endTime);
      await refreshSlots();
      setError('');
    } catch {
      setError('Khong the tao slot moi. Kiem tra lai du lieu thoi gian hoac log backend.');
    } finally {
      setSavingSlot(false);
    }
  };

  const handleToggleBooked = async (slot: Slot) => {
    if (!selectedDoctorId) {
      return;
    }

    setSavingSlot(true);
    try {
      if (slot.booked) {
        await cancelDoctorSlotBooking(selectedDoctorId, slot.id);
      } else {
        await bookDoctorSlot(selectedDoctorId, slot.id);
      }
      await refreshSlots();
      setError('');
    } catch {
      setError('Khong the cap nhat trang thai dat lich cho slot da chon.');
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!selectedDoctorId) {
      return;
    }

    setSavingSlot(true);
    try {
      await deleteDoctorSlot(selectedDoctorId, slotId);
      await refreshSlots();
      setError('');
    } catch {
      setError('Khong the xoa slot da chon.');
    } finally {
      setSavingSlot(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-700 font-sans flex flex-col w-full antialiased">
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
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-white border border-red-200 hover:bg-red-500 hover:border-red-500 px-4 py-2.5 rounded-xl transition-all bg-white shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-8 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2.5 mb-5">
              <UserRound className="w-5 h-5 text-[#007BFF]" />
              Danh sách bệnh nhân khám hôm nay
            </h2>

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

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => setActivePatient(patient)}
                  className={`border rounded-2xl p-4 transition-all duration-350 cursor-pointer ${
                    activePatient?.id === patient.id
                      ? 'bg-[#E6F7FF]/35 border-[#007BFF] shadow-sm'
                      : 'bg-white border-slate-100 hover:border-slate-250 shadow-premium'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{patient.name}</h4>
                      <p className="text-[10.5px] text-slate-450 mt-1 font-semibold">Tuổi: {patient.age} • Giới tính: {patient.gender}</p>
                      <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#007BFF]" />
                        <span>Giờ hẹn: {patient.time}</span>
                        <span className="font-mono text-[#007BFF] font-extrabold ml-2">{patient.ticket}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                      patient.status === 'Đã xong'
                        ? 'bg-slate-100 text-slate-500'
                        : patient.status === 'Đang khám'
                          ? 'bg-[#E6F7FF] text-[#007BFF]'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}
                    >
                      {patient.status}
                    </span>
                  </div>

                  {activePatient?.id === patient.id && (
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                      {patient.status === 'Chờ khám' && (
                        <button
                          onClick={() => updateStatus(patient.id, 'Đang khám')}
                          className="bg-[#007BFF] hover:bg-[#0056b3] text-white font-bold text-[10.5px] py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-sm shadow-[#007BFF]/10"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          Bắt đầu khám
                        </button>
                      )}
                      {patient.status === 'Đang khám' && (
                        <button
                          onClick={() => updateStatus(patient.id, 'Đã xong')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10.5px] py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Hoàn thành khám
                        </button>
                      )}
                      <button
                        onClick={() => alert(`Xem hồ sơ bệnh án của ${patient.name}`)}
                        className="bg-white border border-slate-200 hover:border-slate-350 text-slate-700 font-bold text-[10.5px] py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
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

          {activePatient && (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-premium space-y-3">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <h3 className="text-xs font-extrabold text-[#007BFF] uppercase tracking-wider">Lý do & Triệu chứng khám</h3>
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

        <section className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-7 shadow-premium space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-[#007BFF]" />
                Quản lý lịch làm việc bác sĩ
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">Màn này đang đọc và ghi trực tiếp vào doctor-service.</p>
            </div>
            <button
              onClick={refreshSlots}
              disabled={!selectedDoctorId || loadingSlots}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCcw className="w-4 h-4" />
              Tải lại lịch
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs font-bold text-slate-500">
              Bác sĩ
              <select
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                value={selectedDoctorId}
                onChange={(event) => setSelectedDoctorId(event.target.value)}
                disabled={loadingDoctors || !doctors.length}
              >
                {doctors.length ? (
                  doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))
                ) : (
                  <option value="">Chưa có bác sĩ từ backend</option>
                )}
              </select>
            </label>

            <div className="rounded-2xl border border-slate-100 bg-[#F8F9FA] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bác sĩ đang xem</p>
              <p className="mt-2 text-sm font-bold text-slate-800">{selectedDoctor?.name ?? 'Chưa chọn bác sĩ'}</p>
              <p className="text-xs text-slate-500">{selectedDoctor?.specialization ?? 'Doctor-service chưa trả dữ liệu'}</p>
            </div>
          </div>

          <form className="grid gap-4 rounded-2xl border border-slate-100 bg-[#F8F9FA] p-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleAddSlot}>
            <label className="flex flex-col gap-2 text-xs font-bold text-slate-500">
              Giờ bắt đầu
              <input
                type="datetime-local"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                value={slotForm.startTime}
                onChange={(event) => {
                  const startTime = event.target.value;
                  setSlotForm({
                    startTime,
                    endTime: buildDefaultEndTime(startTime),
                  });
                }}
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-bold text-slate-500">
              Giờ kết thúc
              <input
                type="datetime-local"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                value={slotForm.endTime}
                onChange={(event) => setSlotForm((current) => ({ ...current, endTime: event.target.value }))}
              />
            </label>
            <button
              type="submit"
              disabled={!selectedDoctorId || savingSlot}
              className="rounded-xl bg-[#007BFF] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Thêm slot
            </button>
          </form>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : null}

          <div className="space-y-3">
            {loadingSlots ? (
              <div className="rounded-2xl border border-slate-100 bg-[#F8F9FA] px-4 py-8 text-center text-sm text-slate-500">
                Dang tai lich lam viec tu doctor-service...
              </div>
            ) : !slots.length ? (
              <div className="rounded-2xl border border-slate-100 bg-[#F8F9FA] px-4 py-8 text-center text-sm text-slate-500">
                Chua co slot nao cho bac si nay. Ban co the tao ngay o form phia tren.
              </div>
            ) : (
              slots
                .slice()
                .sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime())
                .map((slot) => (
                  <article key={slot.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-premium md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{formatSlotTime(slot.startTime)}</p>
                      <p className="mt-1 text-xs text-slate-500">Kết thúc: {formatSlotTime(slot.endTime)}</p>
                      <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                        slot.booked ? 'bg-[#E6F7FF] text-[#007BFF]' : 'bg-emerald-50 text-emerald-600'
                      }`}
                      >
                        {slot.booked ? 'Đã đặt' : 'Còn trống'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleBooked(slot)}
                        disabled={savingSlot}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {slot.booked ? 'Hủy đặt' : 'Đánh dấu đã đặt'}
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        disabled={savingSlot}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa slot
                      </button>
                    </div>
                  </article>
                ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DoctorDashboard;
