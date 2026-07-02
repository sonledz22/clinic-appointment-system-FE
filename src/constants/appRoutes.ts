export const APP_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  HOME: '/',
  DOCTORS: '/doctors',
  HOSPITALS: '/hospitals',
  CLINICS: '/clinics',
  HEALTH_PACKAGES: '/health-packages',
  GUIDES: '/guides',
  DOCTOR_DASHBOARD: '/doctor',
  ADMIN: '/admin',
} as const;

export const PATIENT_NAV_ITEMS = [
  { label: 'Trang chủ', path: APP_ROUTES.HOME, icon: 'pi pi-home' },
  { label: 'Bác sĩ', path: APP_ROUTES.DOCTORS, icon: 'pi pi-briefcase' },
  { label: 'Bệnh viện', path: APP_ROUTES.HOSPITALS, icon: 'pi pi-building' },
  { label: 'Phòng khám', path: APP_ROUTES.CLINICS, icon: 'pi pi-map-marker' },
  { label: 'Gói khám', path: APP_ROUTES.HEALTH_PACKAGES, icon: 'pi pi-ticket' },
  { label: 'Cẩm nang', path: APP_ROUTES.GUIDES, icon: 'pi pi-book' },
] as const;
