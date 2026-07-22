import { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarRange, LogOut, Search, ShieldCheck, Stethoscope, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '@/constants/appRoutes';
import { fetchDoctorSlots, fetchDoctors, fetchDoctorSpecializations, mapDoctorToCard } from '@/features/doctors/services/doctorApi';
import type { Doctor, DoctorCardViewModel, Slot } from '@/features/doctors/types/doctor';
import { useAuthStore } from '@/stores/auth.store';

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const buildSlotSummary = (slots: Slot[]) => {
  const summary = {
    total: slots.length,
    available: 0,
    booked: 0,
    reserved: 0,
    blocked: 0,
  };

  slots.forEach((slot) => {
    const status = slot.status || (slot.booked ? 'BOOKED' : 'AVAILABLE');
    if (status === 'AVAILABLE') summary.available += 1;
    if (status === 'BOOKED') summary.booked += 1;
    if (status === 'RESERVED') summary.reserved += 1;
    if (status === 'BLOCKED') summary.blocked += 1;
  });

  return summary;
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDoctorSlots, setSelectedDoctorSlots] = useState<Slot[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [error, setError] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const loadDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const [doctorData, specializationData] = await Promise.all([
        fetchDoctors(),
        fetchDoctorSpecializations(),
      ]);
      setDoctors(doctorData);
      setSpecializations(specializationData);
      setSelectedDoctorId((current) => current || doctorData[0]?.id || '');
      setError('');
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message || 'Không thể tải dữ liệu quản trị bác sĩ.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const loadSlots = async (doctorId: string) => {
    if (!doctorId) {
      setSelectedDoctorSlots([]);
      return;
    }
    setLoadingSlots(true);
    try {
      const slots = await fetchDoctorSlots(doctorId, {
        fromDate: today,
      });
      setSelectedDoctorSlots(slots);
      setError('');
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message || 'Không thể tải lịch bác sĩ đã chọn.');
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    void loadDoctors();
  }, []);

  useEffect(() => {
    void loadSlots(selectedDoctorId);
  }, [selectedDoctorId]);

  const filteredDoctors = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesKeyword =
        !keyword ||
        [doctor.name, doctor.specialization, doctor.email, doctor.phoneNumber]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(keyword));

      const matchesSpecialization = !specializationFilter || doctor.specialization === specializationFilter;

      return matchesKeyword && matchesSpecialization;
    });
  }, [doctors, searchTerm, specializationFilter]);

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === selectedDoctorId) || null,
    [doctors, selectedDoctorId],
  );

  const selectedDoctorCard = useMemo<DoctorCardViewModel | null>(
    () => (selectedDoctor ? mapDoctorToCard(selectedDoctor) : null),
    [selectedDoctor],
  );

  const activeDoctors = doctors.filter((doctor) => doctor.active).length;
  const slotSummary = useMemo(() => buildSlotSummary(selectedDoctorSlots), [selectedDoctorSlots]);

  const handleLogout = async () => {
    await logout();
    navigate(APP_ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fff7ed_0%,_#fff_22%,_#f8fafc_100%)] text-slate-800">
      <header className="sticky top-0 z-40 border-b border-white/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-500">Admin Console</p>
              <h1 className="text-2xl font-black tracking-tight">Quản trị dữ liệu bác sĩ</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void loadDoctors()}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Làm mới dữ liệu
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:px-8">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <UsersRound className="h-5 w-5" />
            </div>
            <p className="text-3xl font-black">{doctors.length}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">Tổng bác sĩ</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Activity className="h-5 w-5" />
            </div>
            <p className="text-3xl font-black">{activeDoctors}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">Đang hoạt động</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Stethoscope className="h-5 w-5" />
            </div>
            <p className="text-3xl font-black">{specializations.length}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">Chuyên khoa</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <CalendarRange className="h-5 w-5" />
            </div>
            <p className="text-3xl font-black">{slotSummary.total}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">Slot tương lai của bác sĩ đang xem</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Directory</p>
                <h2 className="mt-2 text-xl font-black">Danh sách bác sĩ từ backend</h2>
              </div>
            </div>

            <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm"
                  placeholder="Tìm theo tên, email, số điện thoại"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>
              <select
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                value={specializationFilter}
                onChange={(event) => setSpecializationFilter(event.target.value)}
              >
                <option value="">Tất cả chuyên khoa</option>
                {specializations.map((specialization) => (
                  <option key={specialization} value={specialization}>
                    {specialization}
                  </option>
                ))}
              </select>
            </div>

            {loadingDoctors ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">Đang tải danh sách bác sĩ...</div>
            ) : filteredDoctors.length ? (
              <div className="grid gap-3">
                {filteredDoctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => setSelectedDoctorId(doctor.id)}
                    className={`grid gap-2 rounded-2xl border p-4 text-left transition ${
                      selectedDoctorId === doctor.id ? 'border-orange-300 bg-orange-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-black text-slate-800">{doctor.name}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{doctor.specialization}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${doctor.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {doctor.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="grid gap-1 text-sm text-slate-500">
                      <span>{doctor.email}</span>
                      <span>{doctor.phoneNumber}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">Không có bác sĩ phù hợp bộ lọc hiện tại.</div>
            )}
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Inspector</p>
                <h2 className="mt-2 text-xl font-black">Lịch và trạng thái bác sĩ đang chọn</h2>
              </div>
            </div>

            {selectedDoctorCard ? (
              <div className="grid gap-5">
                <div className="flex items-center gap-4 rounded-3xl bg-slate-950 px-5 py-5 text-white">
                  <img
                    src={selectedDoctorCard.image}
                    alt={selectedDoctorCard.name}
                    className="h-18 w-18 rounded-2xl object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-black">{selectedDoctorCard.name}</h3>
                    <p className="text-sm font-semibold text-orange-200">{selectedDoctorCard.specialty}</p>
                    <p className="mt-1 text-xs text-slate-300">{selectedDoctor?.email}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Available', value: slotSummary.available },
                    { label: 'Booked', value: slotSummary.booked },
                    { label: 'Reserved', value: slotSummary.reserved },
                    { label: 'Blocked', value: slotSummary.blocked },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                      <p className="text-2xl font-black">{item.value}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                    </div>
                  ))}
                </div>

                {loadingSlots ? (
                  <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">Đang tải slot tương lai...</div>
                ) : selectedDoctorSlots.length ? (
                  <div className="grid gap-3">
                    {selectedDoctorSlots.slice(0, 12).map((slot) => (
                      <article key={slot.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-black text-slate-800">{formatDateTime(slot.startTime)}</p>
                            <p className="mt-1 text-xs text-slate-500">Kết thúc: {formatDateTime(slot.endTime)}</p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
                            {slot.status || (slot.booked ? 'BOOKED' : 'AVAILABLE')}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">Bác sĩ này chưa có slot tương lai.</div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">Chọn một bác sĩ để xem chi tiết lịch.</div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
};

export default AdminPanel;
