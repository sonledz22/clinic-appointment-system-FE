import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initKeycloak } from './services/keycloak';

// Khởi tạo Keycloak trước khi render ứng dụng
initKeycloak(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
