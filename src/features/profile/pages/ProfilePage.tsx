import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import { useAuthStore } from '@/stores/auth.store';
import { getMyAppointments } from '@/features/appointments/services/appointmentApi';
import { profileApi, type AppointmentHistory, type DoctorSummary, type PatientProfile, type RescheduleOption, type UserProfile } from '@/features/profile/services/profileApi';
import { paymentApi, type PaymentResponse } from '@/features/payments/services/paymentApi';
import { buildVietQrTransferContent, buildVietQrUrl } from '@/features/payments/utils/vietQr';

const emptyPatientProfile: PatientProfile = {
  id: '',
  userId: '',
  firstName: '',
  lastName: '',
  dateOfBirth: null,
  gender: '',
  contactInformation: '',
};

const genderOptions = [
  { label: 'Nam', value: 'MALE' },
  { label: 'Nữ', value: 'FEMALE' },
  { label: 'Khác', value: 'OTHER' },
];

const statusLabels: Record<string, { label: string; severity: 'success' | 'warning' | 'danger' | 'info' | 'secondary' }> = {
  PENDING: { label: 'Đã xác nhận', severity: 'success' },
  PENDING_DOCTOR_CONFIRMATION: { label: 'Đã xác nhận', severity: 'success' },
  PENDING_PAYMENT: { label: 'Đã xác nhận', severity: 'success' },
  CONFIRMED: { label: 'Đã xác nhận', severity: 'success' },
  CHECKIN_SUCCESS: { label: 'Đang khám', severity: 'info' },
  CHECKOUT_SUCCESS: { label: 'Đã khám xong', severity: 'success' },
  COMPLETED: { label: 'Đã khám xong', severity: 'info' },
  CANCELLED_BY_DOCTOR: { label: 'Bác sĩ đã hủy', severity: 'danger' },
  CANCELLED: { label: 'Đã hủy', severity: 'danger' },
};

const paymentLabels: Record<string, string> = {
  PENDING: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thanh toán lỗi',
  REFUNDED: 'Đã hoàn tiền',
};

const statusClassNames: Record<string, string> = {
  PENDING: 'is-warning',
  PENDING_PAYMENT: 'is-payment',
  CONFIRMED: 'is-success',
  COMPLETED: 'is-info',
  CANCELLED: 'is-danger',
};

const appointmentStatusFilterOptions = [
  { label: 'Tất cả trạng thái', value: '' },
  ...Object.entries(statusLabels).map(([value, item]) => ({ label: item.label, value })),
];

const formatDateTime = (value: string) => new Date(value).toLocaleString('vi-VN');

const formatCurrency = (amount: number, currency = 'VND') =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const formatDateForApi = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getRescheduleSlotKey = (slot: RescheduleOption) => `${slot.startTime}|${slot.endTime}`;

const isSameCalendarDate = (firstDate: Date, secondDate: Date) =>
  firstDate.getFullYear() === secondDate.getFullYear()
  && firstDate.getMonth() === secondDate.getMonth()
  && firstDate.getDate() === secondDate.getDate();
>>>>>>> origin/main

const renderStatusTag = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'CHECKIN_SUCCESS':
      return <Tag value="Đang khám" severity="info" className="rounded bg-cyan-500 border-none text-white" />;
    case 'CHECKOUT_SUCCESS':
    case 'COMPLETED':
      return <Tag value="Đã khám xong" severity="success" className="rounded bg-slate-600 border-none text-white" />;
    case 'NOT_CHECKIN':
      return <Tag value="Bệnh nhân không đến" severity="danger" className="rounded" />;
    case 'CANCELLED_BY_DOCTOR':
      return <Tag value="Bác sĩ đã hủy" severity="danger" className="rounded" />;
    case 'CANCELLED':
      return <Tag value="Đã hủy" severity="danger" className="rounded" />;
    case 'CONFIRMED':
    case 'BOOKED':
    case 'PENDING_DOCTOR_CONFIRMATION':
    case 'PENDING':
    case 'PENDING_PAYMENT':
    default:
      return <Tag value="Đã xác nhận" severity="success" className="rounded" />;
  }
};


const ProfilePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(emptyPatientProfile);
  const [appointments, setAppointments] = useState<AppointmentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPatient, setSavingPatient] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [doctorsById, setDoctorsById] = useState<Record<string, DoctorSummary>>({});
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('');
  const [appointmentDateFilter, setAppointmentDateFilter] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentHistory | null>(null);
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false);
  const [loadingAppointmentDetail, setLoadingAppointmentDetail] = useState(false);
  const [appointmentDetailError, setAppointmentDetailError] = useState('');
  const [actionAppointment, setActionAppointment] = useState<AppointmentHistory | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<RescheduleOption[]>([]);
  const [selectedVisitDate, setSelectedVisitDate] = useState<Date | null>(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [paymentAppointment, setPaymentAppointment] = useState<AppointmentHistory | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

<<<<<<< HEAD
  const appointmentsKey = `patient_appointments_${userInfo.id}`;

  const loadAppointments = async () => {
    let localList: AppointmentHistory[] = [];
    const savedAppts = localStorage.getItem(appointmentsKey);
    if (savedAppts) {
      try {
        localList = JSON.parse(savedAppts);
      } catch (e) {
        console.error('Error parsing appointments', e);
      }
    }

    try {
      const remoteList = await getMyAppointments();
      if (Array.isArray(remoteList)) {
        const localMap = new Map(localList.map((item) => [item.id || (item as any).appointmentId, item]));

        const mergedList: AppointmentHistory[] = remoteList.map((remote) => {
          const localMatch = localMap.get(remote.id);
          return {
            id: remote.id,
            doctorName: localMatch?.doctorName || 'Bác sĩ chuyên khoa',
            specialty: localMatch?.specialty || 'Phòng khám đa khoa',
            startTime: remote.startTime || localMatch?.startTime || '',
            endTime: remote.endTime || localMatch?.endTime || '',
            patientName: localMatch?.patientName || userInfo.name || 'Bệnh nhân',
            patientPhone: localMatch?.patientPhone || '',
            patientSymptoms: remote.reason || localMatch?.patientSymptoms || '',
            status: remote.status || localMatch?.status || 'CONFIRMED',
            cancelReason: remote.cancelReason || (localMatch as any)?.cancelReason,
            createdAt: remote.createdAt || localMatch?.createdAt || new Date().toISOString(),
          };
        });

        setAppointments(mergedList);
        localStorage.setItem(appointmentsKey, JSON.stringify(mergedList));
        return;
      }
    } catch (e) {
      console.warn('Backend appointments fetch unavailable, using local storage cache', e);
    }

    setAppointments(localList);
  };

  // Load profile and history from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem(profileKey);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile({
          ...parsed,
          dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
        });
      } catch (e) {
        console.error('Error parsing profile', e);
      }
