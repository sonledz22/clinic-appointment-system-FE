export interface ClinicMock {
  id: string;
  name: string;
  area: string;
  address: string;
  openingHours: string;
  highlightedSpecialties: string[];
  rating: number;
  image: string;
}

export const clinics: ClinicMock[] = [
  {
    id: 'clinic-1',
    name: 'Phòng khám Sản Phụ khoa Tâm Đức',
    area: 'TP. Hồ Chí Minh',
    address: '229 Nguyễn Chí Thanh, Quận 5, TP. Hồ Chí Minh',
    openingHours: '07:30 - 20:00, Thứ 2 - Thứ 7',
    highlightedSpecialties: ['Sản phụ khoa', 'Thai sản', 'Tư vấn sinh sản'],
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=700',
  },
  {
    id: 'clinic-2',
    name: 'Phòng khám Nhi An Tâm',
    area: 'Đà Nẵng',
    address: '72 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    openingHours: '08:00 - 18:30, hằng ngày',
    highlightedSpecialties: ['Nhi khoa', 'Dinh dưỡng', 'Tiêm chủng'],
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&q=80&w=700',
  },
  {
    id: 'clinic-3',
    name: 'Phòng khám Nội tổng quát An Khang',
    area: 'Hà Nội',
    address: '35 Trần Duy Hưng, Cầu Giấy, Hà Nội',
    openingHours: '07:00 - 19:00, Thứ 2 - Chủ nhật',
    highlightedSpecialties: ['Nội tổng quát', 'Tim mạch', 'Hô hấp'],
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=700',
  },
];
