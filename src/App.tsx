import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer = ({ children }: Readonly<AuthInitializerProps>) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      useAuthStore.getState().clearUser();

      if (location.pathname !== APP_ROUTES.LOGIN) {
        navigate(APP_ROUTES.LOGIN, { replace: true, state: { from: location } });
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const { initialized, fetchCurrentUser } = useAuthStore.getState();
    if (!initialized) {
      void fetchCurrentUser();
    }

    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [location, navigate]);

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const initialized = useAuthStore((state) => state.initialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasRole = useAuthStore((state) => state.hasRole);

  if (initialized && isAuthenticated && hasRole(ROLES.ADMIN)) {
    return <Navigate to={APP_ROUTES.ADMIN} replace />;
  }

  if (initialized && isAuthenticated && hasRole(ROLES.DOCTOR)) {
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
            element={<RootRedirect />}
          />

          <Route
            path={APP_ROUTES.DOCTORS}
            element={
              <PrivateRoute requiredRole={ROLES.PATIENT}>
                <DoctorsPage />
              </PrivateRoute>
            }
          />

          <Route
            path={APP_ROUTES.HOSPITALS}
            element={
              <PrivateRoute requiredRole={ROLES.PATIENT}>
                <HospitalsPage />
              </PrivateRoute>
            }
          />

          <Route
            path={APP_ROUTES.CLINICS}
            element={
              <PrivateRoute requiredRole={ROLES.PATIENT}>
                <ClinicsPage />
              </PrivateRoute>
            }
          />

          <Route
            path={APP_ROUTES.HEALTH_PACKAGES}
            element={
              <PrivateRoute requiredRole={ROLES.PATIENT}>
                <HealthPackagesPage />
              </PrivateRoute>
            }
          />

          <Route
            path={APP_ROUTES.GUIDES}
            element={
              <PrivateRoute requiredRole={ROLES.PATIENT}>
                <GuidesPage />
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
