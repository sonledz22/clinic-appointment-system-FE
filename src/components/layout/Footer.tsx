import { APP_ROUTES } from '@/constants/appRoutes';
import { Link } from 'react-router-dom';

export interface FooterProps {}

const Footer = ({}: Readonly<FooterProps>) => (
  <footer className="app-footer">
    <div className="app-footer__inner">
      <span>© 2026 Đặtkhámnhanh. Nền tảng đặt lịch khám trực tuyến.</span>
      <div>
        <Link to={APP_ROUTES.GUIDES}>Cẩm nang</Link>
        <Link to={APP_ROUTES.DOCTORS}>Tìm bác sĩ</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
