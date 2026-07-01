import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import AppImage from '@/components/common/AppImage';
import { appIcons } from '@/constants/appIcons';
import type { ClinicMock } from '@/mocks/clinics';

export interface ClinicCardProps {
  clinic: ClinicMock;
}

const ClinicCard = ({ clinic }: Readonly<ClinicCardProps>) => {
  const header = (
    <div className="entity-card__media">
      <AppImage className="entity-card__image" src={clinic.image} alt={clinic.name} fallbackLabel={clinic.name} />
      <span className="rating-pill entity-card__rating"><i className={appIcons.star} aria-hidden="true" /> {clinic.rating.toFixed(1)}</span>
    </div>
  );
  const footer = (
    <div className="entity-card__actions">
      <Button label="Xem chi tiết" icon={appIcons.info} outlined />
      <Button label="Đặt lịch" icon={appIcons.appointment} />
    </div>
  );

  return (
    <Card className="entity-card clinic-card" header={header} footer={footer}>
      <div className="entity-card__content">
        <div className="entity-card__meta-row">
          <Tag value={clinic.area} severity="info" />
          <span className="entity-card__subtext"><i className={appIcons.calendar} aria-hidden="true" /> {clinic.openingHours}</span>
        </div>
        <h3>{clinic.name}</h3>
        <p className="entity-card__workplace"><i className={appIcons.location} aria-hidden="true" /> {clinic.address}</p>
        <div className="tag-list">
          {clinic.highlightedSpecialties.map((specialty) => <Tag key={specialty} value={specialty} />)}
        </div>
      </div>
    </Card>
  );
};

export default ClinicCard;