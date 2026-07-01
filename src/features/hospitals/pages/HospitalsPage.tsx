import { useMemo, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import SearchBar from '@/components/ui/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import HospitalCard from '@/features/hospitals/components/HospitalCard';
import { hospitals } from '@/mocks/hospitals';

export interface HospitalsPageProps {}

const HospitalsPage = ({}: Readonly<HospitalsPageProps>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [area, setArea] = useState<string | null>(null);
  const areaOptions = useMemo(() => Array.from(new Set(hospitals.map((hospital) => hospital.area))), []);

  const filteredHospitals = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return hospitals.filter((hospital) => {
      const matchesSearch = !keyword || [hospital.name, hospital.address, hospital.description].some((value) => value.toLowerCase().includes(keyword));
      return matchesSearch && (!area || hospital.area === area);
    });
  }, [area, searchTerm]);

  return (
    <AppLayout>
      <PageHeader eyebrow="Bệnh viện" title="Bệnh viện uy tín trong hệ thống" description="Tìm cơ sở khám đa khoa, chuyên khoa và đặt lịch với bác sĩ phù hợp." badge={`${filteredHospitals.length} bệnh viện`} />
      <section className="filter-bar">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Tìm bệnh viện, địa chỉ, chuyên khoa..." />
        <Dropdown value={area} options={areaOptions} onChange={(event) => setArea(event.value)} placeholder="Khu vực" showClear />
      </section>
      {filteredHospitals.length ? <section className="entity-grid">{filteredHospitals.map((hospital) => <HospitalCard key={hospital.id} hospital={hospital} />)}</section> : <EmptyState title="Không tìm thấy bệnh viện" />}
    </AppLayout>
  );
};

export default HospitalsPage;
