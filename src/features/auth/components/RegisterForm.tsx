import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { APP_ROUTES } from '@/constants/appRoutes';

export interface RegisterFormProps {}

const RegisterForm = ({}: Readonly<RegisterFormProps>) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <form className="login-form auth-form auth-form--register" onSubmit={handleSubmit}>
      <div className="login-form__header">
        <span className="login-form__brand-mark" aria-hidden="true">
          <i className="pi pi-plus" />
          <i className="pi pi-heart-fill" />
        </span>
        <h1>Đăng ký</h1>
        <p>Tạo tài khoản để đặt lịch khám nhanh hơn</p>
      </div>

      <div className="login-form__field">
        <label htmlFor="register-name">Họ và tên</label>
        <span className="p-input-icon-left">
          <i className="pi pi-user" aria-hidden="true" />
          <InputText
            id="register-name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Nhập họ và tên"
            autoComplete="name"
          />
        </span>
      </div>

      <div className="login-form__field">
        <label htmlFor="register-email">Email</label>
        <span className="p-input-icon-left">
          <i className="pi pi-envelope" aria-hidden="true" />
          <InputText
            id="register-email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Nhập email"
            autoComplete="email"
          />
        </span>
      </div>

      <div className="login-form__field">
        <label htmlFor="register-password">Mật khẩu</label>
        <span className="p-input-icon-left login-form__password-shell">
          <i className="pi pi-lock" aria-hidden="true" />
          <Password
            inputId="register-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập mật khẩu"
            feedback={false}
            toggleMask
            autoComplete="new-password"
            inputClassName="login-form__password-input"
          />
        </span>
      </div>

      <div className="login-form__field">
        <label htmlFor="register-confirm-password">Xác nhận mật khẩu</label>
        <span className="p-input-icon-left login-form__password-shell">
          <i className="pi pi-lock" aria-hidden="true" />
          <Password
            inputId="register-confirm-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Nhập lại mật khẩu"
            feedback={false}
            toggleMask
            autoComplete="new-password"
            inputClassName="login-form__password-input"
          />
        </span>
      </div>

      <Button className="login-form__submit" type="submit" label="Đăng ký" icon="pi pi-arrow-right" iconPos="right" />

      <Divider align="center">
        <span>Hoặc đăng ký với</span>
      </Divider>

      <div className="login-form__socials">
        <Button type="button" label="Google" icon="pi pi-google" outlined />
      </div>

      <p className="login-form__signup">
        Bạn đã có tài khoản? <Link to={APP_ROUTES.LOGIN}>Đăng nhập</Link>
      </p>
    </form>
  );
};

export default RegisterForm;
