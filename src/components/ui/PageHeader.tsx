import { Tag } from 'primereact/tag';

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  badge?: string;
}

const PageHeader = ({ eyebrow, title, description, badge }: Readonly<PageHeaderProps>) => (
  <header className="page-header">
    <div>
      {eyebrow ? <span className="page-header__eyebrow">{eyebrow}</span> : null}
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </div>
    {badge ? <Tag value={badge} severity="info" /> : null}
  </header>
);

export default PageHeader;
