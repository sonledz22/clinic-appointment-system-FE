import { Button } from 'primereact/button';
import type { ButtonProps } from 'primereact/button';

export interface AppButtonProps extends ButtonProps {}

const AppButton = (props: Readonly<AppButtonProps>) => <Button {...props} />;

export default AppButton;
