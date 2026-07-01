import React from 'react';
import { Navigate } from 'react-router-dom';
import keycloak, { hasRole } from '@/services/keycloak';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  if (!keycloak.authenticated) {
    keycloak.login();
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
