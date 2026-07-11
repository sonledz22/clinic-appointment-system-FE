import axios from 'axios';
import { type FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import googleIcon from '@/assets/icons/icon_gg.png';
import keycloakIcon from '@/assets/icons/icon_keycloak.png';
import { APP_ROUTES } from '@/constants/appRoutes';
import { getValidationFieldErrors, loginSchema } from '@/features/auth/authSchemas';
import type { ApiErrorResponse } from '@/models/auth.model';
import { useAuthStore } from '@/stores/auth.store';
import { appToast } from '@/utils/toast';

interface LoginLocationState {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
}

export interface LoginFormProps {}

type LoginFieldName = 'email' | 'password';
type LoginFieldErrors = Partial<Record<LoginFieldName, string>>;

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
};

const LoginForm = ({}: Readonly<LoginFormProps>) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const navigate = useNavigate();
  const location = useLocation();

  const fromState = (location.state as LoginLocationState | null)?.from;
  const redirectTo = `${fromState?.pathname ?? APP_ROUTES.HOME}${fromState?.search ?? ''}${fromState?.hash ?? ''}`;

  const loginWithKeycloak = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/keycloak';
  };

  const loginWithGoogle = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/keycloak?idp=google';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setFieldErrors(getValidationFieldErrors<LoginFieldName>(validation.error));
      return;
    }

    try {
      await login(validation.data);
      appToast.success('Đăng nhập thành công', 'Đang chuyển hướng...');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const message = 'Email hoặc mật khẩu không đúng.';
        setFieldErrors({ password: message });
        appToast.error('Đăng nhập thất bại', message);
        return;
      }

      const message = getApiErrorMessage(error, 'Không thể đăng nhập. Vui lòng thử lại.');
      setFieldErrors({ password: message });
      appToast.error('Đăng nhập thất bại', message);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-form__header">
        <span className="login-form__brand-mark" aria-hidden="true">
          <i className="pi pi-plus" />
          <i className="pi pi-heart-fill" />
        </span>
        <h1>Đăng nhập</h1>
      </div>

      <div className="login-form__field">
        <label htmlFor="login-email">Email</label>
        <span className="p-input-icon-left">
          <i className="pi pi-user" aria-hidden="true" />
          <InputText
            id="login-email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Nhập email"
            autoComplete="email"
            disabled={loading}
          />
        </span>
        {fieldErrors.email ? (
          <p className="login-form__field-error" role="alert">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="login-form__field">
        <label htmlFor="login-password">Mật khẩu</label>
        <span className="p-input-icon-left login-form__password-shell">
          <i className="pi pi-lock" aria-hidden="true" />
          <Password
            inputId="login-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập mật khẩu"
            feedback={false}
            toggleMask
            autoComplete="current-password"
            inputClassName="login-form__password-input"
            disabled={loading}
          />
        </span>
        {fieldErrors.password ? (
          <p className="login-form__field-error" role="alert">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <div className="login-form__options">
        <Link to={APP_ROUTES.FORGOT_PASSWORD}>Quên mật khẩu?</Link>
      </div>

      <Button
        className="login-form__submit"
        type="submit"
        label={loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        icon="pi pi-arrow-right"
        iconPos="right"
        loading={loading}
        disabled={loading}
      />

      <Divider align="center">
        <span>Hoặc đăng nhập với</span>
      </Divider>

      <div className="login-form__socials">
        <Button
          type="button"
          label="Google"
          icon={<img className="login-form__google-icon" src={googleIcon} alt="" aria-hidden="true" />}
          outlined
          disabled={loading}
          onClick={loginWithGoogle}
        />
        <Button
          type="button"
          className="login-form__keycloak"
          label="Keycloak"
          icon={<img className="login-form__keycloak-icon" src={keycloakIcon} alt="" aria-hidden="true" />}
          outlined
          disabled={loading}
          onClick={loginWithKeycloak}
        />
      </div>

      <p className="login-form__signup">
        Bạn chưa có tài khoản? <Link to={APP_ROUTES.REGISTER}>Đăng ký ngay</Link>
      </p>
    </form>
  );
};

export default LoginForm;
