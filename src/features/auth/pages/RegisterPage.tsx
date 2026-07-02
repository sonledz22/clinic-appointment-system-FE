import AppLayout from '@/components/layout/AppLayout';
import RegisterForm from '@/features/auth/components/RegisterForm';

export interface RegisterPageProps {}

const RegisterPage = ({}: Readonly<RegisterPageProps>) => (
  <AppLayout>
    <div className="login-page">
      <section className="login-page__form-panel" aria-label="Form đăng ký">
        <RegisterForm />
      </section>
    </div>
  </AppLayout>
);

export default RegisterPage;
