import React, { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import {
  addDoctorSlot,
  cancelDoctorAppointment,
  checkInDoctorAppointment,
  confirmDoctorAppointment,
  checkoutDoctorAppointment,
  deleteDoctorSlot,
  fetchDoctorAppointmentContext,
  fetchDoctorAppointments,
  fetchMyProfile,
  fetchMySlots,
  fetchDoctorSlotConsultationContext,
  generateMyRecurringSlots,
  markDoctorAppointmentNotCheckIn,
  updateMyProfile,
} from '@/features/doctors/services/doctorApi';
import type {
  Doctor,
  DoctorAppointmentContext,
  DoctorCheckoutPayload,
  DoctorScheduleAppointment,
  Slot,
  SlotFilters,
  WeeklyPatternItem,
} from '@/features/doctors/types/doctor';
import { useAuthStore } from '@/stores/auth.store';

type DoctorTab = 'profile' | 'schedule' | 'recurring' | 'manual_slot' | 'consultation';

const renderVietnameseStatusTag = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return <Tag value="Trống" severity="success" className="rounded font-semibold text-[11px] px-2 py-0.5" />;
    case 'EXPIRED':
    case 'PAST':
      return <Tag value="Đã quá hạn" severity="secondary" className="rounded font-semibold text-[11px] px-2 py-0.5 bg-slate-200 text-slate-600 border-none" />;
    case 'EXPIRED_PENDING':
      return <Tag value="Quá hạn xác nhận" severity="danger" className="rounded font-semibold text-[11px] px-2 py-0.5 bg-rose-100 text-rose-700 border-none" />;
    case 'CONFIRMED':
      return <Tag value="Đã xác nhận" severity="info" className="rounded font-semibold text-[11px] px-2 py-0.5" />;
    case 'PENDING_DOCTOR_CONFIRMATION':
    case 'BOOKED':
    case 'PENDING':
    case 'PENDING_PAYMENT':
      return <Tag value="Chờ xác nhận" severity="warning" className="rounded font-semibold text-[11px] px-2 py-0.5" />;
    case 'CANCELLED_BY_DOCTOR':
      return <Tag value="Bác sĩ đã hủy" severity="danger" className="rounded font-semibold text-[11px] px-2 py-0.5" />;
    case 'CANCELLED':
      return <Tag value="Đã hủy" severity="danger" className="rounded font-semibold text-[11px] px-2 py-0.5" />;
    case 'NOT_CHECKIN':
      return <Tag value="Vắng mặt" severity="warning" className="rounded font-semibold text-[11px] px-2 py-0.5 bg-amber-100 text-amber-800 border-none" />;
    case 'CHECKIN_SUCCESS':
      return <Tag value="Đang khám" severity="info" className="rounded font-semibold text-[11px] px-2 py-0.5 bg-cyan-500 border-none text-white" />;
    case 'CHECKOUT_SUCCESS':
      return <Tag value="Hoàn thành" severity="success" className="rounded font-semibold text-[11px] px-2 py-0.5 bg-slate-600 border-none text-white" />;
    default:
      return <Tag value={status} severity="info" className="rounded font-semibold text-[11px] px-2 py-0.5" />;
  }
};

const weekdayLabels: Array<{ value: WeeklyPatternItem['dayOfWeek']; label: string }> = [
  { value: 'MONDAY', label: 'Thứ hai' },
  { value: 'TUESDAY', label: 'Thứ ba' },
  { value: 'WEDNESDAY', label: 'Thứ tư' },
  { value: 'THURSDAY', label: 'Thứ năm' },
  { value: 'FRIDAY', label: 'Thứ sáu' },
  { value: 'SATURDAY', label: 'Thứ bảy' },
  { value: 'SUNDAY', label: 'Chủ nhật' },
];

const weekdayDefaults = weekdayLabels.map<WeeklyPatternItem & { active: boolean }>((item, index) => ({
  dayOfWeek: item.value,
  workStartTime: '08:00:00',
  workEndTime: '17:00:00',
  breakStartTime: '12:00:00',
  breakEndTime: '13:00:00',
  active: index < 5,
}));

const CALENDAR_START_HOUR = 7;
const CALENDAR_END_HOUR = 21;
const HOUR_HEIGHT = 72;

const padDatePart = (value: number) => String(value).padStart(2, '0');

const toDateInput = (date: Date) =>
  date.getFullYear() + '-' + padDatePart(date.getMonth() + 1) + '-' + padDatePart(date.getDate());

const toDateTimeLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  const hours = padDatePart(date.getHours());
  const minutes = padDatePart(date.getMinutes());
  return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const startOfWeek = (date: Date) => {
  const cloned = new Date(date);
  const day = cloned.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  cloned.setDate(cloned.getDate() + diff);
  cloned.setHours(0, 0, 0, 0);
  return cloned;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : 'Chưa cập nhật';

const formatTimeRange = (startTime: string, endTime: string) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const formatter = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
};

const formatShortTime = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));

const formatSlotDateTitle = (date: Date) =>
  date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });

const isWithinAppointmentWindow = (startTime: string, endTime: string, now: Date = new Date()) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return now >= start && now <= end;
};

const isWithinCheckInWindow = (startTime: string, now: Date = new Date()) => {
  const start = new Date(startTime);
  const deadline = new Date(start.getTime() + 10 * 60 * 1000);
  return now >= start && now <= deadline;
};

const roundToNextHalfHour = (date: Date) => {
  const next = new Date(date);
  next.setSeconds(0, 0);
  const minutes = next.getMinutes();
  const delta = minutes === 0 || minutes === 30 ? 30 : minutes < 30 ? 30 - minutes : 60 - minutes;
  next.setMinutes(minutes + delta);
  return next;
};

const isBeforeDoctorCancelDeadline = (startTime: string, now: Date = new Date()) => {
  const start = new Date(startTime);
  const cancelDeadline = new Date(start.getTime() - 5 * 60 * 60 * 1000);
  return now <= cancelDeadline;
};

const isPendingDoctorConfirmationStatus = (status?: string | null) => {
  if (!status) return false;
  const s = status.trim().toUpperCase();
  return s === 'PENDING_DOCTOR_CONFIRMATION' || s === 'BOOKED' || s === 'PENDING' || s === 'PENDING_PAYMENT';
};

const canCheckInAppointment = (context: DoctorAppointmentContext, now: Date = new Date()) =>
  context.appointmentStatus === 'CONFIRMED'
  && isWithinAppointmentWindow(context.startTime, context.endTime, now)
  && isWithinCheckInWindow(context.startTime, now);

const canMarkNotCheckInAppointment = (context: DoctorAppointmentContext, now: Date = new Date()) =>
  context.appointmentStatus === 'CONFIRMED' && now >= new Date(context.startTime);

