import { useMemo, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import SearchBar from '@/components/ui/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import ClinicCard from '@/features/clinics/components/ClinicCard';
import { clinics } from '@/mocks/clinics';

export interface ClinicsPageProps {}

const ClinicsPage = ({}: Readonly<ClinicsPageProps>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [area, setArea] = useState<string | null>(null);
  const areaOptions = useMemo(() => Array.from(new Set(clinics.map((clinic) => clinic.area))), []);

  const filteredClinics = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return clinics.filter((clinic) => {
      const matchesSearch = !keyword || [clinic.name, clinic.address, ...clinic.highlightedSpecialties].some((value) => value.toLowerCase().includes(keyword));
      return matchesSearch && (!area || clinic.area === area);
    });
  }, [area, searchTerm]);

  return (
    <AppLayout>
      <PageHeader eyebrow="Phòng khám" title="Phòng khám gần bạn" description="Lựa chọn phòng khám theo khu vực, giờ mở cửa và chuyên khoa nổi bật." badge={`${filteredClinics.length} phòng khám`} />
      <section className="filter-bar">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Tìm phòng khám hoặc chuyên khoa..." />
        <Dropdown value={area} options={areaOptions} onChange={(event) => setArea(event.value)} placeholder="Khu vực" showClear />
      </section>
      {filteredClinics.length ? <section className="entity-grid">{filteredClinics.map((clinic) => <ClinicCard key={clinic.id} clinic={clinic} />)}</section> : <EmptyState title="Không tìm thấy phòng khám" />}
    </AppLayout>
  );
};

export default ClinicsPage;
