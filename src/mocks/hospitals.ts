export interface HospitalMock {
  id: string;
  name: string;
  area: string;
  address: string;
  description: string;
  specialties: number;
  rating: number;
  image: string;
}

export const hospitals: HospitalMock[] = [
  {
    id: 'hospital-1',
    name: 'Bệnh viện Đa khoa 16A Hà Đông',
    area: 'Hà Nội',
    address: 'Lô 150 Khu dịch vụ Xa La, Hà Đông, Hà Nội',
    description: 'Cơ sở khám chữa bệnh đa khoa với hệ thống chẩn đoán hình ảnh, cấp cứu và chuyên khoa nội ngoại.',
    specialties: 18,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=700',
  },
  {
    id: 'hospital-2',
    name: 'Bệnh viện Quốc tế Sài Gòn Care',
    area: 'TP. Hồ Chí Minh',
    address: '88 Nguyễn Hữu Cảnh, Bình Thạnh, TP. Hồ Chí Minh',
    description: 'Bệnh viện tiêu chuẩn quốc tế, mạnh về tim mạch, sản khoa, nhi khoa và khám sức khỏe tổng quát.',
    specialties: 24,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=700',
  },
  {
    id: 'hospital-3',
    name: 'Trung tâm Y khoa Đà Nẵng Medic',
    area: 'Đà Nẵng',
    address: '120 Hải Phòng, Thanh Khê, Đà Nẵng',
    description: 'Trung tâm y khoa đa chuyên khoa với quy trình đặt lịch nhanh, trả kết quả điện tử và tư vấn sau khám.',
    specialties: 15,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=700',
  },
];
