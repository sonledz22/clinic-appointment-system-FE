import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import AppImage from '@/components/common/AppImage';
import AppLayout from '@/components/layout/AppLayout';
import { appIcons } from '@/constants/appIcons';
import { APP_ROUTES } from '@/constants/appRoutes';
import { createAppointment } from '@/features/appointments/services/appointmentApi';
import { fetchAvailableSlotsBySpecialization, fetchDoctorSpecializations } from '@/features/doctors/services/doctorApi';
import { paymentApi, type PaymentResponse, type PaymentTiming } from '@/features/payments/services/paymentApi';
import { buildVietQrTransferContent, buildVietQrUrl } from '@/features/payments/utils/vietQr';
import type { Appointment } from '@/features/appointments/types/appointment.types';
import type { AvailableSlot } from '@/features/doctors/types/doctor';
import { doctors, type DoctorMock } from '@/mocks/doctors';
import { hospitals } from '@/mocks/hospitals';

export interface HomePageProps {}

interface QuickSelectOption {
  label: string;
  value: string;
}

const quickTags = ['Tim mạch', 'Da liễu', 'Nhi khoa', 'Sản phụ khoa', 'Tai mũi họng'];

const heroStats = [
  { value: '24+', label: 'Chuyên khoa', icon: 'pi pi-users' },
  { value: '5.000+', label: 'Lịch hẹn/tháng', icon: appIcons.appointment },
  { value: '4.8/5', label: 'Đánh giá TB', icon: appIcons.star },
];

const specialtyCards = [
  { label: 'Tim mạch', icon: 'pi pi-heart-fill', tone: 'rose' },
  { label: 'Sản phụ khoa', icon: 'pi pi-users', tone: 'violet' },
  { label: 'Nhi khoa', icon: 'pi pi-face-smile', tone: 'orange' },
  { label: 'Da liễu', icon: 'pi pi-sun', tone: 'amber' },
  { label: 'Cơ xương khớp', icon: 'pi pi-wrench', tone: 'blue' },
  { label: 'Tai mũi họng', icon: 'pi pi-volume-up', tone: 'red' },
  { label: 'Mắt', icon: 'pi pi-eye', tone: 'green' },
  { label: 'Khác', icon: 'pi pi-ellipsis-h', tone: 'slate' },
];

const trustedProviders = [
  {
    name: 'BV Chợ Rẫy',
    area: 'TP. Hồ Chí Minh',
    rating: 4.8,
    image: hospitals[1]?.image,
  },
  {
    name: 'BV Tâm Anh',
    area: 'Hà Nội',
    rating: 4.9,
    image: hospitals[0]?.image,
  },
  {
    name: 'BV Vinmec',
    area: 'TP. Hồ Chí Minh',
    rating: 4.8,
    image: hospitals[2]?.image,
  },
  {
    name: 'Phòng khám Tâm Đức',
    area: 'TP. Hồ Chí Minh',
    rating: 4.7,
    image: doctors[0]?.image,
  },
];

const healthPackages = [
  { name: 'Gói khám tổng quát cơ bản', price: '1.200.000đ', icon: appIcons.calendar },
  { name: 'Gói khám sức khỏe doanh nghiệp', price: '2.450.000đ', icon: appIcons.users },
  { name: 'Gói khám tầm soát ung thư', price: '4.800.000đ', icon: 'pi pi-shield' },
];

const healthGuides = [
  {
    title: '5 thói quen đơn giản giúp tim khỏe mỗi ngày',
    publishedAt: '12/06/2026',
    category: 'Tim mạch',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=240',
  },
  {
    title: 'Dinh dưỡng hợp lý cho trẻ trong mùa hè',
    publishedAt: '10/06/2026',
    category: 'Nhi khoa',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=240',
  },
  {
    title: 'Những điều cần biết về khám sức khỏe định kỳ',
    publishedAt: '08/05/2026',
    category: 'Sức khỏe tổng quát',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=240',
  },
];

const slotDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const slotTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

