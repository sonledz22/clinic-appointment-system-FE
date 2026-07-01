import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import AppImage from '@/components/common/AppImage';
import AppLayout from '@/components/layout/AppLayout';
import { appIcons } from '@/constants/appIcons';
import { APP_ROUTES } from '@/constants/appRoutes';
import { doctors, type DoctorMock } from '@/mocks/doctors';
import { hospitals } from '@/mocks/hospitals';

export interface HomePageProps {}

const specialtyOptions = ['Tim mạch', 'Da liễu', 'Nhi khoa', 'Sản phụ khoa', 'Tai mũi họng', 'Cơ xương khớp', 'Mắt'];
const facilityOptions = ['BV Chợ Rẫy', 'BV Tâm Anh', 'BV Vinmec', 'Phòng khám Tâm Đức'];
const timeOptions = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00', '15:00 - 16:00'];
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

const HomePage = ({}: Readonly<HomePageProps>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorMock>(doctors[0]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<Date | null>(new Date(2026, 5, 25));
  const [bookingTime, setBookingTime] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [favoriteDoctorIds, setFavoriteDoctorIds] = useState<string[]>([]);

  const featuredDoctors = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return doctors.slice(0, 4);

    const matches = doctors.filter((doctor) =>
      [doctor.name, doctor.specialty, doctor.workplace, doctor.area].some((value) => value.toLowerCase().includes(keyword))
    );

    return matches.length ? matches.slice(0, 4) : doctors.slice(0, 4);
  }, [searchTerm]);

  const bookingReady = Boolean(bookingDate && bookingTime);

  const handleBook = (doctor: DoctorMock) => {
    setSelectedDoctor(doctor);
    setSelectedSpecialty(doctor.specialty);
    setSelectedFacility(doctor.workplace);
    setBookingSuccess(false);
  };

  const handleSubmit = () => {
    if (!bookingReady) return;
    setBookingSuccess(true);
  };

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
            <div className="quick-booking-card__field">
              <label htmlFor="quick-specialty">
                <i className="pi pi-id-card" aria-hidden="true" />
                Chuyên khoa
              </label>
              <Dropdown
                inputId="quick-specialty"
                value={selectedSpecialty}
                options={specialtyOptions}
                onChange={(event) => setSelectedSpecialty(event.value)}
                placeholder="Chọn chuyên khoa"
              />
            </div>
            <div className="quick-booking-card__field">
              <label htmlFor="quick-facility">
                <i className={appIcons.location} aria-hidden="true" />
                Địa điểm
              </label>
              <Dropdown
                inputId="quick-facility"
                value={selectedFacility}
                options={facilityOptions}
                onChange={(event) => setSelectedFacility(event.value)}
                placeholder="Chọn bệnh viện / phòng khám"
              />
            </div>
            <div className="quick-booking-card__field">
              <label htmlFor="quick-date">
                <i className={appIcons.appointment} aria-hidden="true" />
                Ngày khám
              </label>
              <Calendar inputId="quick-date" value={bookingDate} onChange={(event) => setBookingDate(event.value as Date | null)} showIcon />
            </div>
            <div className="quick-booking-card__field">
              <label htmlFor="quick-time">
                <i className="pi pi-clock" aria-hidden="true" />
                Thời gian
              </label>
              <Dropdown
                inputId="quick-time"
                value={bookingTime}
                options={timeOptions}
                onChange={(event) => setBookingTime(event.value)}
                placeholder="Chọn thời gian"
              />
            </div>
            {bookingSuccess ? (
              <div className="success-message quick-booking-card__success">
                <i className="pi pi-check-circle" aria-hidden="true" />
                Đặt khám thành công. Vui lòng kiểm tra thông tin lịch hẹn.
              </div>
            ) : null}
            <Button
              label="Tìm bác sĩ phù hợp"
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={handleSubmit}
              disabled={!bookingReady}
            />
            <p className="quick-booking-card__note">
              <i className="pi pi-lock" aria-hidden="true" />
              Thông tin bảo mật <span /> Hủy miễn phí
            </p>
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
    </AppLayout>
  );
};

export default HomePage;
