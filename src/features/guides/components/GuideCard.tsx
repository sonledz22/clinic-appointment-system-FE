import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { appIcons } from '@/constants/appIcons';
import type { GuideMock } from '@/mocks/guides';

export interface GuideCardProps {
  guide: GuideMock;
}

const GuideCard = ({ guide }: Readonly<GuideCardProps>) => (
  <Card className="entity-card guide-card">
    <div className="entity-card__content">
      <div className="entity-card__meta-row">
        <Tag value={guide.category} severity="info" />
        <span className="entity-card__subtext">{guide.publishedAt}</span>
      </div>
      <h3>{guide.title}</h3>
      <p>{guide.description}</p>
      <span className="entity-card__subtext"><i className="pi pi-clock" aria-hidden="true" /> {guide.readingTime}</span>
      <Button label="Đọc bài viết" icon={appIcons.guide} text />
    </div>
  </Card>
);

export default GuideCard;
