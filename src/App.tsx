import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { APP_ROUTES } from '@/constants/appRoutes';
import { ROLES } from '@/constants/roles';
import HomePage from '@/features/home/pages/HomePage';
import PrivateRoute from '@/routes/PrivateRoute';
import { useAuthStore } from '@/stores/auth.store';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const DoctorsPage = lazy(() => import('@/features/doctors/pages/DoctorsPage'));
const HospitalsPage = lazy(() => import('@/features/hospitals/pages/HospitalsPage'));
const ClinicsPage = lazy(() => import('@/features/clinics/pages/ClinicsPage'));
const HealthPackagesPage = lazy(() => import('@/features/packages/pages/HealthPackagesPage'));
const GuidesPage = lazy(() => import('@/features/guides/pages/GuidesPage'));
const DoctorDashboard = lazy(() => import('@/components/DoctorDashboard'));
const AdminPanel = lazy(() => import('@/components/AdminPanel'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer = ({ children }: Readonly<AuthInitializerProps>) => {
  useEffect(() => {
    const handleUnauthorized = () => useAuthStore.getState().clearUser();
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const { initialized, fetchCurrentUser } = useAuthStore.getState();
    if (!initialized) {
      void fetchCurrentUser();
    }

    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const hasRole = useAuthStore((state) => state.hasRole);

  if (hasRole(ROLES.ADMIN)) {
    return <Navigate to={APP_ROUTES.ADMIN} replace />;
  }

  if (hasRole(ROLES.DOCTOR)) {
    return <Navigate to={APP_ROUTES.DOCTOR_DASHBOARD} replace />;
  }

  return <HomePage />;
};

const App: React.FC = () => (
  <BrowserRouter>
    <AuthInitializer>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={APP_ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={APP_ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

          <Route
            path={APP_ROUTES.HOME}
            element={
              <PrivateRoute>
                <RootRedirect />
              </PrivateRoute>
            }
          />

          <Route
            path={APP_ROUTES.DOCTORS}
            element={
              <PrivateRoute requiredRole={ROLES.USER}>
                <DoctorsPage />
              </PrivateRoute>
            }
          />

          <Route
            path={APP_ROUTES.HOSPITALS}
            element={
              <PrivateRoute requiredRole={ROLES.USER}>
                <HospitalsPage />
              </PrivateRoute>
            }
          />

          <Route
            path={APP_ROUTES.CLINICS}
            element={
              <PrivateRoute requiredRole={ROLES.USER}>
                <ClinicsPage />
              </PrivateRoute>
            }
          />

          <Route
            path={APP_ROUTES.HEALTH_PACKAGES}
            element={
              <PrivateRoute requiredRole={ROLES.USER}>
                <HealthPackagesPage />
              </PrivateRoute>
            }
          />

          <Route
            path={APP_ROUTES.GUIDES}
            element={
              <PrivateRoute requiredRole={ROLES.USER}>
                <GuidesPage />
              </PrivateRoute>
            }
          />

          <Route
            path={APP_ROUTES.PROFILE}
            element={
              <PrivateRoute requiredRole={ROLES.USER}>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path={APP_ROUTES.DOCTOR_DASHBOARD}
            element={
              <PrivateRoute requiredRole={ROLES.DOCTOR}>
                <DoctorDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path={APP_ROUTES.ADMIN}
            element={
              <PrivateRoute requiredRole={ROLES.ADMIN}>
                <AdminPanel />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to={APP_ROUTES.HOME} replace />} />
        </Routes>
      </Suspense>
    </AuthInitializer>
  </BrowserRouter>
);

export default App;
