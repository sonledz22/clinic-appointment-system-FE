import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import AppImage from '@/components/common/AppImage';
import AppLayout from '@/components/layout/AppLayout';
import SearchBar from '@/components/ui/SearchBar';
import DoctorCard from '@/features/doctors/components/DoctorCard';
import { APP_ROUTES } from '@/constants/appRoutes';
import { appIcons } from '@/constants/appIcons';
import { doctors, type DoctorMock } from '@/mocks/doctors';

export interface HomePageProps {}

const timeOptions = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00', '15:00 - 16:00'];

const HomePage = ({}: Readonly<HomePageProps>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorMock>(doctors[0]);
  const [bookingDate, setBookingDate] = useState<Date | null>(new Date(2026, 5, 25));
  const [bookingTime, setBookingTime] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const featuredDoctors = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return doctors.slice(0, 3);

    return doctors.filter((doctor) =>
      [doctor.name, doctor.specialty, doctor.workplace, doctor.area].some((value) => value.toLowerCase().includes(keyword))
    );
  }, [searchTerm]);

  const handleBook = (doctor: DoctorMock) => {
    setSelectedDoctor(doctor);
    setBookingSuccess(false);
  };

  const handleSubmit = () => {
    if (!bookingTime || !bookingDate) return;
    setBookingSuccess(true);
  };

  return (
    <AppLayout>
      <section className="home-hero">
        <div className="home-hero__content">
          <Tag value="Nền tảng đặt lịch khám trực tuyến" severity="info" />
          <h1>Chọn bác sĩ phù hợp và đặt lịch khám trong vài phút</h1>
          <p>Tìm bác sĩ, bệnh viện, phòng khám và gói khám theo nhu cầu. Thông tin rõ ràng, thao tác nhanh, lịch hẹn dễ quản lý.</p>
          <div className="home-hero__search">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Tìm bác sĩ, chuyên khoa, bệnh viện..." />
            <Button label="Tìm kiếm" icon={appIcons.search} />
          </div>
        </div>
        <div className="home-hero__panel" aria-label="Tóm tắt dịch vụ">
          <div><strong>24+</strong><span>Chuyên khoa</span></div>
          <div><strong>5000+</strong><span>Lịch hẹn hỗ trợ</span></div>
          <div><strong>4.8/5</strong><span>Đánh giá trung bình</span></div>
        </div>
      </section>

      <section className="page-section two-column-section">
        <div>
          <div className="section-heading">
            <span>Bác sĩ nổi bật</span>
            <h2>Đặt lịch với chuyên gia được đánh giá cao</h2>
          </div>
          <div className="entity-grid entity-grid--two">
            {featuredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} onViewDetails={setSelectedDoctor} onBook={handleBook} />
            ))}
          </div>
        </div>

        <aside className="booking-panel">
          <div className="booking-panel__doctor">
            <AppImage className="booking-panel__avatar" src={selectedDoctor.image} alt={selectedDoctor.name} fallbackLabel={selectedDoctor.name} />
            <div>
              <Tag value={selectedDoctor.specialty} severity="info" />
              <h3>{selectedDoctor.name}</h3>
              <p>{selectedDoctor.experience}</p>
            </div>
          </div>

          <p>{selectedDoctor.introduction}</p>
          <div className="booking-panel__info">
            <span><i className={appIcons.location} aria-hidden="true" /> {selectedDoctor.workplace}</span>
            <strong>{selectedDoctor.price}</strong>
          </div>

          <div className="booking-form">
            <label>Ngày khám</label>
            <Calendar value={bookingDate} onChange={(event) => setBookingDate(event.value as Date | null)} showIcon />
            <label>Khung giờ</label>
            <Dropdown value={bookingTime} options={timeOptions} onChange={(event) => setBookingTime(event.value)} placeholder="Chọn khung giờ" />
            {bookingSuccess ? (
              <div className="success-message"><i className="pi pi-check-circle" aria-hidden="true" /> Đặt khám thành công. Vui lòng kiểm tra thông tin lịch hẹn.</div>
            ) : null}
            <Button label="Đặt khám bác sĩ ngay" icon={appIcons.appointment} onClick={handleSubmit} disabled={!bookingTime || !bookingDate} />
          </div>
        </aside>
      </section>

      <section className="page-section quick-links">
        <Link to={APP_ROUTES.DOCTORS}><i className={appIcons.doctor} /> Tìm bác sĩ</Link>
        <Link to={APP_ROUTES.HOSPITALS}><i className={appIcons.hospital} /> Bệnh viện</Link>
        <Link to={APP_ROUTES.CLINICS}><i className={appIcons.clinic} /> Phòng khám</Link>
        <Link to={APP_ROUTES.HEALTH_PACKAGES}><i className={appIcons.package} /> Gói khám</Link>
      </section>
    </AppLayout>
  );
};

export default HomePage;