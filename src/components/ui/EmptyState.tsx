import { Button } from 'primereact/button';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon = 'pi pi-info-circle', title, description, actionLabel, onAction }: Readonly<EmptyStateProps>) => (
  <div className="empty-state">
    <i className={icon} aria-hidden="true" />
    <h3>{title}</h3>
    {description ? <p>{description}</p> : null}
    {actionLabel ? <Button label={actionLabel} icon="pi pi-refresh" text onClick={onAction} /> : null}
  </div>
);

export default EmptyState;
