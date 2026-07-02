import AppLayout from '@/components/layout/AppLayout';
import LoginForm from '@/features/auth/components/LoginForm';

export interface LoginPageProps {}

const LoginPage = ({}: Readonly<LoginPageProps>) => (
  <AppLayout>
    <div className="login-page">
      <section className="login-page__form-panel" aria-label="Form đăng nhập">
        <LoginForm />
      </section>
    </div>
  </AppLayout>
);

export default LoginPage;
