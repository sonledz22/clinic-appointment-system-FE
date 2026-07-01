import { useMemo, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import SearchBar from '@/components/ui/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import PackageCard from '@/features/packages/components/PackageCard';
import { healthPackages } from '@/mocks/packages';

export interface HealthPackagesPageProps {}

const HealthPackagesPage = ({}: Readonly<HealthPackagesPageProps>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [type, setType] = useState<string | null>(null);
  const typeOptions = useMemo(() => Array.from(new Set(healthPackages.map((item) => item.type))), []);

  const filteredPackages = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return healthPackages.filter((item) => {
      const matchesSearch = !keyword || [item.name, item.description, item.type, ...item.benefits].some((value) => value.toLowerCase().includes(keyword));
      return matchesSearch && (!type || item.type === type);
    });
  }, [searchTerm, type]);

  return (
    <AppLayout>
      <PageHeader eyebrow="Gói khám" title="So sánh và đăng ký gói khám" description="Các gói khám được thiết kế theo nhu cầu kiểm tra sức khỏe cá nhân và gia đình." badge={`${filteredPackages.length} gói khám`} />
      <section className="filter-bar">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Tìm gói khám, quyền lợi..." />
        <Dropdown value={type} options={typeOptions} onChange={(event) => setType(event.value)} placeholder="Loại gói" showClear />
      </section>
      {filteredPackages.length ? <section className="entity-grid">{filteredPackages.map((item) => <PackageCard key={item.id} healthPackage={item} />)}</section> : <EmptyState title="Không tìm thấy gói khám" />}
    </AppLayout>
  );
};

export default HealthPackagesPage;
