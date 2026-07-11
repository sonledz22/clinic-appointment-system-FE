import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Calendar, CheckCircle, Clock, FileText, LogOut, RefreshCcw, Trash2, UserRound, Edit, Award, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '@/constants/appRoutes';
import { doLogout, getUserInfo, isAuthenticated as isKeycloakAuthenticated, isKeycloakInitialized, waitForKeycloakReady } from '@/services/keycloak';
import {
  addDoctorSlot,
  generateDoctorSlots,
  reserveDoctorSlot,
  releaseDoctorSlot,
  bookDoctorSlot,
  cancelDoctorSlotBooking,
  deleteDoctorSlot,
  fetchDoctors,
  fetchDoctorSlots,
  fetchMyProfile,
  updateMyProfile,
} from '@/features/doctors/services/doctorApi';
import type { Doctor, Slot } from '@/features/doctors/types/doctor';
import { useAuthStore } from '@/stores/auth.store';

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
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [authReady, setAuthReady] = useState(() => Boolean(user) || (isKeycloakInitialized() && isKeycloakAuthenticated()));
  const [userInfo, setUserInfo] = useState(() => {
    const keycloakUser = getUserInfo();
    return {
      id: user?.userId ?? user?.id ?? keycloakUser.id,
      name: user?.email ?? keycloakUser.name,
    };
  });
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);

  // Profile states
  const [profile, setProfile] = useState<Doctor | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    specialization: '',
    phoneNumber: '',
    email: '',
    biography: '',
    qualifications: '',
    avatarUrl: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const loadProfile = async () => {
    setLoadingProfile(true);
    setProfileError('');
    try {
      const data = await fetchMyProfile();
      setProfile(data);
      setProfileForm({
        name: data.name || '',
        specialization: data.specialization || '',
        phoneNumber: data.phoneNumber || '',
        email: data.email || '',
        biography: data.biography || '',
        qualifications: data.qualifications || '',
        avatarUrl: data.avatarUrl || ''
      });
    } catch (err: any) {
      console.error(err);
      setProfileError('Không thể tải thông tin trang cá nhân bác sĩ.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError('');
    try {
      const updated = await updateMyProfile(profileForm);
      setProfile(updated);
      setIsEditingProfile(false);
      
      // Update doctors list so selector and header are updated
      setDoctors(prev => prev.map(d => d.id === updated.id ? { ...d, ...updated } : d));
    } catch (err: any) {
      console.error(err);
      setProfileError(err.response?.data?.message || 'Cập nhật trang cá nhân thất bại.');
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const syncAuthState = async () => {
      try {
        await waitForKeycloakReady();
        if (!mounted) {
          return;
        }

        if (user) {
          setUserInfo({
            id: user.userId ?? user.id ?? '',
            name: user.email ?? '',
          });
          setAuthReady(true);
          return;
        }

        if (isKeycloakAuthenticated()) {
          const keycloakUser = getUserInfo();
          setUserInfo({
            id: keycloakUser.id,
            name: keycloakUser.name || keycloakUser.email || '',
          });
          setAuthReady(true);
          return;
        }

        setAuthReady(false);
        setProfileError('Phiên đăng nhập chưa sẵn sàng.');
      } catch (error) {
        console.error(error);
        if (mounted) {
          setAuthReady(false);
          setProfileError('Không thể khởi tạo phiên đăng nhập.');
        }
      }
    };

    syncAuthState();

    return () => {
      mounted = false;
    };
  }, [user]);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [savingSlot, setSavingSlot] = useState(false);
  const [error, setError] = useState('');
  const [formMode, setFormMode] = useState<'manual' | 'auto'>('manual');
  const [duration, setDuration] = useState(30);
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
    if (!authReady) {
      return;
    }

    loadProfile();
  }, [authReady]);

  useEffect(() => {
    if (!authReady || !userInfo.id) {
      setLoadingDoctors(false);
      return;
    }

    let mounted = true;

    const loadDoctors = async () => {
      setLoadingDoctors(true);
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
  }, [authReady, userInfo.id]);

  useEffect(() => {
    if (!authReady || !selectedDoctorId) {
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
  }, [authReady, selectedDoctorId]);

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

  const handleGenerateSlots = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDoctorId || !slotForm.startTime || !slotForm.endTime) {
      setError('Cần chọn bác sĩ và nhập đầy đủ giờ bắt đầu, giờ kết thúc.');
      return;
    }

    setSavingSlot(true);
    try {
      await generateDoctorSlots(selectedDoctorId, slotForm.startTime, slotForm.endTime, duration);
      await refreshSlots();
      setError('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tự động sinh các slot. Vui lòng kiểm tra lại thời gian.');
    } finally {
      setSavingSlot(false);
    }
  };

  const handleReserveSlot = async (slot: Slot) => {
    if (!selectedDoctorId) {
      return;
    }
    setSavingSlot(true);
    try {
      await reserveDoctorSlot(selectedDoctorId, slot.id);
      await refreshSlots();
      setError('');
    } catch {
      setError('Không thể tạm giữ chỗ cho slot đã chọn.');
    } finally {
      setSavingSlot(false);
    }
  };

  const handleReleaseSlot = async (slot: Slot) => {
    if (!selectedDoctorId) {
      return;
    }
    setSavingSlot(true);
    try {
      await releaseDoctorSlot(selectedDoctorId, slot.id);
      await refreshSlots();
      setError('');
    } catch {
      setError('Không thể giải phóng slot đã chọn.');
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

  const getSlotStatusText = (slot: Slot) => {
    const status = slot.status || (slot.booked ? 'BOOKED' : 'AVAILABLE');
    switch (status) {
      case 'BOOKED': return 'Đã đặt';
      case 'RESERVED': return 'Đang giữ chỗ';
      case 'BLOCKED': return 'Bị khóa';
      default: return 'Còn trống';
    }
  };

  const getSlotStatusClass = (slot: Slot) => {
    const status = slot.status || (slot.booked ? 'BOOKED' : 'AVAILABLE');
    switch (status) {
      case 'BOOKED': return 'bg-[#E6F7FF] text-[#007BFF] border border-[#007BFF]/20';
      case 'RESERVED': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'BLOCKED': return 'bg-red-50 text-red-650 border border-red-150';
      default: return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    }
  };

  const handleLogout = async () => {
    if (user) {
      await logout();
      navigate(APP_ROUTES.LOGIN, { replace: true });
      return;
    }

    doLogout();
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
              onClick={handleLogout}
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

          {/* Hồ sơ cá nhân Bác sĩ */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2.5">
                <UserRound className="w-5 h-5 text-[#007BFF]" />
                Hồ sơ cá nhân bác sĩ
              </h2>
              {!isEditingProfile && profile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-1 text-xs font-bold text-[#007BFF] hover:bg-[#007BFF]/5 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa</span>
                </button>
              )}
            </div>

            {profileError && (
              <div className="bg-red-50 text-red-650 text-xs p-3.5 rounded-xl border border-red-100 font-semibold">
                {profileError}
              </div>
            )}

            {loadingProfile ? (
              <div className="text-center py-6 text-xs text-slate-400 font-medium">
                Đang tải thông tin cá nhân...
              </div>
            ) : isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-bold text-slate-500">
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5">
                    Họ và tên *
                    <input
                      type="text"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-700 font-semibold"
                      value={profileForm.name}
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    Chuyên khoa *
                    <input
                      type="text"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-700 font-semibold"
                      value={profileForm.specialization}
                      onChange={e => setProfileForm({ ...profileForm, specialization: e.target.value })}
                      required
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5">
                    Số điện thoại *
                    <input
                      type="text"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-700 font-semibold"
                      value={profileForm.phoneNumber}
                      onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    Email *
                    <input
                      type="email"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-700 font-semibold"
                      value={profileForm.email}
                      onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                      required
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  Ảnh đại diện (URL)
                  <input
                    type="text"
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-700 font-semibold"
                    placeholder="https://example.com/avatar.jpg"
                    value={profileForm.avatarUrl}
                    onChange={e => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  Bằng cấp & Trình độ
                  <input
                    type="text"
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-700 font-semibold"
                    placeholder="Ví dụ: Thạc sĩ - Bác sĩ nội trú"
                    value={profileForm.qualifications}
                    onChange={e => setProfileForm({ ...profileForm, qualifications: e.target.value })}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  Tiểu sử cá nhân
                  <textarea
                    rows={3}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-700 font-semibold leading-relaxed"
                    placeholder="Giới thiệu kinh nghiệm làm việc, thế mạnh lâm sàng..."
                    value={profileForm.biography}
                    onChange={e => setProfileForm({ ...profileForm, biography: e.target.value })}
                  />
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileError('');
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all font-bold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-4 py-2 bg-[#007BFF] text-white rounded-xl hover:bg-[#0056b3] transition-all font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {savingProfile ? 'Đang lưu...' : 'Lưu hồ sơ'}
                  </button>
                </div>
              </form>
            ) : profile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={profile.avatarUrl || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150'}
                    alt={profile.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{profile.name}</h3>
                    <p className="text-xs text-[#007BFF] font-bold mt-0.5">{profile.specialization}</p>
                    {profile.qualifications && (
                      <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {profile.qualifications}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-50 pt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Số điện thoại</span>
                    <span className="text-slate-700 font-bold mt-0.5 block">{profile.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Email liên hệ</span>
                    <span className="text-slate-700 font-bold mt-0.5 block break-all">{profile.email}</span>
                  </div>
                </div>

                {profile.biography && (
                  <div className="border-t border-slate-50 pt-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      Tiểu sử & Kinh nghiệm
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold mt-1.5 bg-[#F8F9FA] p-3 rounded-xl border border-slate-205/40">
                      {profile.biography}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-400 font-medium">
                Chưa có thông tin cá nhân.
              </div>
            )}
          </div>
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

          {/* Form Mode Selector */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setFormMode('manual')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                formMode === 'manual' ? 'bg-white text-[#007BFF] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Thêm thủ công
            </button>
            <button
              type="button"
              onClick={() => setFormMode('auto')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                formMode === 'auto' ? 'bg-white text-[#007BFF] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tự động sinh slots
            </button>
          </div>

          {formMode === 'manual' ? (
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
                className="rounded-xl bg-[#007BFF] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                Thêm slot
              </button>
            </form>
          ) : (
            <form className="grid gap-4 rounded-2xl border border-slate-100 bg-[#F8F9FA] p-4 md:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={handleGenerateSlots}>
              <label className="flex flex-col gap-2 text-xs font-bold text-slate-500">
                Giờ bắt đầu ca
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
                Giờ kết thúc ca
                <input
                  type="datetime-local"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                  value={slotForm.endTime}
                  onChange={(event) => setSlotForm((current) => ({ ...current, endTime: event.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-bold text-slate-500">
                Thời lượng slot
                <select
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                  value={duration}
                  onChange={(event) => setDuration(Number(event.target.value))}
                >
                  <option value="15">15 phút</option>
                  <option value="30">30 phút</option>
                  <option value="45">45 phút</option>
                  <option value="60">60 phút</option>
                </select>
              </label>
              <button
                type="submit"
                disabled={!selectedDoctorId || savingSlot}
                className="rounded-xl bg-[#007BFF] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                Sinh tự động
              </button>
            </form>
          )}

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
                      <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${getSlotStatusClass(slot)}`}>
                        {getSlotStatusText(slot)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {/* Booking/Unbooking Actions */}
                      {slot.status !== 'BOOKED' && slot.status !== 'RESERVED' && !slot.booked ? (
                        <button
                          onClick={() => handleToggleBooked(slot)}
                          disabled={savingSlot}
                          className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        >
                          Đánh dấu đã đặt
                        </button>
                      ) : (slot.status === 'BOOKED' || slot.booked) ? (
                        <button
                          onClick={() => handleToggleBooked(slot)}
                          disabled={savingSlot}
                          className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        >
                          Hủy đặt
                        </button>
                      ) : null}

                      {/* Reservation Actions */}
                      {(slot.status === 'AVAILABLE' || (!slot.status && !slot.booked)) ? (
                        <button
                          onClick={() => handleReserveSlot(slot)}
                          disabled={savingSlot}
                          className="rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer"
                        >
                          Giữ chỗ
                        </button>
                      ) : slot.status === 'RESERVED' ? (
                        <button
                          onClick={() => handleReleaseSlot(slot)}
                          disabled={savingSlot}
                          className="rounded-xl bg-slate-500 hover:bg-slate-600 px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer"
                        >
                          Giải phóng
                        </button>
                      ) : null}

                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        disabled={savingSlot}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 hover:bg-red-50 px-4 py-2 text-xs font-bold text-red-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer"
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
