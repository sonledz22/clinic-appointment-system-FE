import { ConfirmDialog as PrimeConfirmDialog } from 'primereact/confirmdialog';
import type { ConfirmDialogProps as PrimeConfirmDialogProps } from 'primereact/confirmdialog';

export interface ConfirmDialogProps extends PrimeConfirmDialogProps {}

const ConfirmDialog = (props: Readonly<ConfirmDialogProps>) => <PrimeConfirmDialog {...props} />;

export default ConfirmDialog;
