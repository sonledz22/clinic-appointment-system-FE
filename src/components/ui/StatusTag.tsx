import { Tag } from 'primereact/tag';
import type { TagProps } from 'primereact/tag';

export interface StatusTagProps extends TagProps {}

const StatusTag = (props: Readonly<StatusTagProps>) => <Tag {...props} />;

export default StatusTag;