const formatSlotLabel = (slot: AvailableSlot) => {
  const startTime = new Date(slot.startTime);
  const endTime = new Date(slot.endTime);

  if (!isValidDate(startTime) || !isValidDate(endTime)) {
    return `${slot.startTime} - ${slot.endTime}`;
  }

  return `${slotTimeFormatter.format(startTime)} - ${slotTimeFormatter.format(endTime)} ngày ${slotDateFormatter.format(startTime)}`;
};

const formatCurrency = (amount: number, currency = 'VND') =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const paymentLabels: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thanh toán lỗi',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
};

const formatDateForApi = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getSlotKey = (slot: AvailableSlot) => `${slot.startTime}|${slot.endTime}`;

const HomePage = ({}: Readonly<HomePageProps>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorMock>(doctors[0]);
  const [specializationOptions, setSpecializationOptions] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedVisitDate, setSelectedVisitDate] = useState<Date | null>(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState<string>('');
  const [bookingReason, setBookingReason] = useState('');
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [quickBookingError, setQuickBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentChoiceCompleted, setPaymentChoiceCompleted] = useState(false);
  const [favoriteDoctorIds, setFavoriteDoctorIds] = useState<string[]>([]);

  useEffect(() => {
    let isActive = true;

    setLoadingSpecializations(true);
    fetchDoctorSpecializations()
      .then((specializations) => {
        if (!isActive) return;
        setSpecializationOptions(specializations);
      })
      .catch(() => {
        if (!isActive) return;
        setQuickBookingError('Không thể tải danh sách chuyên khoa.');
      })
      .finally(() => {
        if (!isActive) return;
        setLoadingSpecializations(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    setSelectedSlotKey('');
    setAvailableSlots([]);
    setBookingSuccess(false);
    setCreatedAppointment(null);
    setShowPaymentDialog(false);
    setPayment(null);
    setPaymentError('');
    setCreatingPayment(false);
    setConfirmingPayment(false);
    setPaymentChoiceCompleted(false);
    setQuickBookingError('');

    if (!selectedSpecialty || !selectedVisitDate) {
      return () => {
        isActive = false;
      };
    }

    setLoadingSlots(true);
    fetchAvailableSlotsBySpecialization(selectedSpecialty, formatDateForApi(selectedVisitDate))
      .then((slots) => {
        if (!isActive) return;
        setAvailableSlots(slots);
      })
      .catch(() => {
        if (!isActive) return;
        setQuickBookingError('Không thể tải khung giờ trống theo chuyên khoa và ngày đã chọn.');
      })
      .finally(() => {
        if (!isActive) return;
        setLoadingSlots(false);
      });

    return () => {
      isActive = false;
    };
  }, [selectedSpecialty, selectedVisitDate]);

  const featuredDoctors = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return doctors.slice(0, 4);

    const matches = doctors.filter((doctor) =>
      [doctor.name, doctor.specialty, doctor.workplace, doctor.area].some((value) => value.toLowerCase().includes(keyword))
    );

    return matches.length ? matches.slice(0, 4) : doctors.slice(0, 4);
  }, [searchTerm]);

  const specializationSelectOptions = useMemo(
    () =>
      specializationOptions.map((specialization) => ({
        label: specialization,
        value: specialization,
      })),
    [specializationOptions],
  );

  const slotOptions = useMemo(
    () =>
      [...availableSlots]
        .filter((slot) => slot.availableCount > 0)
        .sort((firstSlot, secondSlot) => new Date(firstSlot.startTime).getTime() - new Date(secondSlot.startTime).getTime())
        .map((slot) => ({
          label: `${formatSlotLabel(slot)} - còn ${slot.availableCount} bác sĩ`,
          value: getSlotKey(slot),
        })),
    [availableSlots],
  );

  const selectedSlot = useMemo(
    () => availableSlots.find((slot) => getSlotKey(slot) === selectedSlotKey) ?? null,
    [availableSlots, selectedSlotKey],
  );
  const paymentQrUrl = useMemo(() => payment ? buildVietQrUrl(payment.amount, payment.id) : '', [payment]);
  const paymentTransferContent = payment ? buildVietQrTransferContent(payment.id) : '';

  const bookingReady = Boolean(selectedSpecialty && selectedVisitDate && selectedSlot);
  const waitingPaymentChoice = Boolean(createdAppointment && !paymentChoiceCompleted && !bookingSuccess);

  const getApiErrorMessage = (reason: unknown, fallback: string) => {
    if (axios.isAxiosError(reason) && typeof reason.response?.data?.message === 'string') {
      return reason.response.data.message;
    }

    return fallback;
  };

  const resetPaymentFlow = () => {
    setShowPaymentDialog(false);
    setPayment(null);
    setPaymentError('');
    setCreatingPayment(false);
    setConfirmingPayment(false);
    setPaymentChoiceCompleted(false);
  };

  const handleBook = (doctor: DoctorMock) => {
    setSelectedDoctor(doctor);
    if (specializationOptions.includes(doctor.specialty)) {
      setSelectedSpecialty(doctor.specialty);
    }
    setBookingSuccess(false);
    setCreatedAppointment(null);
    resetPaymentFlow();
  };

  const handleSubmit = async () => {
    if (!selectedSpecialty || !selectedVisitDate || !selectedSlot) return;

    setCreatingAppointment(true);
    setQuickBookingError('');
    setBookingSuccess(false);
    setPaymentChoiceCompleted(false);
    setPayment(null);
    setPaymentError('');

    try {
      const reason = bookingReason.trim();
      const appointment = await createAppointment({
        specialization: selectedSpecialty,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        ...(reason ? { reason } : {}),
        bookingSource: 'WEB',
      });
      setCreatedAppointment(appointment);
      setShowPaymentDialog(true);
    } catch (reason) {
      setQuickBookingError('Không thể tạo lịch khám. Vui lòng kiểm tra chuyên khoa, ngày và khung giờ rồi thử lại.');
    } finally {
      setCreatingAppointment(false);
    }
  };

  const handleCreatePayment = async (paymentTiming: PaymentTiming) => {
    if (!createdAppointment) return;

    setCreatingPayment(true);
    setPaymentError('');

    try {
      const createdPayment = await paymentApi.createPayment({
        appointmentId: createdAppointment.id,
        paymentTiming,
      });

      setPayment(createdPayment);

      if (paymentTiming === 'PAY_LATER') {
        setPaymentChoiceCompleted(true);
        setBookingSuccess(true);
        setShowPaymentDialog(false);
      }
    } catch (reason) {
      if (axios.isAxiosError(reason) && reason.response?.status === 409) {
        try {
          const existingPayment = await paymentApi.getPaymentByAppointment(createdAppointment.id);
          setPayment(existingPayment);

          if (paymentTiming === 'PAY_LATER') {
            setPaymentChoiceCompleted(true);
            setBookingSuccess(true);
            setShowPaymentDialog(false);
          }
        } catch (lookupReason) {
          setPaymentError(getApiErrorMessage(lookupReason, 'Không thể tải thông tin thanh toán đã tạo.'));
        }
      } else {
        setPaymentError(getApiErrorMessage(reason, 'Không thể tạo thanh toán. Vui lòng thử lại.'));
      }
    } finally {
      setCreatingPayment(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!payment) return;

    setConfirmingPayment(true);
    setPaymentError('');

    try {
      const updatedPayment = await paymentApi.confirmPaid(payment.id);
      setPayment(updatedPayment);
      setPaymentChoiceCompleted(true);
      setBookingSuccess(true);
      setShowPaymentDialog(false);
    } catch (reason) {
      setPaymentError(getApiErrorMessage(reason, 'Không thể xác nhận thanh toán. Vui lòng thử lại.'));
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleClosePaymentDialog = () => {
    if (creatingPayment || confirmingPayment) return;
    setShowPaymentDialog(false);
    setPaymentError('');
  };

  const renderQuickOption = (option: QuickSelectOption, selectedValue: string) => (
    <div className={`quick-booking-option${option.value === selectedValue ? ' is-selected' : ''}`}>
      <span className="quick-booking-option__label">{option.label}</span>
      {option.value === selectedValue ? <i className="pi pi-check quick-booking-option__check" aria-hidden="true" /> : null}
    </div>
  );

  const renderQuickValue = (option: QuickSelectOption | null, placeholder: string) => (
    <span className={`quick-booking-value${option ? '' : ' is-placeholder'}`}>{option?.label ?? placeholder}</span>
  );

  const toggleFavorite = (doctorId: string) => {
    setFavoriteDoctorIds((current) =>
      current.includes(doctorId) ? current.filter((id) => id !== doctorId) : [...current, doctorId]
    );
  };

  return (
    <AppLayout>
      <div className="home-page">
        <section className="home-hero" aria-labelledby="home-hero-title">
          <div className="home-hero__copy">
            <Tag className="home-hero__badge" icon="pi pi-shield" value="Nền tảng đặt lịch khám trực tuyến #1 Việt Nam" />
            <h1 id="home-hero-title">
              Chăm sóc sức khỏe
              <span>dễ dàng, nhanh chóng</span>
            </h1>
            <p>
              Tìm bác sĩ, bệnh viện, phòng khám và đặt lịch khám chỉ trong vài phút. Chúng tôi đồng hành cùng bạn trên hành trình
              sống khỏe mỗi ngày.
            </p>

            <div className="home-hero__search" role="search">
              <span className="home-hero__search-icon">
                <i className={appIcons.search} aria-hidden="true" />
              </span>
              <InputText
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm bác sĩ, chuyên khoa, bệnh viện, phòng khám..."
                aria-label="Tìm bác sĩ, chuyên khoa, bệnh viện, phòng khám"
              />
              <Button icon={appIcons.search} aria-label="Tìm kiếm" onClick={() => setSearchTerm(searchTerm.trim())} />
            </div>

            <div className="home-hero__tags" aria-label="Tìm kiếm phổ biến">
              <span>Tìm kiếm phổ biến:</span>
              {quickTags.map((tag) => (
                <button key={tag} type="button" onClick={() => setSearchTerm(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="home-hero__visual">
            <div className="home-hero__visual-orbit home-hero__visual-orbit--outer" />
            <div className="home-hero__visual-orbit home-hero__visual-orbit--inner" />
            <div className="home-hero__doctor-frame">
              <AppImage className="home-hero__doctor-image" src={selectedDoctor.image} alt="Bác sĩ Đặtkhámnhanh" fallbackLabel="Bác sĩ" />
            </div>
            <div className="home-hero__floating home-hero__floating--check">
              <i className="pi pi-check" aria-hidden="true" />
            </div>
            <div className="home-hero__floating home-hero__floating--plus">
              <i className="pi pi-plus" aria-hidden="true" />
            </div>
            <div className="home-hero__heartbeat" aria-hidden="true" />

            <div className="home-hero__stats" aria-label="Số liệu nổi bật">
              {heroStats.map((stat) => (
                <div key={stat.label} className="home-stat-card">
                  <span className="home-stat-card__icon">
                    <i className={stat.icon} aria-hidden="true" />
                  </span>
                  <div className="home-stat-card__content">
                    <strong className="home-stat-card__value">{stat.value}</strong>
                    <small className="home-stat-card__label">{stat.label}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="quick-booking-card" aria-labelledby="quick-booking-title">
            <h2 id="quick-booking-title">Đặt lịch khám nhanh</h2>
            <p className="quick-booking-card__subtitle">Chọn chuyên khoa, ngày khám và khung giờ còn bác sĩ trống</p>
            <div className="quick-booking-card__field">
              <label htmlFor="quick-specialty">
                1. Chuyên khoa
              </label>
              <Dropdown
                className="quick-booking-card__select"
                panelClassName="quick-booking-card__dropdown-panel"
                inputId="quick-specialty"
                value={selectedSpecialty}
                options={specializationSelectOptions}
                optionLabel="label"
                optionValue="value"
                itemTemplate={(option) => renderQuickOption(option, selectedSpecialty)}
                valueTemplate={(option) =>
                  renderQuickValue(option, loadingSpecializations ? 'Đang tải chuyên khoa...' : specializationOptions.length ? 'Chọn chuyên khoa' : 'Không có chuyên khoa')
                }
                onChange={(event) => {
                  setSelectedSpecialty(event.value ?? '');
                  setBookingSuccess(false);
                  setCreatedAppointment(null);
                  resetPaymentFlow();
                }}
                placeholder={loadingSpecializations ? 'Đang tải chuyên khoa...' : specializationOptions.length ? 'Chọn chuyên khoa' : 'Không có chuyên khoa'}
                disabled={loadingSpecializations || !specializationOptions.length}
                loading={loadingSpecializations}
              />
            </div>
            <div className="quick-booking-card__field">
              <label htmlFor="quick-date">
                2. Ngày khám
              </label>
              <Calendar
                inputId="quick-date"
                className="quick-booking-card__select"
                value={selectedVisitDate}
                onChange={(event) => {
                  setSelectedVisitDate(event.value instanceof Date ? event.value : null);
                  setBookingSuccess(false);
                  setCreatedAppointment(null);
                  resetPaymentFlow();
                }}
                placeholder={!selectedSpecialty ? 'Chọn chuyên khoa trước' : 'Chọn ngày khám'}
                dateFormat="dd/mm/yy"
                minDate={new Date()}
                showIcon
                disabled={!selectedSpecialty}
              />
            </div>
            <div className="quick-booking-card__field">
              <label htmlFor="quick-slot">
                Khung giờ khám
              </label>
              <Dropdown
                className="quick-booking-card__select"
                panelClassName="quick-booking-card__dropdown-panel"
                inputId="quick-slot"
                value={selectedSlotKey}
                options={slotOptions}
                optionLabel="label"
                optionValue="value"
                itemTemplate={(option) => renderQuickOption(option, selectedSlotKey)}
                valueTemplate={(option) =>
                  renderQuickValue(
                    option,
                    !selectedSpecialty
                      ? 'Chọn chuyên khoa trước'
                      : !selectedVisitDate
                      ? 'Chọn ngày khám trước'
                      : loadingSlots
                      ? 'Đang tải khung giờ...'
                      : slotOptions.length
                      ? 'Chọn khung giờ còn trống'
                      : 'Không còn bác sĩ trống trong ngày này',
                  )
                }
                onChange={(event) => {
                  setSelectedSlotKey(event.value ?? '');
                  setBookingSuccess(false);
                  setCreatedAppointment(null);
                  resetPaymentFlow();
                }}
                placeholder={
                  !selectedSpecialty
                    ? 'Chọn chuyên khoa trước'
                    : !selectedVisitDate
                    ? 'Chọn ngày khám trước'
                    : loadingSlots
                    ? 'Đang tải khung giờ...'
                    : slotOptions.length
                    ? 'Chọn khung giờ còn trống'
                    : 'Không còn bác sĩ trống trong ngày này'
                }
                disabled={!selectedSpecialty || !selectedVisitDate || loadingSlots || !slotOptions.length}
                loading={loadingSlots}
              />
              {selectedSpecialty && selectedVisitDate && !loadingSlots && !slotOptions.length && !quickBookingError ? (
                <small className="quick-booking-card__empty-slot">Không còn bác sĩ trống trong ngày này.</small>
              ) : null}
            </div>
            <div className="quick-booking-card__field">
              <label htmlFor="quick-reason">
                3. Lý do khám
              </label>
              <InputTextarea
                id="quick-reason"
                className="quick-booking-card__reason"
                value={bookingReason}
                onChange={(event) => {
                  setBookingReason(event.target.value);
                  setBookingSuccess(false);
                  setCreatedAppointment(null);
                  resetPaymentFlow();
                }}
                placeholder="Nhập lý do khám nếu cần"
                maxLength={500}
                rows={3}
                autoResize
                disabled={creatingAppointment}
              />
              <span className="quick-booking-card__counter">{bookingReason.length}/500</span>
            </div>
            {quickBookingError ? (
              <div className="error-message quick-booking-card__error">
                <i className="pi pi-exclamation-triangle" aria-hidden="true" />
                {quickBookingError}
              </div>
            ) : null}
            {bookingSuccess && selectedSlot ? (
              <div className="success-message quick-booking-card__success">
                <i className="pi pi-check-circle" aria-hidden="true" />
                <span>
                  Đã xác nhận lịch khám {formatSlotLabel(selectedSlot)}.
                  {payment?.paymentTiming === 'PAY_LATER' ? ' Thanh toán tại phòng khám.' : ''}
                  {payment?.status === 'PAID' ? ' Đã thanh toán.' : ''}
                </span>
              </div>
            ) : null}
            <Button
              label={waitingPaymentChoice ? 'Chọn thanh toán' : 'Đặt lịch'}
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={waitingPaymentChoice ? () => setShowPaymentDialog(true) : handleSubmit}
              loading={creatingAppointment}
              disabled={!bookingReady || loadingSlots || creatingAppointment}
            />
          </aside>
        </section>

        <section className="home-section-grid home-section-grid--top">
          <div className="home-panel home-panel--doctors">
            <div className="home-section-heading">
              <h2>Bác sĩ nổi bật</h2>
              <Link to={APP_ROUTES.DOCTORS}>Xem tất cả</Link>
            </div>
            <div className="home-doctor-grid">
              {featuredDoctors.map((doctor) => {
                const isFavorite = favoriteDoctorIds.includes(doctor.id);

                return (
                  <article key={doctor.id} className="home-doctor-card">
                    <div className="home-doctor-card__media">
                      <AppImage className="home-doctor-card__image" src={doctor.image} alt={doctor.name} fallbackLabel={doctor.name} />
                      <Tag className="home-doctor-card__tag" value={doctor.specialty} severity="info" />
                      <button
                        type="button"
                        className={`home-doctor-card__favorite${isFavorite ? ' is-active' : ''}`}
                        aria-label={`Yêu thích ${doctor.name}`}
                        onClick={() => toggleFavorite(doctor.id)}
                      >
                        <i className={isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="home-doctor-card__body">
                      <div className="home-doctor-card__meta">
                        <span>
                          <i className={appIcons.star} aria-hidden="true" />
                          {doctor.rating.toFixed(1)}
                        </span>
                        <small>{doctor.experience}</small>
                      </div>
                      <h3>{doctor.name}</h3>
                      <p>
                        <i className={appIcons.location} aria-hidden="true" />
                        {doctor.area}
                      </p>
                    </div>
                    <div className="home-doctor-card__actions">
                      <Button icon={appIcons.info} outlined aria-label={`Xem chi tiết ${doctor.name}`} onClick={() => setSelectedDoctor(doctor)} />
                      <Button label="Đặt lịch khám" icon={appIcons.appointment} onClick={() => handleBook(doctor)} />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="home-panel home-panel--specialties">
            <div className="home-section-heading">
              <h2>Danh mục chuyên khoa</h2>
              <Link to={APP_ROUTES.DOCTORS}>Xem tất cả</Link>
            </div>
            <div className="home-specialty-grid">
              {specialtyCards.map((specialty) => (
                <button key={specialty.label} type="button" className="home-specialty-card" onClick={() => setSearchTerm(specialty.label)}>
                  <span className={`home-specialty-card__icon home-specialty-card__icon--${specialty.tone}`}>
                    <i className={specialty.icon} aria-hidden="true" />
                  </span>
                  <strong>{specialty.label}</strong>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="home-dashboard-grid">
          <div className="home-panel home-panel--providers">
            <div className="home-section-heading">
              <h2>Bệnh viện & phòng khám uy tín</h2>
              <Link to={APP_ROUTES.HOSPITALS}>Xem tất cả</Link>
            </div>
            <div className="home-provider-grid">
              {trustedProviders.map((provider) => (
                <article key={provider.name} className="home-provider-card">
                  <AppImage className="home-provider-card__image" src={provider.image} alt={provider.name} fallbackLabel={provider.name} />
                  <div>
                    <h3>{provider.name}</h3>
                    <p>{provider.area}</p>
                    <span>
                      <i className={appIcons.star} aria-hidden="true" />
                      {provider.rating.toFixed(1)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="home-panel home-panel--packages">
            <div className="home-section-heading">
              <h2>Gói khám sức khỏe</h2>
              <Link to={APP_ROUTES.HEALTH_PACKAGES}>Xem tất cả</Link>
            </div>
            <div className="home-package-list">
              {healthPackages.map((item) => (
                <div key={item.name} className="home-package-item">
                  <span>
                    <i className={item.icon} aria-hidden="true" />
                  </span>
                  <strong>{item.name}</strong>
                  <em>{item.price}</em>
                </div>
              ))}
            </div>
          </div>

          <div className="home-panel home-panel--guides">
            <div className="home-section-heading">
              <h2>Cẩm nang sức khỏe</h2>
              <Link to={APP_ROUTES.GUIDES}>Xem tất cả</Link>
            </div>
            <div className="home-guide-list">
              {healthGuides.map((guide) => (
                <article key={guide.title} className="home-guide-item">
                  <AppImage className="home-guide-item__image" src={guide.image} alt={guide.title} fallbackLabel={guide.category} />
                  <div>
                    <h3>{guide.title}</h3>
                    <p>
                      {guide.publishedAt} <span /> {guide.category}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="home-app-card">
            <div>
              <span className="home-app-card__eyebrow">Tải ứng dụng</span>
              <h2>Đặtkhámnhanh</h2>
              <p>Đặt lịch nhanh hơn, theo dõi lịch hẹn mọi lúc mọi nơi.</p>
            </div>
            <div className="home-app-card__phone" aria-hidden="true">
              <i className="pi pi-mobile" />
              <span className="home-app-card__phone-badge home-app-card__phone-badge--heart">
                <i className="pi pi-heart-fill" />
              </span>
              <span className="home-app-card__phone-badge home-app-card__phone-badge--calendar">
                <i className={appIcons.appointment} />
              </span>
            </div>
            <div className="home-app-card__badges">
              <span>
                <i className="pi pi-apple" aria-hidden="true" />
                App Store
              </span>
              <span>
                <i className="pi pi-google" aria-hidden="true" />
                Google Play
              </span>
            </div>
          </div>
        </section>
      </div>

      <Dialog
        visible={showPaymentDialog}
        header="Thanh toán lịch khám"
        modal
        dismissableMask={!creatingPayment && !confirmingPayment}
        className="profile-action-dialog profile-payment-dialog"
        onHide={handleClosePaymentDialog}
      >
        {createdAppointment && selectedSlot ? (
          <section className="profile-action-modal profile-payment-modal">
            <div className="profile-action-summary">
              <strong>Lịch khám vừa tạo</strong>
              <span>{formatSlotLabel(selectedSlot)}</span>
            </div>

            {!payment ? (
              <div className="booking-payment-choice">
                <Button
                  label={creatingPayment ? 'Đang tạo thanh toán...' : 'Thanh toán ngay'}
                  icon="pi pi-qrcode"
                  onClick={() => handleCreatePayment('PAY_NOW')}
                  disabled={creatingPayment}
                />
                <Button
                  label="Thanh toán tại phòng khám"
                  icon="pi pi-building"
                  outlined
                  onClick={() => handleCreatePayment('PAY_LATER')}
                  disabled={creatingPayment}
                />
              </div>
            ) : (
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
            )}

            {paymentError ? (
              <div className="profile-alert profile-alert--error">
                <i className="pi pi-exclamation-circle" />
                <span>{paymentError}</span>
              </div>
            ) : null}

            <div className="profile-action-footer">
              <Button
                label="Đóng"
                icon="pi pi-times"
                outlined
                onClick={handleClosePaymentDialog}
                disabled={creatingPayment || confirmingPayment}
              />
              {payment ? (
                <Button
                  label={confirmingPayment ? 'Đang xác nhận...' : 'Tôi đã thanh toán'}
                  icon="pi pi-check"
                  onClick={handleConfirmPayment}
                  disabled={creatingPayment || confirmingPayment || payment.status === 'PAID'}
                />
              ) : null}
            </div>
          </section>
        ) : null}
      </Dialog>
    </AppLayout>
  );
};

export default HomePage;
