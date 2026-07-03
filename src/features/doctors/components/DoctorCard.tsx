import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import AppImage from '@/components/common/AppImage';
import { appIcons } from '@/constants/appIcons';
import type { DoctorCardViewModel } from '@/features/doctors/types/doctor';

export interface DoctorCardProps {
  doctor: DoctorCardViewModel;
  onViewDetails?: (doctor: DoctorCardViewModel) => void;
  onBook?: (doctor: DoctorCardViewModel) => void;
}

const DoctorCard = ({ doctor, onViewDetails, onBook }: Readonly<DoctorCardProps>) => {
  const header = (
    <div className="entity-card__media">
      <AppImage className="entity-card__image" src={doctor.image} alt={doctor.name} fallbackLabel={doctor.name} />
      <span className="rating-pill entity-card__rating"><i className={appIcons.star} aria-hidden="true" /> {doctor.rating.toFixed(1)}</span>
    </div>
  );
  const footer = (
    <div className="entity-card__actions">
      <Button label="Xem chi tiết" icon={appIcons.info} outlined onClick={() => onViewDetails?.(doctor)} />
      <Button label="Đặt lịch" icon={appIcons.appointment} onClick={() => onBook?.(doctor)} />
    </div>
  );

  return (
    <Card className="entity-card doctor-card" header={header} footer={footer}>
      <div className="entity-card__content">
        <div className="entity-card__meta-row">
          <Tag value={doctor.specialty} severity="info" />
          <span className="entity-card__subtext">{doctor.area}</span>
        </div>
        <h3>{doctor.name}</h3>
        <p className="entity-card__subtext">{doctor.experience}</p>
        <p className="entity-card__workplace"><i className={appIcons.location} aria-hidden="true" /> {doctor.workplace}</p>
        <p className="entity-card__description">{doctor.introduction}</p>
        <strong className="entity-card__price">{doctor.price}</strong>
      </div>
    </Card>
  );
};

export default DoctorCard;