=======
  const getFallbackUserProfile = (): UserProfile | null => {
    if (!user) {
      return null;
>>>>>>> origin/main
    }

    const id = user.userId ?? user.id;
    return {
      id,
      patientId: user.patientId ?? null,
      email: user.email,
      fullName: user.email.split('@')[0] || user.email,
      phoneNumber: '',
      status: 'ACTIVE',
      roles: (user.roles ?? []).map((role) => ({ id: role, name: role, description: role })),
    };
  };

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const [accountResult, patientResult, historyResult] = await Promise.allSettled([
          profileApi.getUserProfile(),
          profileApi.getPatientProfile(),
          profileApi.getAppointments(),
        ]);

        if (cancelled) {
          return;
        }

        setUserProfile(accountResult.status === 'fulfilled' ? accountResult.value : getFallbackUserProfile());

        if (patientResult.status === 'fulfilled') {
          setPatientProfile(patientResult.value);
        } else if (axios.isAxiosError(patientResult.reason) && patientResult.reason.response?.status === 404) {
          setPatientProfile(emptyPatientProfile);
        }

        if (historyResult.status === 'fulfilled') {
          setAppointments(historyResult.value);
        }
      } catch {
        if (!cancelled) {
          setError('Không thể tải hồ sơ. Vui lòng thử lại.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    const missingDoctorIds = Array.from(new Set(appointments.map((appointment) => appointment.doctorId)))
      .filter((doctorId) => doctorId && !doctorsById[doctorId]);

    if (!missingDoctorIds.length) {
      return () => {
        cancelled = true;
      };
    }

    const loadDoctors = async () => {
      const doctorEntries = await Promise.all(
        missingDoctorIds.map(async (doctorId) => {
          try {
            const doctor = await profileApi.getDoctor(doctorId);
            return [doctorId, doctor] as const;
          } catch {
            return [doctorId, null] as const;
          }
        }),
      );

      if (!cancelled) {
        setDoctorsById((current) => {
          const next = { ...current };
          doctorEntries.forEach(([doctorId, doctor]) => {
            if (doctor) {
              next[doctorId] = doctor;
            }
          });
          return next;
        });
      }
    };

    void loadDoctors();
    return () => {
      cancelled = true;
    };
  }, [appointments, doctorsById]);

  const sortedAppointments = useMemo(
    () => [...appointments].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()),
    [appointments],
  );

  const selectedRescheduleSlot = useMemo(
    () => availableSlots.find((slot) => getRescheduleSlotKey(slot) === selectedSlotKey) ?? null,
    [availableSlots, selectedSlotKey],
  );
  const paymentQrUrl = useMemo(() => payment ? buildVietQrUrl(payment.amount, payment.id) : '', [payment]);
  const paymentTransferContent = payment ? buildVietQrTransferContent(payment.id) : '';

  const displayName = userProfile?.fullName?.trim() || userProfile?.email || user?.email || 'Người dùng';
  const patientName = [patientProfile.lastName, patientProfile.firstName].filter(Boolean).join(' ');
  const profileInitial = displayName.charAt(0).toUpperCase();
  const selectedAppointmentDoctor = selectedAppointment ? doctorsById[selectedAppointment.doctorId] : null;

  const getDoctorName = (doctorId: string) => doctorsById[doctorId]?.name ?? 'Bác sĩ đang cập nhật';

  const getAppointmentSpecialization = (appointment: AppointmentHistory) =>
    appointment.specialization
      || doctorsById[appointment.doctorId]?.specialization
      || 'Đang cập nhật';

  const hasAppointmentFilters = Boolean(appointmentSearchTerm.trim() || appointmentStatusFilter || appointmentDateFilter);

  const filteredAppointments = useMemo(() => {
    const keyword = appointmentSearchTerm.trim().toLowerCase();

    return sortedAppointments.filter((appointment) => {
      const statusLabel = statusLabels[appointment.status]?.label ?? appointment.status;
      const doctorName = getDoctorName(appointment.doctorId);
      const specialization = getAppointmentSpecialization(appointment);
      const appointmentDate = new Date(appointment.startTime);

      const matchesKeyword = !keyword || [
        appointment.id,
        doctorName,
        specialization,
        appointment.reason ?? '',
        statusLabel,
        appointment.status,
        appointment.paymentStatus ?? '',
      ].some((value) => value.toLowerCase().includes(keyword));

      const matchesStatus = !appointmentStatusFilter || appointment.status === appointmentStatusFilter;
      const matchesDate = !appointmentDateFilter || isSameCalendarDate(appointmentDate, appointmentDateFilter);

      return matchesKeyword && matchesStatus && matchesDate;
    });
  }, [appointmentDateFilter, appointmentSearchTerm, appointmentStatusFilter, doctorsById, sortedAppointments]);

  const formatSlotTime = (startTimeStr: string, endTimeStr: string) => {
    try {
      const start = new Date(startTimeStr);
      const end = new Date(endTimeStr);
      const timeFormatter = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return `${timeFormatter.format(start)} - ${timeFormatter.format(end)} ngày ${dateFormatter.format(start)}`;
    } catch {
      return 'Chưa xác định';
    }
  };

  const displayStatus = (status: string) => statusLabels[status] ?? { label: status, severity: 'secondary' as const };

  const getStatusClassName = (status: string) => statusClassNames[status] ?? 'is-muted';

  const canPayAppointment = (appointment: AppointmentHistory) => {
    return appointment.paymentStatus === 'PENDING' && appointment.status !== 'CANCELLED';
  };

  const getApiErrorMessage = (reason: unknown, fallback: string) => {
    if (axios.isAxiosError(reason) && typeof reason.response?.data?.message === 'string') {
      return reason.response.data.message;
    }

    return fallback;
  };

  const refreshAppointments = async () => {
    const nextAppointments = await profileApi.getAppointments();
    setAppointments(nextAppointments);
    return nextAppointments;
  };

  const updateSuccess = (message: string) => {
    setSaveSuccess(message);
    window.setTimeout(() => setSaveSuccess(''), 3000);
  };

  const handleOpenAppointmentDetail = async (appointment: AppointmentHistory) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetail(true);
    setAppointmentDetailError('');
    setLoadingAppointmentDetail(true);

    try {
      const [appointmentDetail, doctor] = await Promise.all([
        profileApi.getAppointmentDetail(appointment.id),
        doctorsById[appointment.doctorId]
          ? Promise.resolve(doctorsById[appointment.doctorId])
          : profileApi.getDoctor(appointment.doctorId),
      ]);

      setSelectedAppointment(appointmentDetail);
      setDoctorsById((current) => ({ ...current, [doctor.id]: doctor }));
    } catch {
      setAppointmentDetailError('Không thể tải chi tiết lịch hẹn.');
    } finally {
      setLoadingAppointmentDetail(false);
    }
  };

  const handleCloseAppointmentDetail = () => {
    setShowAppointmentDetail(false);
    setAppointmentDetailError('');
  };

  const handleOpenCancel = (appointment: AppointmentHistory) => {
    setActionAppointment(appointment);
    setCancelReason('');
    setCancelError('');
    setShowCancelDialog(true);
  };

  const handleCloseCancel = () => {
    if (submittingCancel) return;
    setShowCancelDialog(false);
    setCancelError('');
  };

  const handleSubmitCancel = async () => {
    if (!actionAppointment || !cancelReason.trim()) {
      return;
    }

    setSubmittingCancel(true);
    setCancelError('');

    try {
      const updatedAppointment = await profileApi.cancelAppointment(actionAppointment.id, {
        cancelReason: cancelReason.trim(),
      });
      await refreshAppointments();
      setSelectedAppointment((current) => current?.id === updatedAppointment.id ? updatedAppointment : current);
      setShowCancelDialog(false);
      updateSuccess('Đã hủy lịch hẹn.');
    } catch (reason) {
      setCancelError(getApiErrorMessage(reason, 'Không thể hủy lịch hẹn.'));
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handleOpenReschedule = (appointment: AppointmentHistory) => {
    setActionAppointment(appointment);
    setSelectedVisitDate(null);
    setSelectedSlotKey('');
    setRescheduleReason('');
    setRescheduleError('');
    setAvailableSlots([]);
    setShowRescheduleDialog(true);
    setLoadingSlots(false);
  };

  useEffect(() => {
    let cancelled = false;

    setSelectedSlotKey('');
    setAvailableSlots([]);
    setRescheduleError('');

    if (!showRescheduleDialog || !actionAppointment || !selectedVisitDate) {
      setLoadingSlots(false);
      return () => {
        cancelled = true;
      };
    }

    setLoadingSlots(true);
    profileApi.getRescheduleOptions(actionAppointment.id, formatDateForApi(selectedVisitDate))
      .then((slots) => {
        if (cancelled) return;
        setAvailableSlots(
          slots
            .filter((slot) => slot.availableCount > 0)
            .sort((first, second) => new Date(first.startTime).getTime() - new Date(second.startTime).getTime()),
        );
      })
      .catch((reason) => {
        if (cancelled) return;
        setRescheduleError(getApiErrorMessage(reason, 'Không thể tải danh sách khung giờ trống.'));
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [actionAppointment, selectedVisitDate, showRescheduleDialog]);

  const handleCloseReschedule = () => {
    if (submittingReschedule) return;
    setShowRescheduleDialog(false);
    setRescheduleError('');
  };

  const handleOpenPayment = async (appointment: AppointmentHistory) => {
    setPaymentAppointment(appointment);
    setPayment(null);
    setPaymentError('');
    setShowPaymentDialog(true);
    setLoadingPayment(true);

    try {
      const createdPayment = await paymentApi.createPayment({
        appointmentId: appointment.id,
        paymentTiming: 'PAY_NOW',
      });
      setPayment(createdPayment);
    } catch (reason) {
      if (axios.isAxiosError(reason) && reason.response?.status === 409) {
        try {
          const existingPayment = await paymentApi.getPaymentByAppointment(appointment.id);
          setPayment(existingPayment);
        } catch (lookupReason) {
          setPaymentError(getApiErrorMessage(lookupReason, 'Không thể tải thông tin thanh toán đã tạo.'));
        }
      } else {
        setPaymentError(getApiErrorMessage(reason, 'Không thể tạo thanh toán. Vui lòng thử lại.'));
      }
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleClosePayment = () => {
    if (loadingPayment || confirmingPayment) return;
    setShowPaymentDialog(false);
    setPaymentError('');
  };

  const handleConfirmPayment = async () => {
    if (!payment) {
      return;
    }

    setConfirmingPayment(true);
    setPaymentError('');

    try {
      const updatedPayment = await paymentApi.confirmPaid(payment.id);
      setPayment(updatedPayment);
      const nextAppointments = await refreshAppointments();
      const updatedAppointment = nextAppointments.find((appointment) => appointment.id === updatedPayment.appointmentId);

      if (updatedAppointment) {
        setPaymentAppointment(updatedAppointment);
        setSelectedAppointment((current) => current?.id === updatedAppointment.id ? updatedAppointment : current);
      }

      setShowPaymentDialog(false);
      updateSuccess('Đã xác nhận thanh toán.');
    } catch (reason) {
      setPaymentError(getApiErrorMessage(reason, 'Không thể xác nhận thanh toán. Vui lòng thử lại.'));
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleSubmitReschedule = async () => {
    if (!actionAppointment || !selectedRescheduleSlot) {
      return;
    }

    setSubmittingReschedule(true);
    setRescheduleError('');

    try {
      const updatedAppointment = await profileApi.rescheduleAppointment(actionAppointment.id, {
        startTime: selectedRescheduleSlot.startTime,
        endTime: selectedRescheduleSlot.endTime,
        reason: rescheduleReason.trim() || undefined,
      });
      await refreshAppointments();
      setSelectedAppointment((current) => current?.id === updatedAppointment.id ? updatedAppointment : current);
      setShowRescheduleDialog(false);
      updateSuccess('Đã đổi khung giờ khám.');
    } catch (reason) {
      setRescheduleError(getApiErrorMessage(reason, 'Không thể đổi khung giờ khám.'));
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const handleSaveAccount = async () => {
    if (!userProfile) return;
    setSavingAccount(true);
    setError('');

    try {
      const updated = await profileApi.updateUserProfile({
        fullName: userProfile.fullName,
        phoneNumber: userProfile.phoneNumber ?? '',
      });
      setUserProfile(updated);
      updateSuccess('Đã cập nhật thông tin tài khoản.');
    } catch {
      setError('Không thể cập nhật thông tin tài khoản.');
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSavePatient = async () => {
    setSavingPatient(true);
    setError('');

    try {
      const updated = await profileApi.updatePatientProfile({
        firstName: patientProfile.firstName,
        lastName: patientProfile.lastName,
        dateOfBirth: patientProfile.dateOfBirth,
        gender: patientProfile.gender ?? '',
        contactInformation: patientProfile.contactInformation ?? '',
      });
      setPatientProfile(updated);
      setUserProfile((current) => current ? { ...current, patientId: updated.id } : current);
      updateSuccess('Đã cập nhật hồ sơ bệnh nhân.');
    } catch {
      setError('Không thể cập nhật hồ sơ bệnh nhân.');
    } finally {
      setSavingPatient(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        
        title="Trang cá nhân"
      />

      <section className="profile-page">
        {error && (
          <div className="profile-alert profile-alert--error">
            <i className="pi pi-exclamation-circle" />
            <span>{error}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="profile-alert profile-alert--success">
            <i className="pi pi-check-circle" />
            <span>{saveSuccess}</span>
          </div>
        )}

        <div className="profile-tabs" role="tablist" aria-label="Hồ sơ cá nhân">
          <button
            type="button"
            className={`profile-tab${activeTab === 'profile' ? ' is-active' : ''}`}
            onClick={() => setActiveTab('profile')}
            role="tab"
            aria-selected={activeTab === 'profile'}
          >
            <i className="pi pi-user" />
            <span>Thông tin cá nhân</span>
          </button>
          <button
            type="button"
            className={`profile-tab${activeTab === 'history' ? ' is-active' : ''}`}
            onClick={() => setActiveTab('history')}
            role="tab"
            aria-selected={activeTab === 'history'}
          >
            <i className="pi pi-calendar" />
            <span>Lịch sử đặt khám</span>
            {appointments.length > 0 && <strong>{appointments.length}</strong>}
          </button>
        </div>

        {loading ? (
          <div className="profile-loading">
            <i className="pi pi-spin pi-spinner" />
            <span>Đang tải hồ sơ...</span>
          </div>
        ) : activeTab === 'profile' && userProfile ? (
          <div className="profile-summary-grid">
            <aside className="profile-account-panel">
              <div className="profile-avatar" aria-hidden="true">{profileInitial}</div>
              <div className="profile-account-panel__identity">
                <h2>{displayName}</h2>
                <p>{userProfile.email}</p>
              </div>
              <div className="profile-account-panel__meta">
                <span>Vai trò</span>
                <strong>Bệnh nhân</strong>
              </div>
              <div className="profile-account-panel__meta">
                <span>Tài khoản</span>
                <strong>{userProfile.status}</strong>
              </div>
              <div className="profile-account-panel__meta">
                <span>Hồ sơ y tế</span>
                <strong>{patientName || 'Chưa cập nhật'}</strong>
              </div>
            </aside>

            <section className="profile-form-panel">
              <div className="profile-form-panel__header">
                <div>
                  <h2>Thông tin y tế và liên hệ</h2>
                </div>
              </div>

              <div className="profile-form-grid">
                <label className="profile-field profile-field--wide" htmlFor="fullName">
                  <span>Họ và tên</span>
                  <InputText
                    id="fullName"
                    value={userProfile.fullName}
                    onChange={(event) => setUserProfile({ ...userProfile, fullName: event.target.value })}
                  />
                </label>

                <label className="profile-field" htmlFor="lastName">
                  <span>Họ bệnh nhân</span>
                  <InputText
                    id="lastName"
                    value={patientProfile.lastName}
                    onChange={(event) => setPatientProfile({ ...patientProfile, lastName: event.target.value })}
                  />
                </label>

                <label className="profile-field" htmlFor="firstName">
                  <span>Tên bệnh nhân</span>
                  <InputText
                    id="firstName"
                    value={patientProfile.firstName}
                    onChange={(event) => setPatientProfile({ ...patientProfile, firstName: event.target.value })}
                  />
                </label>

                <label className="profile-field" htmlFor="phoneNumber">
                  <span>Số điện thoại</span>
                  <InputText
                    id="phoneNumber"
                    value={userProfile.phoneNumber ?? ''}
                    onChange={(event) => setUserProfile({ ...userProfile, phoneNumber: event.target.value })}
                    placeholder="Nhập số điện thoại"
                  />
                </label>

                <label className="profile-field" htmlFor="email">
                  <span>Email</span>
                  <InputText id="email" value={userProfile.email} disabled />
                </label>

                <label className="profile-field" htmlFor="dob">
                  <span>Ngày sinh</span>
                  <Calendar
                    id="dob"
                    value={patientProfile.dateOfBirth ? new Date(`${patientProfile.dateOfBirth}T00:00:00`) : null}
                    onChange={(event) => setPatientProfile({
                      ...patientProfile,
                      dateOfBirth: event.value instanceof Date ? event.value.toISOString().slice(0, 10) : null,
                    })}
                    showIcon
                    dateFormat="dd/mm/yy"
                    placeholder="Chọn ngày sinh"
                  />
                </label>

                <label className="profile-field" htmlFor="gender">
                  <span>Giới tính</span>
                  <Dropdown
                    id="gender"
                    value={patientProfile.gender}
                    options={genderOptions}
                    onChange={(event) => setPatientProfile({ ...patientProfile, gender: event.value })}
                    placeholder="Chọn giới tính"
                  />
                </label>

                <label className="profile-field profile-field--wide" htmlFor="contactInformation">
                  <span>Thông tin liên hệ</span>
                  <InputText
                    id="contactInformation"
                    value={patientProfile.contactInformation ?? ''}
                    onChange={(event) => setPatientProfile({ ...patientProfile, contactInformation: event.target.value })}
                    placeholder="Số điện thoại hoặc thông tin liên hệ"
                  />
                </label>
              </div>

              <div className="profile-form-actions">
                <Button
                  label={savingAccount ? 'Đang lưu...' : 'Lưu tài khoản'}
                  icon="pi pi-user-edit"
                  onClick={handleSaveAccount}
                  disabled={savingAccount || savingPatient}
                  outlined
                />
                <Button
                  label={savingPatient ? 'Đang lưu...' : 'Lưu hồ sơ bệnh nhân'}
                  icon="pi pi-save"
                  onClick={handleSavePatient}
                  disabled={savingAccount || savingPatient}
                />
              </div>
            </section>
          </div>
        ) : null}

<<<<<<< HEAD
        {/* Tab 2: Appointment History */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-4">
            {appointments.length === 0 ? (
              <Card className="text-center p-8 border border-gray-100 shadow-sm">
                <i className="pi pi-calendar-times text-5xl text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-800 m-0">Không tìm thấy lịch hẹn</h3>
                <p className="text-sm text-gray-500 mt-2 mb-0">Bạn chưa đặt lịch khám nào trên hệ thống.</p>
              </Card>
            ) : (
              appointments.map((appt) => (
                <Card 
                  key={appt.id} 
                  className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Appointment details */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStatusTag(appt.status)}
                        <span className="text-xs text-gray-400">Đặt lúc: {new Date(appt.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 m-0">Bác sĩ: {appt.doctorName}</h4>
                      <div className="text-sm text-blue-600 font-semibold mt-1">{appt.specialty}</div>
                      
                      <div className="mt-2 flex flex-col gap-1 text-sm text-gray-600">
                        <div>
                          <i className="pi pi-clock mr-2 text-gray-400" />
                          <strong>Giờ khám: </strong>{formatSlotTime(appt.startTime, appt.endTime)}
                        </div>
                        <div>
                          <i className="pi pi-user mr-2 text-gray-400" />
                          <strong>Bệnh nhân: </strong>{appt.patientName} ({appt.patientPhone})
                        </div>
                        {appt.patientSymptoms && (
                          <div className="italic text-gray-500 mt-1">
                            "Triệu chứng: {appt.patientSymptoms}"
                          </div>
                        )}
                        {(appt as any).cancelReason && (
                          <div className="mt-1 text-xs font-semibold text-red-600 bg-red-50 p-2 rounded border border-red-200">
                            Lý do bác sĩ hủy: {(appt as any).cancelReason}
                          </div>
                        )}
                      </div>
                    </div>
=======
        {!loading && activeTab === 'history' && (
          <section className="profile-history-panel">
            <div className="profile-history-panel__header">
              <div>
                <h2>Lịch sử đặt khám</h2>
                <p>
                  {appointments.length
                    ? hasAppointmentFilters
                      ? `Hiển thị ${filteredAppointments.length}/${appointments.length} lịch hẹn`
                      : `${appointments.length} lịch hẹn gần đây`
                    : 'Chưa có lịch hẹn nào'}
                </p>
              </div>
            </div>
>>>>>>> origin/main

            {appointments.length > 0 && (
              <div className="profile-history-filters">
                <label className="profile-field profile-history-search" htmlFor="appointmentSearch">
                  <span>Tìm kiếm</span>
                  <InputText
                    id="appointmentSearch"
                    value={appointmentSearchTerm}
                    onChange={(event) => setAppointmentSearchTerm(event.target.value)}
                    placeholder="Tìm bác sĩ, chuyên khoa, lý do, trạng thái"
                  />
                </label>
                <label className="profile-field" htmlFor="appointmentStatusFilter">
                  <span>Trạng thái</span>
                  <Dropdown
                    id="appointmentStatusFilter"
                    value={appointmentStatusFilter}
                    options={appointmentStatusFilterOptions}
                    onChange={(event) => setAppointmentStatusFilter(event.value ?? '')}
                  />
                </label>
                <label className="profile-field" htmlFor="appointmentDateFilter">
                  <span>Ngày khám</span>
                  <Calendar
                    inputId="appointmentDateFilter"
                    value={appointmentDateFilter}
                    onChange={(event) => setAppointmentDateFilter(event.value instanceof Date ? event.value : null)}
                    showIcon
                    showButtonBar
                    dateFormat="dd/mm/yy"
                    placeholder="Chọn ngày"
                  />
                </label>
                <Button
                  label="Xóa lọc"
                  icon="pi pi-filter-slash"
                  className="profile-history-filter-clear"
                  outlined
                  onClick={() => {
                    setAppointmentSearchTerm('');
                    setAppointmentStatusFilter('');
                    setAppointmentDateFilter(null);
                  }}
                  disabled={!hasAppointmentFilters}
                />
              </div>
            )}

            {appointments.length === 0 ? (
              <div className="profile-empty-state">
                <i className="pi pi-calendar-times" />
                <h3>Không tìm thấy lịch hẹn</h3>
                <p>Bạn chưa đặt lịch khám nào trên hệ thống.</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="profile-empty-state">
                <i className="pi pi-search" />
                <h3>Không tìm thấy lịch hẹn phù hợp</h3>
                <p>Thử đổi từ khóa, trạng thái hoặc ngày khám để xem thêm kết quả.</p>
              </div>
            ) : (
              <div className="profile-appointment-list">
                {filteredAppointments.map((appointment) => {
                  const status = displayStatus(appointment.status);
                  return (
                    <article key={appointment.id} className="profile-appointment-card">
                      <div className="profile-appointment-card__main">
                        <div className="profile-appointment-card__topline">
                          <span className={`profile-status-pill ${getStatusClassName(appointment.status)}`}>{status.label}</span>
                          <span>Đặt lúc {formatDateTime(appointment.createdAt)}</span>
                        </div>
                        <h3>Lịch khám của bạn</h3>
                        <div className="profile-appointment-card__doctor">
                          <i className="pi pi-user" />
                          <span>{getDoctorName(appointment.doctorId)}</span>
                        </div>
                        <div className="profile-appointment-card__time">
                          <i className="pi pi-clock" />
                          <span>{formatSlotTime(appointment.startTime, appointment.endTime)}</span>
                        </div>
                        {appointment.paymentStatus && appointment.paymentStatus !== 'PAID' && (
                          <div className="profile-appointment-card__payment-status">
                            <i className="pi pi-wallet" />
                            <span>{paymentLabels[appointment.paymentStatus] ?? appointment.paymentStatus}</span>
                          </div>
                        )}
                        {appointment.reason && <p>{appointment.reason}</p>}
                      </div>

                      <div className="profile-appointment-card__actions">
                        {canPayAppointment(appointment) && (
                          <Button
                            label="Thanh toán"
                            icon="pi pi-qrcode"
                            className="profile-appointment-card__detail profile-appointment-card__payment"
                            onClick={() => handleOpenPayment(appointment)}
                          />
                        )}
                        <Button
                          label="Chi tiết"
                          icon="pi pi-info-circle"
                          className="profile-appointment-card__detail"
                          outlined
                          onClick={() => handleOpenAppointmentDetail(appointment)}
                        />
                        <Button
                          label="Đổi lịch"
                          icon="pi pi-calendar-plus"
                          className="profile-appointment-card__detail profile-appointment-card__secondary"
                          outlined
                          onClick={() => handleOpenReschedule(appointment)}
                        />
                        <Button
                          label="Hủy lịch"
                          icon="pi pi-times"
                          severity="danger"
                          className="profile-appointment-card__detail profile-appointment-card__danger"
                          outlined
                          onClick={() => handleOpenCancel(appointment)}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </section>

      <Dialog
        visible={showAppointmentDetail}
        showHeader={false}
        modal
        dismissableMask
        className="profile-appointment-dialog"
        onHide={handleCloseAppointmentDetail}
      >
        {selectedAppointment && (
          <section className="profile-detail">
            <header className="profile-detail__header">
              <div>
                <span>Chi tiết lịch hẹn</span>
                <h2>Lịch khám của bạn</h2>
                <p>Đặt lúc {formatDateTime(selectedAppointment.createdAt)}</p>
              </div>
              <button
                type="button"
                className="profile-detail__close"
                aria-label="Đóng chi tiết lịch hẹn"
                onClick={handleCloseAppointmentDetail}
              >
                <i className="pi pi-times" />
              </button>
            </header>

            <div className="profile-detail__body">
              {loadingAppointmentDetail && (
                <div className="profile-detail__loading">
                  <i className="pi pi-spin pi-spinner" />
                  <span>Đang tải chi tiết lịch hẹn...</span>
                </div>
              )}

              {appointmentDetailError && (
                <div className="profile-alert profile-alert--error">
                  <i className="pi pi-exclamation-circle" />
                  <span>{appointmentDetailError}</span>
                </div>
              )}

              <div className="profile-detail__summary">
                <span className={`profile-status-pill ${getStatusClassName(selectedAppointment.status)}`}>
                  {displayStatus(selectedAppointment.status).label}
                </span>
                <strong>{formatSlotTime(selectedAppointment.startTime, selectedAppointment.endTime)}</strong>
              </div>

              <dl className="profile-detail__grid">
                <div>
                  <dt>Bác sĩ</dt>
                  <dd>{getDoctorName(selectedAppointment.doctorId)}</dd>
                </div>
                <div>
                  <dt>Chuyên khoa</dt>
                  <dd>{selectedAppointmentDoctor?.specialization ?? 'Đang cập nhật'}</dd>
                </div>
                <div>
                  <dt>Thanh toán</dt>
                  <dd>{selectedAppointment.paymentStatus ? paymentLabels[selectedAppointment.paymentStatus] ?? selectedAppointment.paymentStatus : 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt>Nguồn đặt</dt>
                  <dd>{selectedAppointment.bookingSource ?? 'WEB'}</dd>
                </div>
                <div className="profile-detail__wide">
                  <dt>Lý do khám</dt>
                  <dd>{selectedAppointment.reason || 'Chưa nhập lý do khám'}</dd>
                </div>
                {selectedAppointment.cancelReason && (
                  <div className="profile-detail__wide">
                    <dt>Lý do hủy</dt>
                    <dd>{selectedAppointment.cancelReason}</dd>
                  </div>
                )}
                {selectedAppointment.cancelledAt && (
                  <div className="profile-detail__wide">
                    <dt>Thời điểm hủy</dt>
                    <dd>{formatDateTime(selectedAppointment.cancelledAt)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </section>
        )}
      </Dialog>

      <Dialog
        visible={showPaymentDialog}
        header="Thanh toán lịch khám"
        modal
        dismissableMask={!loadingPayment && !confirmingPayment}
        className="profile-action-dialog profile-payment-dialog"
        onHide={handleClosePayment}
      >
        {paymentAppointment && (
          <section className="profile-action-modal profile-payment-modal">
            <div className="profile-action-summary">
              <strong>{getDoctorName(paymentAppointment.doctorId)}</strong>
              <span>{formatSlotTime(paymentAppointment.startTime, paymentAppointment.endTime)}</span>
            </div>

            {loadingPayment ? (
              <div className="profile-detail__loading">
                <i className="pi pi-spin pi-spinner" />
                <span>Đang tạo mã QR thanh toán...</span>
              </div>
            ) : payment ? (
              <>
                <div className="profile-payment-qr">
                  <img
                    src={paymentQrUrl}
                    alt="QR thanh toán MB Bank"
                    width={320}
                  />
                </div>

                <dl className="profile-payment-info">
                  <div>
                    <dt>Số tiền</dt>
                    <dd>{formatCurrency(payment.amount, payment.currency)}</dd>
                  </div>
                  <div>
                    <dt>Nội dung chuyển khoản</dt>
                    <dd>{paymentTransferContent}</dd>
                  </div>
                  <div>
                    <dt>Trạng thái</dt>
                    <dd>{paymentLabels[payment.status] ?? payment.status}</dd>
                  </div>
                </dl>
              </>
            ) : null}

            {paymentError && (
              <div className="profile-alert profile-alert--error">
                <i className="pi pi-exclamation-circle" />
                <span>{paymentError}</span>
              </div>
            )}

            <div className="profile-action-footer">
              <Button
                label="Đóng"
                icon="pi pi-times"
                outlined
                onClick={handleClosePayment}
                disabled={loadingPayment || confirmingPayment}
              />
              <Button
                label={confirmingPayment ? 'Đang xác nhận...' : 'Tôi đã thanh toán'}
                icon="pi pi-check"
                onClick={handleConfirmPayment}
                disabled={loadingPayment || confirmingPayment || !payment || payment.status === 'PAID'}
              />
            </div>
          </section>
        )}
      </Dialog>

      <Dialog
        visible={showCancelDialog}
        header="Hủy lịch hẹn"
        modal
        dismissableMask={!submittingCancel}
        className="profile-action-dialog"
        onHide={handleCloseCancel}
      >
        {actionAppointment && (
          <section className="profile-action-modal">
            <div className="profile-action-summary">
              <strong>{getDoctorName(actionAppointment.doctorId)}</strong>
              <span>{formatSlotTime(actionAppointment.startTime, actionAppointment.endTime)}</span>
            </div>

            <label className="profile-field" htmlFor="cancelReason">
              <span>Lý do hủy</span>
              <InputTextarea
                id="cancelReason"
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                rows={4}
                autoResize
                placeholder="Nhập lý do hủy lịch hẹn"
              />
            </label>

            {cancelError && (
              <div className="profile-alert profile-alert--error">
                <i className="pi pi-exclamation-circle" />
                <span>{cancelError}</span>
              </div>
            )}

            <div className="profile-action-footer">
              <Button
                label="Đóng"
                icon="pi pi-times"
                outlined
                onClick={handleCloseCancel}
                disabled={submittingCancel}
              />
              <Button
                label={submittingCancel ? 'Đang hủy...' : 'Xác nhận hủy'}
                icon="pi pi-check"
                severity="danger"
                onClick={handleSubmitCancel}
                disabled={submittingCancel || !cancelReason.trim()}
              />
            </div>
          </section>
        )}
      </Dialog>

      <Dialog
        visible={showRescheduleDialog}
        header="Đổi khung giờ khám"
        modal
        dismissableMask={!submittingReschedule}
        className="profile-action-dialog profile-action-dialog--wide"
        onHide={handleCloseReschedule}
      >
        {actionAppointment && (
          <section className="profile-action-modal">
            <div className="profile-action-summary">
              <strong>Lịch hiện tại</strong>
              <span>Bác sĩ hiện tại: {getDoctorName(actionAppointment.doctorId)}</span>
              <span>Chuyên khoa: {getAppointmentSpecialization(actionAppointment)}</span>
              <span>Ngày giờ hiện tại: {formatSlotTime(actionAppointment.startTime, actionAppointment.endTime)}</span>
            </div>

            <label className="profile-field" htmlFor="rescheduleDate">
              <span>Ngày mới</span>
              <Calendar
                inputId="rescheduleDate"
                value={selectedVisitDate}
                onChange={(event) => {
                  setSelectedVisitDate(event.value instanceof Date ? event.value : null);
                  setSelectedSlotKey('');
                }}
                showIcon
                dateFormat="dd/mm/yy"
                minDate={new Date()}
                placeholder="Chọn ngày mới"
                disabled={submittingReschedule}
              />
            </label>

            {!selectedVisitDate ? (
              <div className="profile-empty-state profile-empty-state--compact">
                <i className="pi pi-calendar-plus" />
                <h3>Chọn ngày mới</h3>
                <p>Chọn ngày khám mới để xem các khung giờ còn bác sĩ trống.</p>
              </div>
            ) : loadingSlots ? (
              <div className="profile-detail__loading">
                <i className="pi pi-spin pi-spinner" />
                <span>Đang tải khung giờ trống...</span>
              </div>
            ) : availableSlots.length ? (
              <div className="profile-slot-list" role="listbox" aria-label="Khung giờ trống">
                {availableSlots.map((slot) => {
                  const slotKey = getRescheduleSlotKey(slot);
                  return (
                    <button
                      key={slotKey}
                      type="button"
                      className={`profile-slot-option${selectedSlotKey === slotKey ? ' is-selected' : ''}`}
                      onClick={() => setSelectedSlotKey(slotKey)}
                      role="option"
                      aria-selected={selectedSlotKey === slotKey}
                    >
                      <span>{formatSlotTime(slot.startTime, slot.endTime)}</span>
                      <small>Còn {slot.availableCount} bác sĩ</small>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="profile-empty-state profile-empty-state--compact">
                <i className="pi pi-calendar-times" />
                <h3>Không còn bác sĩ trống trong ngày này</h3>
                <p>Chọn ngày khác để xem thêm khung giờ đổi lịch.</p>
              </div>
            )}

            <label className="profile-field" htmlFor="rescheduleReason">
              <span>Lý do đổi lịch</span>
              <InputTextarea
                id="rescheduleReason"
                value={rescheduleReason}
                onChange={(event) => setRescheduleReason(event.target.value)}
                rows={3}
                autoResize
                placeholder="Nhập lý do nếu cần"
              />
            </label>

            {rescheduleError && (
              <div className="profile-alert profile-alert--error">
                <i className="pi pi-exclamation-circle" />
                <span>{rescheduleError}</span>
              </div>
            )}

            <div className="profile-action-footer">
              <Button
                label="Đóng"
                icon="pi pi-times"
                outlined
                onClick={handleCloseReschedule}
                disabled={submittingReschedule}
              />
              <Button
                label={submittingReschedule ? 'Đang đổi lịch...' : 'Xác nhận đổi lịch'}
                icon="pi pi-check"
                onClick={handleSubmitReschedule}
                disabled={submittingReschedule || loadingSlots || !selectedRescheduleSlot}
              />
            </div>
          </section>
        )}
      </Dialog>
    </AppLayout>
  );
};

export default ProfilePage;