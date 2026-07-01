import { ProgressSpinner } from 'primereact/progressspinner';

export interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = 'Đang tải dữ liệu...' }: Readonly<LoadingScreenProps>) => (
  <div className="loading-screen" role="status" aria-live="polite">
    <ProgressSpinner strokeWidth="4" />
    <p>{message}</p>
  </div>
);

export default LoadingScreen;
