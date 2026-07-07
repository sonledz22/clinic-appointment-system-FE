import axios from 'axios';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import googleIcon from '@/assets/icons/icon_gg.png';
import { APP_ROUTES } from '@/constants/appRoutes';
import { ROLES } from '@/constants/roles';
import { getValidationFieldErrors, registerSchema } from '@/features/auth/authSchemas';
import type { ApiErrorResponse } from '@/models/auth.model';
import { authService } from '@/services/auth.service';
import { appToast } from '@/utils/toast';

export interface RegisterFormProps {}

type RegisterFieldName = 'fullName' | 'email' | 'password' | 'confirmPassword' | 'phoneNumber' | 'dateOfBirth' | 'gender' | 'contactInformation';
type RegisterFieldErrors = Partial<Record<RegisterFieldName, string>>;

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
};

const toNullableValue = (value?: string) => {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
};

const RegisterForm = ({}: Readonly<RegisterFormProps>) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [contactInformation, setContactInformation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    const validation = registerSchema.safeParse({ fullName, email, password, confirmPassword, phoneNumber, dateOfBirth, gender, contactInformation });
    if (!validation.success) {
      setFieldErrors(getValidationFieldErrors<RegisterFieldName>(validation.error));
      return;
    }

    setSubmitting(true);
    try {
      const values = validation.data;
      await authService.register({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phoneNumber: toNullableValue(values.phoneNumber),
        role: ROLES.USER,
        specialization: null,
        dateOfBirth: toNullableValue(values.dateOfBirth),
        gender: toNullableValue(values.gender),
        contactInformation: toNullableValue(values.contactInformation) ?? toNullableValue(values.phoneNumber),
      });
      const message = 'Đăng ký thành công. Vui lòng đăng nhập.';
      appToast.success('Đăng ký thành công', message);
      navigate(APP_ROUTES.LOGIN, { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(error, 'Không thể đăng ký. Vui lòng thử lại.');
      setFieldErrors({ email: message });
      appToast.error('Đăng ký thất bại', message);
    } finally {
      setSubmitting(false);
    }
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
            disabled={submitting}
          />
        </span>
        {fieldErrors.fullName ? (
          <p className="login-form__field-error" role="alert">
            {fieldErrors.fullName}
          </p>
        ) : null}
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
            disabled={submitting}
          />
        </span>
        {fieldErrors.email ? (
          <p className="login-form__field-error" role="alert">
            {fieldErrors.email}
          </p>
        ) : null}
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
            disabled={submitting}
          />
        </span>
        {fieldErrors.password ? (
          <p className="login-form__field-error" role="alert">
            {fieldErrors.password}
          </p>
        ) : null}
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
            disabled={submitting}
          />
        </span>
        {fieldErrors.confirmPassword ? (
          <p className="login-form__field-error" role="alert">
            {fieldErrors.confirmPassword}
          </p>
        ) : null}
      </div>

      <div className="login-form__field-grid">
        <div className="login-form__field">
          <label htmlFor="register-phone">Số điện thoại</label>
          <span className="p-input-icon-left">
            <i className="pi pi-phone" aria-hidden="true" />
            <InputText
              id="register-phone"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="Nhập số điện thoại"
              autoComplete="tel"
              disabled={submitting}
            />
          </span>
          {fieldErrors.phoneNumber ? (
            <p className="login-form__field-error" role="alert">
              {fieldErrors.phoneNumber}
            </p>
          ) : null}
        </div>

        <div className="login-form__field">
          <label htmlFor="register-date-of-birth">Ngày sinh</label>
          <span className="p-input-icon-left">
            <i className="pi pi-calendar" aria-hidden="true" />
            <InputText
              id="register-date-of-birth"
              type="date"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              disabled={submitting}
            />
          </span>
          {fieldErrors.dateOfBirth ? (
            <p className="login-form__field-error" role="alert">
              {fieldErrors.dateOfBirth}
            </p>
          ) : null}
        </div>
      </div>

      <div className="login-form__field-grid">
        <div className="login-form__field">
          <label htmlFor="register-gender">Giới tính</label>
          <span className="p-input-icon-left">
            <i className="pi pi-id-card" aria-hidden="true" />
            <select
              id="register-gender"
              className="p-inputtext"
              value={gender}
              onChange={(event) => setGender(event.target.value)}
              disabled={submitting}
            >
              <option value="">Chọn giới tính</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </span>
          {fieldErrors.gender ? (
            <p className="login-form__field-error" role="alert">
              {fieldErrors.gender}
            </p>
          ) : null}
        </div>

        <div className="login-form__field">
          <label htmlFor="register-contact-information">Thông tin liên hệ</label>
          <span className="p-input-icon-left">
            <i className="pi pi-map-marker" aria-hidden="true" />
            <InputText
              id="register-contact-information"
              value={contactInformation}
              onChange={(event) => setContactInformation(event.target.value)}
              placeholder="Địa chỉ liên hệ"
              autoComplete="street-address"
              disabled={submitting}
            />
          </span>
          {fieldErrors.contactInformation ? (
            <p className="login-form__field-error" role="alert">
              {fieldErrors.contactInformation}
            </p>
          ) : null}
        </div>
      </div>

      <Button
        className="login-form__submit"
        type="submit"
        label={submitting ? 'Đang đăng ký...' : 'Đăng ký'}
        icon="pi pi-arrow-right"
        iconPos="right"
        loading={submitting}
        disabled={submitting}
      />

      <Divider align="center">
        <span>Hoặc đăng ký với</span>
      </Divider>

      <div className="login-form__socials">
        <Button
          type="button"
          label="Google"
          icon={<img className="login-form__google-icon" src={googleIcon} alt="" aria-hidden="true" />}
          outlined
          disabled={submitting}
        />
      </div>

      <p className="login-form__signup">
        Bạn đã có tài khoản? <Link to={APP_ROUTES.LOGIN}>Đăng nhập</Link>
      </p>
    </form>
  );
};

export default RegisterForm;