const canCancelAppointmentByDoctor = (context: DoctorAppointmentContext, now: Date = new Date()) =>
  (context.appointmentStatus === 'CONFIRMED' || isPendingDoctorConfirmationStatus(context.appointmentStatus))
  && isBeforeDoctorCancelDeadline(context.startTime, now);

const canConfirmAppointmentByDoctor = (context: DoctorAppointmentContext) =>
  isPendingDoctorConfirmationStatus(context.appointmentStatus);

const getCancelAvailabilityMessage = (context: DoctorAppointmentContext, now: Date = new Date()) => {
  if (context.appointmentStatus === 'CANCELLED_BY_DOCTOR') {
    return 'Lịch hẹn này đã được bác sĩ hủy trước đó.';
  }

  if (context.appointmentStatus !== 'CONFIRMED' && !isPendingDoctorConfirmationStatus(context.appointmentStatus)) {
    return 'Chỉ có thể hủy lịch khi lịch hẹn ở trạng thái đã xác nhận.';
  }

  const start = new Date(context.startTime);
  const cancelDeadline = new Date(start.getTime() - 5 * 60 * 60 * 1000);

  if (now > cancelDeadline) {
    return 'Đã quá hạn hủy. Bác sĩ chỉ được hủy trước ' + cancelDeadline.toLocaleString('vi-VN') + '.';
  }

  return null;
};

const getCheckInAvailabilityMessage = (context: DoctorAppointmentContext, now: Date = new Date()) => {
  if (context.appointmentStatus === 'CHECKIN_SUCCESS') {
    return 'Phiên khám đã được bắt đầu.';
  }

  if (isPendingDoctorConfirmationStatus(context.appointmentStatus)) {
    return 'Lịch hẹn này đang chờ bác sĩ xác nhận. Hãy bấm "Xác nhận lịch" trước khi bắt đầu khám.';
  }

  if (context.appointmentStatus !== 'CONFIRMED') {
    return 'Chỉ có thể bắt đầu khám khi lịch hẹn đang ở trạng thái CONFIRMED.';
  }

  const start = new Date(context.startTime);
  const deadline = new Date(start.getTime() + 10 * 60 * 1000);

  if (now < start) {
    return 'Chưa đến giờ khám. Bác sĩ chỉ có thể bắt đầu khám từ ' + formatDateTime(context.startTime) + '.';
  }

  if (now > deadline) {
    return 'Đã quá 10 phút đầu kể từ giờ khám. Hệ thống chỉ cho phép bắt đầu khám trước ' + deadline.toLocaleString('vi-VN') + '.';
  }

  return null;
};

const getDoctorActionErrorMessage = (action: 'confirm' | 'checkin' | 'not-checkin' | 'cancel' | 'checkout', error: any) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (message) {
    return message;
  }

  if (action === 'checkin' && status === 409) {
    return 'Chỉ có thể bắt đầu khám khi lịch hẹn đang ở trạng thái CONFIRMED và nằm trong đúng khung giờ khám.';
  }

  if (action === 'confirm' && status === 409) {
    return 'Chỉ có thể xác nhận các lịch hẹn đang ở trạng thái chờ bác sĩ xác nhận.';
  }

  if (action === 'cancel' && status === 409) {
    return 'Chỉ có thể hủy lịch khi còn ít nhất 5 tiếng trước giờ khám.';
  }

  return 'Không thể thực hiện thao tác phiên khám.';
};

const getStatusSeverity = (status?: string) => {
  if (status === 'BOOKED' || status === 'CANCELLED_BY_DOCTOR' || status === 'NOT_CHECKIN') return 'danger';
  if (status === 'AVAILABLE' || status === 'CHECKOUT_SUCCESS' || status === 'CONFIRMED') return 'success';
  if (status === 'CHECKIN_SUCCESS') return 'info';
  if (status === 'PENDING_DOCTOR_CONFIRMATION') return 'warning';
  return 'warning';
};

const updateLocalStorageAppointmentStatus = (
  appointmentId: string,
  slotId: string,
  newStatus: string,
  cancelReason?: string
) => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('patient_appointments')) {
        const existingAppts = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = existingAppts.map((item: any) =>
          item.appointmentId === appointmentId || item.id === appointmentId || item.slotId === slotId
            ? { ...item, status: newStatus, ...(cancelReason ? { cancelReason } : {}) }
            : item
        );
        localStorage.setItem(key, JSON.stringify(updated));
      }
    }
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    // ignore
  }
};

const buildWeekDays = (fromDate: string) => {
  const start = startOfWeek(new Date(fromDate));
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
};

const DoctorDashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const today = new Date();
  const currentWeekStart = startOfWeek(today);

  const [activeTab, setActiveTab] = useState<DoctorTab>('profile');
  const [loading, setLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [consultationLoading, setConsultationLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profile, setProfile] = useState<Doctor | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    specialization: '',
    phoneNumber: '',
    email: '',
    biography: '',
    qualifications: '',
    avatarUrl: '',
  });

  const [slotFilters, setSlotFilters] = useState<SlotFilters>({
    fromDate: toDateInput(currentWeekStart),
    toDate: toDateInput(addDays(currentWeekStart, 6)),
    status: undefined,
  });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [appointments, setAppointments] = useState<DoctorScheduleAppointment[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [manualSlotForm, setManualSlotForm] = useState(() => {
    const start = new Date();
    start.setHours(start.getHours() + 1, 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);
    return {
      startTime: toDateTimeLocal(start),
      endTime: toDateTimeLocal(end),
    };
  });
  const [recurringForm, setRecurringForm] = useState({
    startDate: toDateInput(addDays(today, 1)),
    endDate: toDateInput(addDays(today, 30)),
    slotDurationMinutes: 30,
    weeklyPattern: weekdayDefaults,
  });

  const [consultationContext, setConsultationContext] = useState<DoctorAppointmentContext | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [checkoutForm, setCheckoutForm] = useState<DoctorCheckoutPayload>({
    recordDate: toDateInput(today),
    diagnosis: '',
    treatment: '',
    notes: '',
    prescriptions: [{ medicationName: '', dosage: '', frequency: '', duration: '' }],
  });

  const resetFeedback = () => {
    setSuccess('');
    setError('');
  };

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId) || null,
    [selectedSlotId, slots]
  );

  const appointmentsBySlotId = useMemo(
    () =>
      appointments.reduce<Record<string, DoctorScheduleAppointment>>((accumulator, appointment) => {
        accumulator[appointment.slotId] = appointment;
        return accumulator;
      }, {}),
    [appointments]
  );

  const weekDays = useMemo(() => buildWeekDays(slotFilters.fromDate || toDateInput(today)), [slotFilters.fromDate, today]);

  const slotsByDay = useMemo(() => {
    return weekDays.map((date) => {
      const dayKey = toDateInput(date);
      return {
        date,
        slots: slots
          .filter((slot) => slot.startTime.slice(0, 10) === dayKey)
          .sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime()),
      };
    });
  }, [slots, weekDays]);

  const slotStats = useMemo(() => {
    return slots.reduce(
      (accumulator, slot) => {
        const appointment = appointmentsBySlotId[slot.id];
        const status = appointment?.appointmentStatus || slot.status || (slot.booked ? 'BOOKED' : 'AVAILABLE');
        accumulator.total += 1;
        if (status === 'AVAILABLE') accumulator.available += 1;
        if (status === 'BOOKED' || status === 'CONFIRMED' || status === 'PENDING_DOCTOR_CONFIRMATION') accumulator.booked += 1;
        if (status === 'RESERVED') accumulator.reserved += 1;
        if (status === 'CHECKIN_SUCCESS') accumulator.inProgress += 1;
        return accumulator;
      },
      { total: 0, available: 0, booked: 0, reserved: 0, inProgress: 0 }
    );
  }, [appointmentsBySlotId, slots]);

  const loadProfile = async () => {
    setLoading(true);
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
        avatarUrl: data.avatarUrl || '',
      });
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message || 'Không thể tải hồ sơ bác sĩ.');
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleData = async (filters: SlotFilters = slotFilters) => {
    setScheduleLoading(true);
    resetFeedback();
    try {
      const [slotResult, appointmentResult] = await Promise.allSettled([
        fetchMySlots(filters),
        fetchDoctorAppointments(filters.fromDate || toDateInput(today), filters.toDate || toDateInput(today)),
      ]);

      if (slotResult.status === 'fulfilled') {
        setSlots(slotResult.value);
      } else {
        setSlots([]);
      }

      if (appointmentResult.status === 'fulfilled') {
        setAppointments(appointmentResult.value);
      } else {
        setAppointments([]);
      }

      if (slotResult.status === 'rejected') {
        throw slotResult.reason;
      }

      if (appointmentResult.status === 'rejected') {
        setError('Đã tải được slot làm việc, nhưng chưa tải được danh sách lịch hẹn để gắn bệnh nhân vào slot.');
      }
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message || 'Không thể tải lịch làm việc của bác sĩ.');
    } finally {
      setScheduleLoading(false);
    }
  };

  const loadConsultationByAppointment = async (appointmentId: string, slotId?: string, skipResetFeedback = false) => {
    if (!skipResetFeedback) {
      resetFeedback();
    }
    setConsultationLoading(true);
    try {
      const data = await fetchDoctorAppointmentContext(appointmentId);
      setConsultationContext(data);
      setSelectedSlotId(slotId || data.slotId);
      setCancelReason('');
      setCheckoutForm({
        recordDate: toDateInput(today),
        diagnosis: '',
        treatment: '',
        notes: '',
        prescriptions: [{ medicationName: '', dosage: '', frequency: '', duration: '' }],
      });
      setActiveTab('consultation');
    } catch (loadError: any) {
      setConsultationContext(null);
      setError(loadError?.response?.data?.message || 'Không thể tải thông tin phiên khám.');
    } finally {
      setConsultationLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
    void loadScheduleData();
  }, []);

  // Auto-refresh schedule & appointment data every 60 seconds
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      void loadScheduleData(slotFilters);
    }, 60000);

    return () => clearInterval(autoRefreshInterval);
  }, [slotFilters]);

  const handleProfileSave = async () => {
    resetFeedback();
    setLoading(true);
    try {
      const updated = await updateMyProfile(profileForm);
      setProfile(updated);
      setSuccess('Đã lưu thông tin hồ sơ bác sĩ.');
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || 'Không thể cập nhật hồ sơ bác sĩ.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSlotSubmit = async () => {
    if (!profile?.id) return;
    resetFeedback();
    setLoading(true);
    try {
      await addDoctorSlot(profile.id, manualSlotForm.startTime, manualSlotForm.endTime);
      setSuccess('Đã thêm slot làm việc thủ công.');
      await loadScheduleData();
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || 'Không thể thêm slot làm việc.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecurringSubmit = async () => {
    const activeWeeklyPattern = recurringForm.weeklyPattern.filter((item) => item.active);
    if (!activeWeeklyPattern.length) {
      setError('Cần chọn ít nhất một ngày làm việc để sinh lịch.');
      return;
    }

    resetFeedback();
    setLoading(true);
    try {
      await generateMyRecurringSlots({
        startDate: recurringForm.startDate,
        endDate: recurringForm.endDate,
        slotDurationMinutes: recurringForm.slotDurationMinutes,
        weeklyPattern: activeWeeklyPattern.map(({ active, ...rest }) => rest),
      });
      setSuccess('Đã sinh lịch làm việc lặp thành công.');
      await loadScheduleData();
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || 'Không thể sinh lịch lặp.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!profile?.id) return;
    resetFeedback();
    setLoading(true);
    try {
      await deleteDoctorSlot(profile.id, slotId);
      if (selectedSlotId === slotId) {
        setSelectedSlotId(null);
        setConsultationContext(null);
      }
      setSuccess('Đã xóa slot khỏi lịch làm việc.');
      await loadScheduleData();
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || 'Không thể xóa slot.');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = async (slot: Slot) => {
    setSelectedSlotId(slot.id);
    const appointment = appointmentsBySlotId[slot.id];
    if (appointment) {
      await loadConsultationByAppointment(appointment.appointmentId, slot.id);
      return;
    }

    resetFeedback();
    setConsultationLoading(true);
    try {
      const data = await fetchDoctorSlotConsultationContext(slot.id);
      setConsultationContext(data);
      setSelectedSlotId(slot.id);
      setCancelReason('');
      setCheckoutForm({
        recordDate: toDateInput(today),
        diagnosis: '',
        treatment: '',
        notes: '',
        prescriptions: [{ medicationName: '', dosage: '', frequency: '', duration: '' }],
      });
      setActiveTab('consultation');
    } catch (loadError: any) {
      setConsultationContext(null);
      setActiveTab('consultation');
      setError(loadError?.response?.data?.message || 'Slot này chưa có lịch hẹn nào để mở phiên khám.');
    } finally {
      setConsultationLoading(false);
    }
  };

  const handleDoctorAction = async (action: 'confirm' | 'checkin' | 'not-checkin' | 'cancel' | 'checkout') => {
    if (!consultationContext) {
      setError('Chưa có phiên khám nào được chọn.');
      return;
    }

    if (action === 'cancel') {
      if (!cancelReason.trim()) {
        setError('Cần nhập lý do hủy lịch của bác sĩ trước khi xác nhận.');
        return;
      }

      const cancelAvailabilityMessage = getCancelAvailabilityMessage(consultationContext);
      if (cancelAvailabilityMessage) {
        setError(cancelAvailabilityMessage);
        return;
      }

      const confirmed = window.confirm(
        'Xác nhận hủy lịch khám này?\n\nLý do hủy: ' + cancelReason.trim() + '\n\nSau khi xác nhận, backend sẽ gọi notification-service để gửi email cho bệnh nhân.'
      );
      if (!confirmed) {
        return;
      }
    }

    resetFeedback();
    setConsultationLoading(true);
    try {
      if (action === 'confirm') {
        await confirmDoctorAppointment(consultationContext.appointmentId);
        updateLocalStorageAppointmentStatus(consultationContext.appointmentId, consultationContext.slotId, 'CONFIRMED');
        setSuccess('Đã xác nhận lịch hẹn. Lịch hiện ở trạng thái CONFIRMED.');
      }
      if (action === 'checkin') {
        await checkInDoctorAppointment(consultationContext.appointmentId);
        updateLocalStorageAppointmentStatus(consultationContext.appointmentId, consultationContext.slotId, 'CHECKIN_SUCCESS');
        setSuccess('Đã xác nhận bắt đầu khám.');
      }
      if (action === 'not-checkin') {
        await markDoctorAppointmentNotCheckIn(consultationContext.appointmentId);
        updateLocalStorageAppointmentStatus(consultationContext.appointmentId, consultationContext.slotId, 'NOT_CHECKIN');
        setSuccess('Đã đánh dấu bệnh nhân không đến khám.');
      }
      if (action === 'cancel') {
        await cancelDoctorAppointment(consultationContext.appointmentId, { reason: cancelReason });
        updateLocalStorageAppointmentStatus(consultationContext.appointmentId, consultationContext.slotId, 'CANCELLED_BY_DOCTOR', cancelReason);
        setSuccess('Đã hủy lịch khám và gửi thông báo cho bệnh nhân.');
      }
      if (action === 'checkout') {
        await checkoutDoctorAppointment(consultationContext.appointmentId, checkoutForm);
        updateLocalStorageAppointmentStatus(consultationContext.appointmentId, consultationContext.slotId, 'CHECKOUT_SUCCESS');
        setSuccess('Đã hoàn tất khám và lưu hồ sơ bệnh án.');
      }

      await Promise.all([
        loadConsultationByAppointment(consultationContext.appointmentId, consultationContext.slotId, true),
        loadScheduleData(),
      ]);
    } catch (actionError: any) {
      setError(getDoctorActionErrorMessage(action, actionError));
      setConsultationLoading(false);
    }
  };

  const handleCreateNextSlot = async () => {
    if (!profile?.id || !consultationContext) {
      setError('Chưa đủ thông tin để tạo slot tiếp theo.');
      return;
    }

    resetFeedback();
    setLoading(true);
    try {
      const start = new Date(consultationContext.startTime);
      const end = new Date(consultationContext.endTime);
      const durationMs = Math.max(end.getTime() - start.getTime(), 30 * 60 * 1000);
      const candidateStart = new Date(Math.max(end.getTime(), roundToNextHalfHour(new Date()).getTime()));
      const candidateEnd = new Date(candidateStart.getTime() + durationMs);

      await addDoctorSlot(profile.id, toDateTimeLocal(candidateStart), toDateTimeLocal(candidateEnd));
      setSuccess('Đã tạo slot tiếp theo từ ' + formatTimeRange(toDateTimeLocal(candidateStart), toDateTimeLocal(candidateEnd)) + '.');
      setActiveTab('schedule');
      await loadScheduleData();
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || 'Không thể tạo slot tiếp theo.');
    } finally {
      setLoading(false);
    }
  };

  const moveWeek = (offset: number) => {
    const base = startOfWeek(new Date(slotFilters.fromDate || toDateInput(today)));
    const nextStart = addDays(base, offset * 7);
    const nextFilters = {
      ...slotFilters,
      fromDate: toDateInput(nextStart),
      toDate: toDateInput(addDays(nextStart, 6)),
    };
    setSlotFilters(nextFilters);
    void loadScheduleData(nextFilters);
  };

  const selectedAppointment = selectedSlotId ? appointmentsBySlotId[selectedSlotId] : null;
  const profileBadge = profile?.active ? 'Bác sĩ đang hoạt động' : 'Hồ sơ đang tạm ẩn';
  const canCheckInSelectedAppointment = consultationContext ? canCheckInAppointment(consultationContext) : false;
  const canMarkNotCheckInSelectedAppointment = consultationContext ? canMarkNotCheckInAppointment(consultationContext) : false;
  const canCancelSelectedAppointment = consultationContext ? canCancelAppointmentByDoctor(consultationContext) : false;
  const canConfirmSelectedAppointment = consultationContext ? canConfirmAppointmentByDoctor(consultationContext) : false;
  const canCheckoutSelectedAppointment = consultationContext?.appointmentStatus === 'CHECKIN_SUCCESS';
  const checkInAvailabilityMessage = consultationContext ? getCheckInAvailabilityMessage(consultationContext) : null;
  const cancelAvailabilityMessage = consultationContext ? getCancelAvailabilityMessage(consultationContext) : null;
  const canCreateNextSlot = consultationContext
    ? ['NOT_CHECKIN', 'CHECKOUT_SUCCESS', 'CANCELLED_BY_DOCTOR'].includes(consultationContext.appointmentStatus)
    : false;

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Hồ sơ bác sĩ"
        title="Bảng điều phối bác sĩ"
        description="Đồng bộ giao diện với hồ sơ bệnh nhân, quản lý lịch làm việc theo dạng thời khóa biểu và mở phiên khám trực tiếp từ slot."
        badge={profileBadge}
      />

      <div className="max-w-6xl mx-auto px-4 mb-8">
        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
        ) : null}
        {success ? (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{success}</div>
        ) : null}

        <div className="flex flex-wrap border-b border-gray-200 mb-6 bg-white rounded-t-xl px-2 pt-2 gap-1">
          {[
            { key: 'profile', label: 'Thông tin bác sĩ', icon: 'pi pi-user' },
            { key: 'schedule', label: 'Lịch làm việc', icon: 'pi pi-calendar' },
            { key: 'recurring', label: 'Sinh lịch lặp', icon: 'pi pi-calendar-plus' },
            { key: 'manual_slot', label: 'Tạo slot thủ công', icon: 'pi pi-plus-circle' },
            { key: 'consultation', label: 'Phiên khám', icon: 'pi pi-file-edit' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as DoctorTab)}
              className={
                'py-3 px-5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 rounded-t-lg ' +
                (activeTab === tab.key
                  ? 'border-blue-600 text-blue-600 bg-blue-50 shadow-sm'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50')
              }
            >
              <i className={tab.icon + ' text-base'} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="flex flex-col items-center text-center p-4 border border-gray-100 shadow-sm h-fit">
              <div className="flex flex-col items-center gap-3">
                <img
                  src={profileForm.avatarUrl || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200'}
                  alt={profileForm.name || 'Bác sĩ'}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 m-0">{profileForm.name || 'Chưa cập nhật tên'}</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-0">{user?.email || profileForm.email}</p>
                </div>
                <Tag value="Bác sĩ" severity="info" className="px-3 py-1 rounded" />
                <div className="w-full mt-2 text-left text-sm text-gray-600">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span>Chuyên khoa</span>
                    <strong>{profileForm.specialization || 'Chưa cập nhật'}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span>Tài khoản</span>
                    <strong>{profile?.active ? 'ACTIVE' : 'INACTIVE'}</strong>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Lịch làm việc</span>
                    <strong>{slotStats.total} slot</strong>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="col-span-2 border border-gray-100 shadow-sm p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Thông tin chuyên môn & liên hệ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs font-bold text-gray-700">Họ và tên *</label>
                  <InputText value={profileForm.name} onChange={(e) => setProfileForm((current) => ({ ...current, name: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700">Chuyên khoa *</label>
                  <InputText value={profileForm.specialization} onChange={(e) => setProfileForm((current) => ({ ...current, specialization: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700">Email *</label>
                  <InputText type="email" value={profileForm.email} onChange={(e) => setProfileForm((current) => ({ ...current, email: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700">Số điện thoại *</label>
                  <InputText value={profileForm.phoneNumber} onChange={(e) => setProfileForm((current) => ({ ...current, phoneNumber: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700">Link ảnh đại diện</label>
                  <InputText value={profileForm.avatarUrl} onChange={(e) => setProfileForm((current) => ({ ...current, avatarUrl: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs font-bold text-gray-700">Bằng cấp / chứng chỉ</label>
                  <InputText value={profileForm.qualifications} onChange={(e) => setProfileForm((current) => ({ ...current, qualifications: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs font-bold text-gray-700">Giới thiệu chuyên môn</label>
                  <InputTextarea value={profileForm.biography} onChange={(e) => setProfileForm((current) => ({ ...current, biography: e.target.value }))} rows={5} />
                </div>
              </div>
              <div className="mt-5 flex justify-end border-t pt-4">
                <Button label={loading ? 'Đang lưu...' : 'Lưu hồ sơ bác sĩ'} icon="pi pi-save" onClick={handleProfileSave} disabled={loading} />
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'manual_slot' && (
          <Card className="border border-gray-100 shadow-sm p-6 max-w-2xl mx-auto rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
              <i className="pi pi-plus-circle text-blue-600" />
              Tạo slot thủ công
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Giờ bắt đầu *</label>
                <input
                  type="datetime-local"
                  className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={manualSlotForm.startTime}
                  onChange={(event) => setManualSlotForm((current) => ({ ...current, startTime: event.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Giờ kết thúc *</label>
                <input
                  type="datetime-local"
                  className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={manualSlotForm.endTime}
                  onChange={(event) => setManualSlotForm((current) => ({ ...current, endTime: event.target.value }))}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <Button label="Hủy" outlined onClick={() => setActiveTab('schedule')} />
              <Button label="Tạo slot làm việc" icon="pi pi-plus" onClick={handleManualSlotSubmit} disabled={loading} />
            </div>
          </Card>
        )}

        {activeTab === 'recurring' && (
          <Card className="border border-gray-100 shadow-sm p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
              <i className="pi pi-calendar-plus text-blue-600" />
              Sinh lịch lặp tự động theo tuần
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Ngày bắt đầu *</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={recurringForm.startDate}
                  onChange={(event) => setRecurringForm((current) => ({ ...current, startDate: event.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Ngày kết thúc *</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={recurringForm.endDate}
                  onChange={(event) => setRecurringForm((current) => ({ ...current, endDate: event.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Thời lượng mỗi slot *</label>
                <Dropdown
                  value={recurringForm.slotDurationMinutes}
                  options={[
                    { label: '15 phút', value: 15 },
                    { label: '30 phút', value: 30 },
                    { label: '45 phút', value: 45 },
                    { label: '60 phút', value: 60 },
                  ]}
                  onChange={(event) => setRecurringForm((current) => ({ ...current, slotDurationMinutes: event.value }))}
                />
              </div>
            </div>

            <h4 className="text-sm font-bold text-gray-700 mt-6 mb-3">Khung giờ làm việc theo ngày trong tuần:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {recurringForm.weeklyPattern.map((item, index) => (
                <div key={item.dayOfWeek} className={`rounded-xl border p-3.5 transition-all ${item.active ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                  <label className="flex items-center gap-2 font-bold text-sm text-gray-800 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      checked={item.active}
                      onChange={(event) =>
                        setRecurringForm((current) => ({
                          ...current,
                          weeklyPattern: current.weeklyPattern.map((pattern, patternIndex) =>
                            patternIndex === index ? { ...pattern, active: event.target.checked } : pattern
                          ),
                        }))
                      }
                    />
                    {weekdayLabels.find((weekday) => weekday.value === item.dayOfWeek)?.label}
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="text-[11px] font-semibold text-gray-500 block mb-1">Giờ bắt đầu</span>
                      <input
                        type="time"
                        className="border border-gray-300 rounded-md px-2.5 py-1.5 text-xs w-full"
                        value={item.workStartTime.slice(0, 5)}
                        disabled={!item.active}
                        onChange={(event) =>
                          setRecurringForm((current) => ({
                            ...current,
                            weeklyPattern: current.weeklyPattern.map((pattern, patternIndex) =>
                              patternIndex === index ? { ...pattern, workStartTime: event.target.value + ':00' } : pattern
                            ),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-gray-500 block mb-1">Giờ kết thúc</span>
                      <input
                        type="time"
                        className="border border-gray-300 rounded-md px-2.5 py-1.5 text-xs w-full"
                        value={item.workEndTime.slice(0, 5)}
                        disabled={!item.active}
                        onChange={(event) =>
                          setRecurringForm((current) => ({
                            ...current,
                            weeklyPattern: current.weeklyPattern.map((pattern, patternIndex) =>
                              patternIndex === index ? { ...pattern, workEndTime: event.target.value + ':00' } : pattern
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <Button label="Hủy" outlined onClick={() => setActiveTab('schedule')} />
              <Button label="Sinh lịch hàng loạt" icon="pi pi-calendar-plus" onClick={handleRecurringSubmit} disabled={loading} />
            </div>
          </Card>
        )}

        {activeTab === 'schedule' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Tổng slot', value: slotStats.total, tone: 'text-blue-600 bg-blue-50 border-blue-100' },
                { label: 'Còn trống', value: slotStats.available, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                { label: 'Đã có lịch hẹn', value: slotStats.booked, tone: 'text-rose-600 bg-rose-50 border-rose-100' },
                { label: 'Đang khám', value: slotStats.inProgress, tone: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
              ].map((item) => (
                <Card key={item.label} className={'border shadow-sm rounded-xl p-4 ' + item.tone}>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.label}</div>
                  <div className="mt-2 text-3xl font-extrabold">{item.value}</div>
                </Card>
              ))}
            </div>

            <Card className="border border-gray-100 shadow-sm p-4 rounded-xl">
              <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button label="Tuần trước" icon="pi pi-angle-left" outlined onClick={() => moveWeek(-1)} />
                    <Button label="Tuần này" outlined onClick={() => moveWeek(0)} />
                    <Button label="Tuần sau" iconPos="right" icon="pi pi-angle-right" outlined onClick={() => moveWeek(1)} />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Tự động đồng bộ mỗi 60s
                  </span>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">Từ ngày</label>
                    <input
                      type="date"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={slotFilters.fromDate || ''}
                      onChange={(event) => setSlotFilters((current) => ({ ...current, fromDate: event.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">Đến ngày</label>
                    <input
                      type="date"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={slotFilters.toDate || ''}
                      onChange={(event) => setSlotFilters((current) => ({ ...current, toDate: event.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1 min-w-48">
                    <label className="text-xs font-bold text-gray-700">Trạng thái slot</label>
                    <Dropdown
                      value={slotFilters.status}
                      options={[
                        { label: 'Tất cả', value: undefined },
                        { label: 'AVAILABLE (Trống)', value: 'AVAILABLE' },
                        { label: 'BOOKED (Đã đặt)', value: 'BOOKED' },
                        { label: 'RESERVED', value: 'RESERVED' },
                        { label: 'BLOCKED', value: 'BLOCKED' },
                      ]}
                      onChange={(event) => setSlotFilters((current) => ({ ...current, status: event.value }))}
                    />
                  </div>
                  <Button label="Tải lịch" icon="pi pi-sync" onClick={() => loadScheduleData(slotFilters)} disabled={scheduleLoading} />
                </div>
              </div>

              {/* Redesigned Clean 7-Day Schedule Grid */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                  {slotsByDay.map(({ date, slots: daySlots }) => {
                    const isToday = toDateInput(date) === toDateInput(new Date());
                    return (
                      <div key={date.toISOString()} className="flex flex-col bg-white min-h-[420px]">
                        {/* Day Header */}
                        <div className={'p-3 text-center border-b border-slate-200 ' + (isToday ? 'bg-blue-50 border-b-2 border-b-blue-600' : 'bg-slate-50')}>
                          <div className={'text-xs font-bold uppercase tracking-wider ' + (isToday ? 'text-blue-600' : 'text-slate-500')}>
                            {formatSlotDateTitle(date)}
                          </div>
                          <div className={'text-sm font-extrabold mt-0.5 ' + (isToday ? 'text-blue-900' : 'text-slate-800')}>
                            {formatDate(toDateInput(date))}
                          </div>
                          <div className="mt-1 text-[11px] font-medium text-slate-400">
                            {daySlots.length} slot
                          </div>
                        </div>

                        {/* Slots List for this Day */}
                        <div className="p-2 flex flex-col gap-2.5 overflow-y-auto max-h-[650px] flex-1">
                          {daySlots.length === 0 ? (
                            <div className="py-12 text-center text-xs text-slate-400 italic">
                              Chưa có slot
                            </div>
                          ) : (
                            daySlots.map((slot) => {
                              const appointment = appointmentsBySlotId[slot.id];
                              const isPastSlot = new Date(slot.endTime) < new Date();
                              const isPastPending = Boolean(
                                appointment &&
                                ['PENDING_DOCTOR_CONFIRMATION', 'PENDING_PAYMENT', 'PENDING', 'BOOKED'].includes(appointment.appointmentStatus) &&
                                isPastSlot
                              );
                              const isPast = !appointment ? isPastSlot : isPastPending;
                              const rawStatus = isPastPending
                                ? 'EXPIRED_PENDING'
                                : !appointment && isPastSlot
                                  ? 'EXPIRED'
                                  : appointment?.appointmentStatus || slot.status || (slot.booked ? 'BOOKED' : 'AVAILABLE');
                              const isSelected = selectedSlotId === slot.id;

                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  onClick={() => void handleSlotSelect(slot)}
                                  className={
                                    'w-full text-left p-2.5 rounded-xl border transition-all duration-200 shadow-sm flex flex-col gap-1.5 ' +
                                    (isSelected
                                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400'
                                      : isPast
                                        ? 'border-rose-200 bg-rose-50/40 opacity-70 hover:opacity-100'
                                        : appointment
                                          ? 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300'
                                          : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300')
                                  }
                                >
                                  <div className="flex items-center justify-between gap-1 w-full">
                                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                      <i className="pi pi-clock text-[10px] text-slate-400" />
                                      {formatShortTime(slot.startTime)} - {formatShortTime(slot.endTime)}
                                    </span>
                                    {renderVietnameseStatusTag(rawStatus)}
                                  </div>

                                  {appointment ? (
                                    <div className={'text-[11px] font-semibold p-1.5 rounded border flex items-center justify-between ' + (isPastPending ? 'bg-rose-50/80 border-rose-200 text-rose-800' : 'bg-white border-slate-100 text-slate-700')}>
                                      <span className="truncate">
                                        👤 {appointment.patientName || 'Bệnh nhân'}
                                      </span>
                                      <i className="pi pi-chevron-right text-[10px] text-blue-500 shrink-0" />
                                    </div>
                                  ) : isPast ? (
                                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                      Hết hạn đặt lịch
                                    </div>
                                  ) : (
                                    <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                      Slot sẵn sàng
                                    </div>
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex flex-col lg:flex-row gap-4">
                <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">Slot đang chọn</div>
                  {selectedSlot ? (
                    <div className="mt-2 text-sm text-slate-700">
                      <div><strong>Khung giờ:</strong> {formatDateTime(selectedSlot.startTime)} - {formatTimeRange(selectedSlot.startTime, selectedSlot.endTime)}</div>
                      <div className="mt-1"><strong>Slot ID:</strong> {selectedSlot.id}</div>
                      <div className="mt-1"><strong>Phiên khám:</strong> {selectedAppointment ? selectedAppointment.appointmentId : 'Chưa có lịch hẹn'}</div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-slate-500">Chọn một block trên lịch để xem phiên khám hoặc thao tác slot.</div>
                  )}
                </div>

                {selectedSlot ? (
                  <div className="flex items-center gap-3">
                    {selectedAppointment ? (
                      <Button label="Mở phiên khám" icon="pi pi-arrow-right" onClick={() => void handleSlotSelect(selectedSlot)} disabled={consultationLoading} />
                    ) : null}
                    <Button
                      label="Xóa slot"
                      icon="pi pi-trash"
                      outlined
                      severity="danger"
                      onClick={() => handleDeleteSlot(selectedSlot.id)}
                      disabled={loading || Boolean(selectedAppointment)}
                    />
                  </div>
                ) : null}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'consultation' && (
          <div className="flex flex-col gap-6">
            {consultationContext ? (
              <>
                {/* Patient Profile & Appointment Overview Header */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Appointment Status & Details Card */}
                  <Card className="border border-slate-200 shadow-sm p-5 rounded-2xl bg-white">
                    <div className="flex items-center justify-between border-b pb-3 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái phiên</span>
                      {renderVietnameseStatusTag(consultationContext.appointmentStatus)}
                    </div>
                    <div className="flex flex-col gap-2.5 text-xs text-slate-700">
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-500">Mã lịch hẹn:</span>
                        <span className="font-mono font-bold text-slate-900">{consultationContext.appointmentId}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-500">Khung giờ:</span>
                        <span className="font-bold text-blue-600">{formatDateTime(consultationContext.startTime)}</span>
                      </div>
                      <div className="mt-1">
                        <span className="font-semibold text-slate-500 block mb-1">Lý do đăng ký khám:</span>
                        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-lg italic">
                          "{consultationContext.reason || 'Chưa cập nhật lý do.'}"
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Patient Info Card */}
                  <Card className="lg:col-span-2 border border-slate-200 shadow-sm p-5 rounded-2xl bg-white">
                    <div className="flex items-center gap-3 border-b pb-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                        👤
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 m-0">
                          {consultationContext.patient.lastName} {consultationContext.patient.firstName}
                        </h3>
                        <p className="text-xs text-slate-500 m-0">Thông tin bệnh nhân từ hồ sơ bệnh án</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                        <span className="text-slate-400 font-medium">Họ và tên Bệnh nhân</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {consultationContext.patient.lastName} {consultationContext.patient.firstName}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                        <span className="text-slate-400 font-medium">Email / Số điện thoại liên hệ</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {consultationContext.patient.contactInformation || 'Chưa cập nhật'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                        <span className="text-slate-400 font-medium">Ngày sinh</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {formatDate(consultationContext.patient.dateOfBirth)}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                        <span className="text-slate-400 font-medium">Giới tính</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {consultationContext.patient.gender || 'Chưa cập nhật'}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Workflow Doctor Action Center */}
                <Card className="border border-slate-200 shadow-sm p-5 rounded-2xl bg-white">
                  <h3 className="text-base font-extrabold text-slate-800 mb-4 border-b pb-3 flex items-center gap-2">
                    <i className="pi pi-cog text-blue-600" />
                    Thao tác tiến trình khám bệnh
                  </h3>

                  {checkInAvailabilityMessage ? (
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 flex items-center gap-2">
                      <i className="pi pi-exclamation-triangle text-amber-600 text-base" />
                      <span>{checkInAvailabilityMessage}</span>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      label="Xác nhận lịch khám"
                      icon="pi pi-check"
                      severity="success"
                      onClick={() => void handleDoctorAction('confirm')}
                      disabled={consultationLoading || !canConfirmSelectedAppointment}
                      className="py-2.5 text-xs font-bold"
                    />
                    <Button
                      label="Bắt đầu khám"
                      icon="pi pi-play"
                      onClick={() => void handleDoctorAction('checkin')}
                      disabled={consultationLoading || !canCheckInSelectedAppointment}
                      className="py-2.5 text-xs font-bold"
                    />
                    <Button
                      label="Đánh dấu không đến"
                      icon="pi pi-user-minus"
                      severity="warning"
                      onClick={() => void handleDoctorAction('not-checkin')}
                      disabled={consultationLoading || !canMarkNotCheckInSelectedAppointment}
                      className="py-2.5 text-xs font-bold"
                    />
                  </div>

                  <div className="mt-4 p-4 rounded-xl border border-rose-100 bg-rose-50 flex flex-col gap-3">
                    <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                      <i className="pi pi-times-circle text-rose-600" />
                      Hủy lịch khám (Gửi thông báo & email tự động cho Bệnh nhân)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                      <div className="md:col-span-2">
                        <InputText
                          value={cancelReason}
                          onChange={(event) => setCancelReason(event.target.value)}
                          placeholder="Nhập lý do bác sĩ hủy lịch khám..."
                          className="w-full text-xs"
                        />
                        <div className="mt-1 text-[11px] text-slate-500">
                          {canCancelSelectedAppointment
                            ? 'Bác sĩ được phép hủy lịch hẹn này. Lý do nhập ở đây sẽ được gửi qua email cho bệnh nhân.'
                            : (cancelAvailabilityMessage || 'Chưa đủ điều kiện hủy lịch khám này.')}
                        </div>
                      </div>
                      <Button
                        label="Xác nhận hủy lịch"
                        icon="pi pi-times"
                        severity="danger"
                        onClick={() => void handleDoctorAction('cancel')}
                        disabled={consultationLoading || !canCancelSelectedAppointment}
                        className="py-2.5 text-xs font-bold w-full"
                      />
                    </div>
                  </div>

                  {canCreateNextSlot ? (
                    <div className="mt-4 flex justify-end">
                      <Button
                        label="Tạo slot tiếp theo cho bệnh nhân tái khám"
                        icon="pi pi-calendar-plus"
                        outlined
                        onClick={() => void handleCreateNextSlot()}
                        disabled={loading}
                        className="text-xs font-bold"
                      />
                    </div>
                  ) : null}
                </Card>

                {/* Examination & Medical Record Form */}
                {canCheckoutSelectedAppointment ? (
                  <Card className="border border-slate-200 shadow-sm p-6 rounded-2xl bg-white">
                    <h3 className="text-lg font-extrabold text-slate-900 mb-4 border-b pb-3 flex items-center gap-2">
                      <i className="pi pi-file-edit text-blue-600" />
                      Hoàn tất khám bệnh & Kê đơn thuốc
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700">Ngày lập hồ sơ *</label>
                        <input
                          type="date"
                          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          value={checkoutForm.recordDate}
                          onChange={(event) => setCheckoutForm((current) => ({ ...current, recordDate: event.target.value }))}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700">Chẩn đoán chính *</label>
                        <InputText
                          value={checkoutForm.diagnosis}
                          onChange={(event) => setCheckoutForm((current) => ({ ...current, diagnosis: event.target.value }))}
                          placeholder="Ví dụ: Viêm họng cấp, Cảm cúm..."
                          className="text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 col-span-2">
                        <label className="text-xs font-bold text-slate-700">Hướng điều trị</label>
                        <InputTextarea
                          value={checkoutForm.treatment || ''}
                          onChange={(event) => setCheckoutForm((current) => ({ ...current, treatment: event.target.value }))}
                          rows={2}
                          placeholder="Phương pháp điều trị, lời khuyên dinh dưỡng, nghỉ ngơi..."
                          className="text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 col-span-2">
                        <label className="text-xs font-bold text-slate-700">Ghi chú lâm sàng / Tái khám</label>
                        <InputTextarea
                          value={checkoutForm.notes || ''}
                          onChange={(event) => setCheckoutForm((current) => ({ ...current, notes: event.target.value }))}
                          rows={2}
                          placeholder="Ghi chú thêm của bác sĩ..."
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <i className="pi pi-box text-blue-600" />
                          Danh sách đơn thuốc kê cho Bệnh nhân
                        </h4>
                        <Button
                          label="Thêm thuốc"
                          icon="pi pi-plus"
                          outlined
                          onClick={() =>
                            setCheckoutForm((current) => ({
                              ...current,
                              prescriptions: [...current.prescriptions, { medicationName: '', dosage: '', frequency: '', duration: '' }],
                            }))
                          }
                          className="text-xs font-bold"
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        {checkoutForm.prescriptions.map((prescription, index) => (
                          <div key={'prescription-' + index} className="rounded-xl border border-slate-200 bg-slate-50 p-4 relative">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-blue-600">Thuốc #{index + 1}</span>
                              {checkoutForm.prescriptions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCheckoutForm((current) => ({
                                      ...current,
                                      prescriptions: current.prescriptions.filter((_, itemIndex) => itemIndex !== index),
                                    }))
                                  }
                                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                                >
                                  <i className="pi pi-trash text-[10px]" /> Xóa
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <InputText
                                value={prescription.medicationName}
                                onChange={(event) =>
                                  setCheckoutForm((current) => ({
                                    ...current,
                                    prescriptions: current.prescriptions.map((item, itemIndex) =>
                                      itemIndex === index ? { ...item, medicationName: event.target.value } : item
                                    ),
                                  }))
                                }
                                placeholder="Tên thuốc *"
                                className="text-xs"
                              />
                              <InputText
                                value={prescription.dosage || ''}
                                onChange={(event) =>
                                  setCheckoutForm((current) => ({
                                    ...current,
                                    prescriptions: current.prescriptions.map((item, itemIndex) =>
                                      itemIndex === index ? { ...item, dosage: event.target.value } : item
                                    ),
                                  }))
                                }
                                placeholder="Liều dùng (vd: 500mg)"
                                className="text-xs"
                              />
                              <InputText
                                value={prescription.frequency || ''}
                                onChange={(event) =>
                                  setCheckoutForm((current) => ({
                                    ...current,
                                    prescriptions: current.prescriptions.map((item, itemIndex) =>
                                      itemIndex === index ? { ...item, frequency: event.target.value } : item
                                    ),
                                  }))
                                }
                                placeholder="Tần suất (vd: 2 lần/ngày)"
                                className="text-xs"
                              />
                              <InputText
                                value={prescription.duration || ''}
                                onChange={(event) =>
                                  setCheckoutForm((current) => ({
                                    ...current,
                                    prescriptions: current.prescriptions.map((item, itemIndex) =>
                                      itemIndex === index ? { ...item, duration: event.target.value } : item
                                    ),
                                  }))
                                }
                                placeholder="Thời lượng (vd: 5 ngày)"
                                className="text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex justify-end border-t pt-4">
                        <Button
                          label="Đã khám xong & Lưu hồ sơ bệnh án"
                          icon="pi pi-check-circle"
                          onClick={() => void handleDoctorAction('checkout')}
                          disabled={consultationLoading || !checkoutForm.diagnosis.trim()}
                          className="py-3 px-6 text-sm font-bold shadow-md"
                        />
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="border border-slate-200 shadow-sm p-5 text-sm text-slate-600 rounded-2xl bg-white flex items-center gap-3">
                    <i className="pi pi-info-circle text-blue-500 text-xl" />
                    <span>Phần nhập kết quả khám và kê đơn thuốc sẽ tự động mở sau khi Bác sĩ bấm nút <strong>"Bắt đầu khám"</strong> thành công.</span>
                  </Card>
                )}

                {/* Patient Medical History */}
                <Card className="border border-slate-200 shadow-sm p-6 rounded-2xl bg-white">
                  <h3 className="text-base font-extrabold text-slate-900 mb-4 border-b pb-3 flex items-center gap-2">
                    <i className="pi pi-history text-blue-600" />
                    Lịch sử khám bệnh cũ của Bệnh nhân
                  </h3>
                  <div className="flex flex-col gap-3">
                    {consultationContext.medicalHistory.length === 0 ? (
                      <div className="text-xs text-slate-400 italic py-4 text-center">
                        Bệnh nhân chưa có lịch sử hồ sơ khám cũ trong hệ thống.
                      </div>
                    ) : (
                      consultationContext.medicalHistory.map((record) => (
                        <div key={record.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50 hover:bg-slate-100 transition">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              {record.diagnosis}
                            </div>
                            <div className="text-xs font-semibold text-slate-500">
                              📅 {formatDate(record.recordDate)}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                            <div><strong>Điều trị:</strong> {record.treatment || 'Chưa cập nhật'}</div>
                            <div><strong>Ghi chú:</strong> {record.notes || 'Không có'}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="border border-slate-200 shadow-sm p-12 text-center rounded-2xl bg-white max-w-xl mx-auto flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-3xl">
                  <i className="pi pi-file-edit" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 m-0">Chưa chọn phiên khám nào</h3>
                  <p className="text-xs text-slate-500 mt-2 mb-0">
                    Vui lòng chuyển qua tab <strong>"Lịch làm việc"</strong> và bấm chọn một slot đã có lịch hẹn để mở phiên khám trực tiếp.
                  </p>
                </div>
                <Button
                  label="Chuyển sang Lịch làm việc"
                  icon="pi pi-calendar"
                  onClick={() => setActiveTab('schedule')}
                  className="mt-2 text-xs font-bold"
                />
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DoctorDashboard;
