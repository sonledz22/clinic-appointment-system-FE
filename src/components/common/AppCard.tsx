import { Card } from 'primereact/card';
import type { CardProps } from 'primereact/card';

export interface AppCardProps extends CardProps {}

const AppCard = (props: Readonly<AppCardProps>) => <Card {...props} />;

export default AppCard;
