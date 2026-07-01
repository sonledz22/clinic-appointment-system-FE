import AppLayout from '@/components/layout/AppLayout';
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm';

export interface ForgotPasswordPageProps {}

const ForgotPasswordPage = ({}: Readonly<ForgotPasswordPageProps>) => (
  <AppLayout>
    <div className="login-page">
      <section className="login-page__form-panel" aria-label="Form quên mật khẩu">
        <ForgotPasswordForm />
      </section>
    </div>
  </AppLayout>
);

export default ForgotPasswordPage;
