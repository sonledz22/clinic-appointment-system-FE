import { useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import type { ToastMessage } from 'primereact/toast';
import { APP_TOAST_EVENT } from '@/utils/toast';

const AppToast = () => {
  const toastRef = useRef<Toast>(null);

  useEffect(() => {
    const handleToast = (event: Event) => {
      toastRef.current?.show((event as CustomEvent<ToastMessage>).detail);
    };

    window.addEventListener(APP_TOAST_EVENT, handleToast);
    return () => window.removeEventListener(APP_TOAST_EVENT, handleToast);
  }, []);

  return <Toast ref={toastRef} className="app-toast-root" position="top-right" baseZIndex={1200} />;
};

export default AppToast;
