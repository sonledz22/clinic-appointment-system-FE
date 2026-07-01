import { useMemo, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import SearchBar from '@/components/ui/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import DoctorCard from '@/features/doctors/components/DoctorCard';
import { doctors } from '@/mocks/doctors';

export interface DoctorsPageProps {}

const DoctorsPage = ({}: Readonly<DoctorsPageProps>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [workplaceType, setWorkplaceType] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);

  const specialtyOptions = useMemo(() => Array.from(new Set(doctors.map((doctor) => doctor.specialty))), []);
  const typeOptions = ['Bệnh viện', 'Phòng khám'];
  const ratingOptions = [5, 4.8, 4.5];

  const filteredDoctors = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSearch = !keyword || [doctor.name, doctor.specialty, doctor.workplace, doctor.area].some((value) => value.toLowerCase().includes(keyword));
      const matchesSpecialty = !specialty || doctor.specialty === specialty;
      const matchesType = !workplaceType || doctor.type === workplaceType;
      const matchesRating = !rating || doctor.rating >= rating;
      return matchesSearch && matchesSpecialty && matchesType && matchesRating;
    });
  }, [rating, searchTerm, specialty, workplaceType]);

  return (
    <AppLayout>
      <PageHeader eyebrow="Danh sách bác sĩ" title="Tìm bác sĩ phù hợp với nhu cầu khám" description="Lọc theo chuyên khoa, loại cơ sở và đánh giá để đặt lịch nhanh hơn." badge={`${filteredDoctors.length} bác sĩ`} />
      <section className="filter-bar">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Tìm tên bác sĩ, chuyên khoa, nơi làm việc..." />
        <Dropdown value={specialty} options={specialtyOptions} onChange={(event) => setSpecialty(event.value)} placeholder="Chuyên khoa" showClear />
        <Dropdown value={workplaceType} options={typeOptions} onChange={(event) => setWorkplaceType(event.value)} placeholder="Cơ sở" showClear />
        <Dropdown value={rating} options={ratingOptions} onChange={(event) => setRating(event.value)} placeholder="Rating từ" showClear />
      </section>
      {filteredDoctors.length ? (
        <section className="entity-grid">
          {filteredDoctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}
        </section>
      ) : (
        <EmptyState title="Không tìm thấy bác sĩ" description="Thử đổi từ khóa hoặc bỏ bớt bộ lọc để xem thêm kết quả." />
      )}
    </AppLayout>
  );
};

export default DoctorsPage;
