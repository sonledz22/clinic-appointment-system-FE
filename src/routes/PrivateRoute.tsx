import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { APP_ROUTES } from '@/constants/appRoutes';
import { useAuthStore } from '@/stores/auth.store';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const location = useLocation();
  const initialized = useAuthStore((state) => state.initialized);
  const loading = useAuthStore((state) => state.loading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasRole = useAuthStore((state) => state.hasRole);

  if (!initialized || loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={APP_ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
