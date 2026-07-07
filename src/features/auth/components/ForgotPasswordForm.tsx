import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { APP_ROUTES } from '@/constants/appRoutes';
import { forgotPasswordSchema, getValidationFieldErrors } from '@/features/auth/authSchemas';
import { appToast } from '@/utils/toast';

export interface ForgotPasswordFormProps {}

type ForgotPasswordFieldErrors = Partial<Record<'email', string>>;

const ForgotPasswordForm = ({}: Readonly<ForgotPasswordFormProps>) => {
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ForgotPasswordFieldErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setFieldErrors(getValidationFieldErrors<'email'>(validation.error));
      return;
    }

    appToast.info('Đã ghi nhận yêu cầu', 'Nếu email tồn tại, hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu.');
  };

  return (
    <form className="login-form auth-form auth-form--forgot" onSubmit={handleSubmit}>
      <div className="login-form__header">
        <span className="login-form__brand-mark" aria-hidden="true">
          <i className="pi pi-plus" />
          <i className="pi pi-heart-fill" />
        </span>
        <h1>Quên mật khẩu</h1>
        <p>Nhập email để nhận hướng dẫn đặt lại mật khẩu</p>
      </div>

      <div className="login-form__field">
        <label htmlFor="forgot-email">Email</label>
        <span className="p-input-icon-left">
          <i className="pi pi-envelope" aria-hidden="true" />
          <InputText
            id="forgot-email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Nhập email"
            autoComplete="email"
          />
        </span>
        {fieldErrors.email ? (
          <p className="login-form__field-error" role="alert">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <Button className="login-form__submit" type="submit" label="Gửi hướng dẫn" icon="pi pi-arrow-right" iconPos="right" />

      <p className="login-form__signup">
        Bạn nhớ mật khẩu? <Link to={APP_ROUTES.LOGIN}>Đăng nhập</Link>
      </p>
    </form>
  );
};

export default ForgotPasswordForm;
