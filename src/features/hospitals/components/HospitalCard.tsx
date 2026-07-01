import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import AppImage from '@/components/common/AppImage';
import { appIcons } from '@/constants/appIcons';
import type { HospitalMock } from '@/mocks/hospitals';

export interface HospitalCardProps {
  hospital: HospitalMock;
}

const HospitalCard = ({ hospital }: Readonly<HospitalCardProps>) => {
  const header = (
    <div className="entity-card__media">
      <AppImage className="entity-card__image" src={hospital.image} alt={hospital.name} fallbackLabel={hospital.name} />
      <span className="rating-pill entity-card__rating"><i className={appIcons.star} aria-hidden="true" /> {hospital.rating.toFixed(1)}</span>
    </div>
  );
  const footer = <Button label="Xem chi tiết" icon={appIcons.info} outlined />;

  return (
    <Card className="entity-card hospital-card" header={header} footer={footer}>
      <div className="entity-card__content">
        <div className="entity-card__meta-row">
          <Tag value={hospital.area} severity="info" />
          <span className="entity-card__subtext">{hospital.specialties} chuyên khoa</span>
        </div>
        <h3>{hospital.name}</h3>
        <p className="entity-card__workplace"><i className={appIcons.location} aria-hidden="true" /> {hospital.address}</p>
        <p className="entity-card__description">{hospital.description}</p>
      </div>
    </Card>
  );
};

export default HospitalCard;