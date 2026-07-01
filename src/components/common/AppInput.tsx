import { InputText } from 'primereact/inputtext';
import type { InputTextProps } from 'primereact/inputtext';

export interface AppInputProps extends InputTextProps {
  label?: string;
  error?: string;
}

const AppInput = ({ label, error, id, className = '', ...props }: Readonly<AppInputProps>) => {
  const inputId = id || props.name;

  return (
    <div className="app-field">
      {label ? <label htmlFor={inputId}>{label}</label> : null}
      <InputText id={inputId} className={`${className} ${error ? 'p-invalid' : ''}`.trim()} {...props} />
      {error ? <small className="app-field__error">{error}</small> : null}
    </div>
  );
};

export default AppInput;
