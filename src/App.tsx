import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '@/routes/PrivateRoute';
import LoadingScreen from '@/components/common/LoadingScreen';
import { APP_ROUTES } from '@/constants/appRoutes';
import { ROLES } from '@/constants/roles';
import { getRoles } from '@/services/keycloak';

const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
const DoctorsPage = lazy(() => import('@/features/doctors/pages/DoctorsPage'));
const HospitalsPage = lazy(() => import('@/features/hospitals/pages/HospitalsPage'));
const ClinicsPage = lazy(() => import('@/features/clinics/pages/ClinicsPage'));
const HealthPackagesPage = lazy(() => import('@/features/packages/pages/HealthPackagesPage'));
const GuidesPage = lazy(() => import('@/features/guides/pages/GuidesPage'));
const DoctorDashboard = lazy(() => import('@/components/DoctorDashboard'));
const AdminPanel = lazy(() => import('@/components/AdminPanel'));

// Điều hướng dựa trên vai trò người dùng sau khi đăng nhập
const RootRedirect: React.FC = () => {
  const roles = getRoles();
  if (roles.includes(ROLES.ADMIN)) {
    return <Navigate to={APP_ROUTES.ADMIN} replace />;
  }
  if (roles.includes(ROLES.DOCTOR)) {
    return <Navigate to={APP_ROUTES.DOCTOR_DASHBOARD} replace />;
  }
  return <HomePage />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Bệnh nhân (Vai trò 'user') */}
          <Route
            path={APP_ROUTES.HOME}
            element={
              <PrivateRoute requiredRole={ROLES.USER}>
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

          {/* Bác sĩ (Vai trò 'doctor') */}
          <Route
            path={APP_ROUTES.DOCTOR_DASHBOARD}
            element={
              <PrivateRoute requiredRole={ROLES.DOCTOR}>
                <DoctorDashboard />
              </PrivateRoute>
            }
          />

          {/* Quản trị viên (Vai trò 'admin') */}
          <Route
            path={APP_ROUTES.ADMIN}
            element={
              <PrivateRoute requiredRole={ROLES.ADMIN}>
                <AdminPanel />
              </PrivateRoute>
            }
          />

          {/* Chuyển hướng các đường dẫn lạ về trang chủ */}
          <Route path="*" element={<Navigate to={APP_ROUTES.HOME} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
