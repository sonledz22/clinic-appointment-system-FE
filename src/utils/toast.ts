import type { ToastMessage } from 'primereact/toast';

export const APP_TOAST_EVENT = 'app:toast';

export type AppToastMessage = ToastMessage;

const DEFAULT_LIFE = 4200;

const TOAST_ICONS: Record<string, string> = {
  success: 'pi pi-check',
  info: 'pi pi-info',
  warn: 'pi pi-exclamation-triangle',
  error: 'pi pi-times',
  secondary: 'pi pi-bell',
  contrast: 'pi pi-bell',
};

export const showToast = (message: AppToastMessage) => {
  if (typeof window === 'undefined') {
    return;
  }

  const severity = message.severity ?? 'info';
  const messageClassName = ['app-toast', `app-toast--${severity}`, message.className].filter(Boolean).join(' ');

  window.dispatchEvent(
    new CustomEvent<AppToastMessage>(APP_TOAST_EVENT, {
      detail: {
        life: DEFAULT_LIFE,
        closable: true,
        icon: TOAST_ICONS[severity],
        ...message,
        className: messageClassName,
      },
    }),
  );
};

export const appToast = {
  success(summary: string, detail?: string) {
    showToast({ severity: 'success', summary, detail });
  },
  info(summary: string, detail?: string) {
    showToast({ severity: 'info', summary, detail });
  },
  warn(summary: string, detail?: string) {
    showToast({ severity: 'warn', summary, detail });
  },
  error(summary: string, detail?: string) {
    showToast({ severity: 'error', summary, detail });
  },
};
