import { useMemo, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import SearchBar from '@/components/ui/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import GuideCard from '@/features/guides/components/GuideCard';
import { guides } from '@/mocks/guides';

export interface GuidesPageProps {}

const GuidesPage = ({}: Readonly<GuidesPageProps>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const categoryOptions = useMemo(() => Array.from(new Set(guides.map((guide) => guide.category))), []);

  const filteredGuides = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return guides.filter((guide) => {
      const matchesSearch = !keyword || [guide.title, guide.description, guide.category].some((value) => value.toLowerCase().includes(keyword));
      return matchesSearch && (!category || guide.category === category);
    });
  }, [category, searchTerm]);

  return (
    <AppLayout>
      <PageHeader eyebrow="Cẩm nang sức khỏe" title="Kiến thức y tế dễ hiểu cho mọi gia đình" description="Cập nhật bài viết ngắn gọn giúp bạn chuẩn bị tốt hơn trước và sau khi đi khám." badge={`${filteredGuides.length} bài viết`} />
      <section className="filter-bar">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Tìm bài viết, chủ đề sức khỏe..." />
        <Dropdown value={category} options={categoryOptions} onChange={(event) => setCategory(event.value)} placeholder="Danh mục" showClear />
      </section>
      {filteredGuides.length ? <section className="entity-grid entity-grid--two">{filteredGuides.map((guide) => <GuideCard key={guide.id} guide={guide} />)}</section> : <EmptyState title="Không tìm thấy bài viết" />}
    </AppLayout>
  );
};

export default GuidesPage;
