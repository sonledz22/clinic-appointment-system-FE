import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { APP_ROUTES } from '@/constants/appRoutes';

export interface LoginFormProps {}

const LoginForm = ({}: Readonly<LoginFormProps>) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-form__header">
        <span className="login-form__brand-mark" aria-hidden="true">
          <i className="pi pi-plus" />
          <i className="pi pi-heart-fill" />
        </span>
        <h1>Đăng nhập</h1>
        <p>Chào mừng bạn quay trở lại Đặtkhámnhanh</p>
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
          />
        </span>
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
          />
        </span>
      </div>

      <div className="login-form__options">
        <Link to={APP_ROUTES.FORGOT_PASSWORD}>Quên mật khẩu?</Link>
      </div>

      <Button className="login-form__submit" type="submit" label="Đăng nhập" icon="pi pi-arrow-right" iconPos="right" />

      <Divider align="center">
        <span>Hoặc đăng nhập với</span>
      </Divider>

      <div className="login-form__socials">
        <Button type="button" label="Google" icon="pi pi-google" outlined />
      </div>

      <p className="login-form__signup">
        Bạn chưa có tài khoản? <Link to={APP_ROUTES.REGISTER}>Đăng ký ngay</Link>
      </p>
    </form>
  );
};

export default LoginForm;
