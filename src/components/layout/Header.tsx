import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Sidebar as PrimeSidebar } from 'primereact/sidebar';
import Sidebar from '@/components/layout/Sidebar';
import { appIcons } from '@/constants/appIcons';
import { APP_ROUTES, PATIENT_NAV_ITEMS } from '@/constants/appRoutes';
import { doLogout, getUserInfo } from '@/services/keycloak';

export interface HeaderProps {}

const Header = ({}: Readonly<HeaderProps>) => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const location = useLocation();
  const userInfo = getUserInfo();
  const displayName = userInfo.name || 'Người dùng';

  const isActive = (path: string) => (path === APP_ROUTES.HOME ? location.pathname === path : location.pathname.startsWith(path));

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to={APP_ROUTES.HOME} className="app-brand" aria-label="Về trang chủ">
          <span className="app-brand__mark">
            <i className="pi pi-heart-fill" aria-hidden="true" />
          </span>
          <span>Đặtkhámnhanh</span>
        </Link>

        <div className="app-header__desktop-nav">
          <Sidebar navItems={PATIENT_NAV_ITEMS} isActive={isActive} />
        </div>

        <div className="app-header__user">
          <div className="app-header__user-info">
            <span>Bệnh nhân</span>
            <strong>{displayName}</strong>
          </div>
          <Button label="Đăng xuất" icon={appIcons.logout} severity="danger" outlined size="small" onClick={() => doLogout()} />
          <Button className="app-header__menu-button" icon="pi pi-bars" text rounded aria-label="Mở menu" onClick={() => setMobileMenuVisible(true)} />
        </div>
      </div>

      <PrimeSidebar visible={mobileMenuVisible} position="right" onHide={() => setMobileMenuVisible(false)} header="Đặtkhámnhanh">
        <div className="app-mobile-sidebar">
          <Sidebar navItems={PATIENT_NAV_ITEMS} isActive={isActive} onNavigate={() => setMobileMenuVisible(false)} />
          <div className="app-mobile-sidebar__account">
            <span>Bệnh nhân</span>
            <strong>{displayName}</strong>
            <Button label="Đăng xuất" icon={appIcons.logout} severity="danger" outlined onClick={() => doLogout()} />
          </div>
        </div>
      </PrimeSidebar>
    </header>
  );
};

export default Header;