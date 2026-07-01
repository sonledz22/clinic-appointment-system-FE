import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { appIcons } from '@/constants/appIcons';
import type { HealthPackageMock } from '@/mocks/packages';

export interface PackageCardProps {
  healthPackage: HealthPackageMock;
}

const PackageCard = ({ healthPackage }: Readonly<PackageCardProps>) => {
  const footer = (
    <div className="entity-card__actions">
      <Button label="Xem chi tiết" icon={appIcons.info} outlined />
      <Button label="Đăng ký" icon={appIcons.save} />
    </div>
  );

  return (
    <Card className="entity-card package-card" footer={footer}>
      <div className="entity-card__content">
        <Tag value={healthPackage.type} severity="info" />
        <h3>{healthPackage.name}</h3>
        <p>{healthPackage.description}</p>
        <strong className="package-card__price">{healthPackage.price}</strong>
        <ul className="benefit-list">
          {healthPackage.benefits.map((benefit) => (
            <li key={benefit}><i className="pi pi-check-circle" aria-hidden="true" /> {benefit}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default PackageCard;
