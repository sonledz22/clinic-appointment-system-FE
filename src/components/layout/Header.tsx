import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Sidebar as PrimeSidebar } from 'primereact/sidebar';
import Sidebar from '@/components/layout/Sidebar';
import { appIcons } from '@/constants/appIcons';
import { APP_ROUTES, PATIENT_NAV_ITEMS } from '@/constants/appRoutes';
import keycloak, { doLogout, getUserInfo } from '@/services/keycloak';

export interface HeaderProps {}

const Header = ({}: Readonly<HeaderProps>) => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const location = useLocation();

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
          {keycloak.authenticated ? (
            <div className="flex items-center gap-3 mr-2">
              <Link to={APP_ROUTES.PROFILE} className="flex items-center gap-2 text-gray-700 hover:text-blue-600 no-underline font-semibold">
                <i className="pi pi-user-edit text-base" />
                <span className="text-sm">{getUserInfo().name || 'Trang cá nhân'}</span>
              </Link>
              <button 
                type="button" 
                onClick={doLogout} 
                className="text-red-500 hover:text-red-700 font-semibold bg-transparent border-none cursor-pointer flex items-center gap-1 text-sm p-0"
              >
                <i className="pi pi-sign-out" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          ) : (
            <Link to={APP_ROUTES.LOGIN} className="app-header__login">
              <i className={appIcons.login} aria-hidden="true" />
              <span>Đăng nhập</span>
            </Link>
          )}
          <Button className="app-header__menu-button" icon="pi pi-bars" text rounded aria-label="Mở menu" onClick={() => setMobileMenuVisible(true)} />
        </div>
      </div>

      <PrimeSidebar visible={mobileMenuVisible} position="right" onHide={() => setMobileMenuVisible(false)} header="Đặtkhámnhanh">
        <div className="app-mobile-sidebar">
          <Sidebar navItems={PATIENT_NAV_ITEMS} isActive={isActive} onNavigate={() => setMobileMenuVisible(false)} />
          <div className="app-mobile-sidebar__account border-t pt-3 mt-3">
            {keycloak.authenticated ? (
              <div className="flex flex-col gap-3">
                <Link to={APP_ROUTES.PROFILE} className="flex items-center gap-2 text-gray-700 hover:text-blue-600 no-underline font-semibold" onClick={() => setMobileMenuVisible(false)}>
                  <i className="pi pi-user mr-2" />
                  <span>{getUserInfo().name || 'Trang cá nhân'}</span>
                </Link>
                <button 
                  type="button" 
                  onClick={() => { doLogout(); setMobileMenuVisible(false); }} 
                  className="text-red-500 hover:text-red-700 font-semibold bg-transparent border-none cursor-pointer flex items-center gap-2 text-left"
                >
                  <i className="pi pi-sign-out" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <Link to={APP_ROUTES.LOGIN} className="app-header__login" onClick={() => setMobileMenuVisible(false)}>
                <i className={appIcons.login} aria-hidden="true" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </PrimeSidebar>
    </header>
  );
};

export default Header;
