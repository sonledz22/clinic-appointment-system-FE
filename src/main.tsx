import React from 'react';
import ReactDOM from 'react-dom/client';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import App from '@/App';
import '@/index.css';
import '@/styles/prime-theme.css';
import '@/styles/globals.css';
import '@/styles/layout.css';
import '@/styles/pages.css';
import { primeReactConfig, setupPrimeReact } from '@/config/primeReact';
import { initKeycloak } from '@/services/keycloak';

setupPrimeReact();

// Khởi tạo Keycloak trước khi render ứng dụng
initKeycloak(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <PrimeReactProvider value={primeReactConfig}>
        <App />
      </PrimeReactProvider>
    </React.StrictMode>
  );
});