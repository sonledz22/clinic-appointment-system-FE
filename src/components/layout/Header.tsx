import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Sidebar as PrimeSidebar } from 'primereact/sidebar';
import Sidebar from '@/components/layout/Sidebar';
import { appIcons } from '@/constants/appIcons';
import { APP_ROUTES, PATIENT_NAV_ITEMS } from '@/constants/appRoutes';
import { useAuthStore } from '@/stores/auth.store';

export interface HeaderProps {}

const Header = ({}: Readonly<HeaderProps>) => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const isActive = (path: string) => (path === APP_ROUTES.HOME ? location.pathname === path : location.pathname.startsWith(path));

  const handleLogout = async () => {
    await logout();
    setMobileMenuVisible(false);
    navigate(APP_ROUTES.LOGIN, { replace: true });
  };

  const renderAccountControls = () =>
    isAuthenticated ? (
      <>
        <div className="app-header__user-info">
          <span>Đã đăng nhập</span>
          <strong>{user?.email}</strong>
        </div>
        <Button className="app-header__logout" type="button" label="Đăng xuất" icon="pi pi-sign-out" outlined onClick={handleLogout} />
      </>
    ) : (
      <Link to={APP_ROUTES.LOGIN} className="app-header__login" onClick={() => setMobileMenuVisible(false)}>
        <i className={appIcons.login} aria-hidden="true" />
        <span>Đăng nhập</span>
      </Link>
    );

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
          {renderAccountControls()}
          <Button className="app-header__menu-button" icon="pi pi-bars" text rounded aria-label="Mở menu" onClick={() => setMobileMenuVisible(true)} />
        </div>
      </div>

      <PrimeSidebar visible={mobileMenuVisible} position="right" onHide={() => setMobileMenuVisible(false)} header="Đặtkhámnhanh">
        <div className="app-mobile-sidebar">
          <Sidebar navItems={PATIENT_NAV_ITEMS} isActive={isActive} onNavigate={() => setMobileMenuVisible(false)} />
          <div className="app-mobile-sidebar__account">{renderAccountControls()}</div>
        </div>
      </PrimeSidebar>
    </header>
  );
};

export default Header;
