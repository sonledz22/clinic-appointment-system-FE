import { Link } from 'react-router-dom';
import type { PATIENT_NAV_ITEMS } from '@/constants/appRoutes';

type NavItem = (typeof PATIENT_NAV_ITEMS)[number];

export interface SidebarProps {
  navItems: readonly NavItem[];
  isActive: (path: string) => boolean;
  onNavigate?: () => void;
}

const Sidebar = ({ navItems, isActive, onNavigate }: Readonly<SidebarProps>) => (
  <nav className="app-sidebar-nav" aria-label="Điều hướng chính">
    {navItems.map((item) => (
      <Link key={item.path} to={item.path} className={isActive(item.path) ? 'is-active' : ''} onClick={onNavigate}>
        <i className={item.icon} aria-hidden="true" />
        <span>{item.label}</span>
      </Link>
    ))}
  </nav>
);

export default Sidebar;
