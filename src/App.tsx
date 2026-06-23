import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './routes/PrivateRoute';
import PatientPortal from './components/PatientPortal';
import DoctorDashboard from './components/DoctorDashboard';
import AdminPanel from './components/AdminPanel';
import { getRoles } from './services/keycloak';

// Điều hướng dựa trên vai trò người dùng sau khi đăng nhập
const RootRedirect: React.FC = () => {
  const roles = getRoles();
  if (roles.includes('admin')) {
    return <Navigate to="/admin" replace />;
  }
  if (roles.includes('doctor')) {
    return <Navigate to="/doctor" replace />;
  }
  return <PatientPortal />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Bệnh nhân (Vai trò 'user') */}
        <Route 
          path="/" 
          element={
            <PrivateRoute requiredRole="user">
              <RootRedirect />
            </PrivateRoute>
          } 
        />

        {/* Bác sĩ (Vai trò 'doctor') */}
        <Route 
          path="/doctor" 
          element={
            <PrivateRoute requiredRole="doctor">
              <DoctorDashboard />
            </PrivateRoute>
          } 
        />

        {/* Quản trị viên (Vai trò 'admin') */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute requiredRole="admin">
              <AdminPanel />
            </PrivateRoute>
          } 
        />

        {/* Chuyển hướng các đường dẫn lạ về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
