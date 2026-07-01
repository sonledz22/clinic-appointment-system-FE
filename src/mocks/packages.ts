export interface HealthPackageMock {
  id: string;
  name: string;
  type: string;
  description: string;
  price: string;
  benefits: string[];
}

export const healthPackages: HealthPackageMock[] = [
  {
    id: 'package-1',
    name: 'Gói khám sức khỏe tổng quát cơ bản',
    type: 'Cơ bản',
    description: 'Phù hợp kiểm tra định kỳ cho người trưởng thành, tập trung vào các chỉ số sức khỏe thiết yếu.',
    price: '799.000 đ',
    benefits: ['Khám nội tổng quát', 'Xét nghiệm máu cơ bản', 'Tư vấn kết quả sau khám'],
  },
  {
    id: 'package-2',
    name: 'Gói tầm soát tim mạch nâng cao',
    type: 'Chuyên sâu',
    description: 'Dành cho người có nguy cơ tim mạch, huyết áp cao, rối loạn mỡ máu hoặc tiền sử gia đình.',
    price: '1.890.000 đ',
    benefits: ['Điện tim', 'Siêu âm tim', 'Mỡ máu và đường huyết', 'Tư vấn chuyên khoa tim mạch'],
  },
  {
    id: 'package-3',
    name: 'Gói chăm sóc mẹ và bé',
    type: 'Gia đình',
    description: 'Theo dõi sức khỏe thai kỳ và tư vấn chăm sóc trẻ trong giai đoạn đầu đời.',
    price: '1.250.000 đ',
    benefits: ['Khám sản phụ khoa', 'Siêu âm thai', 'Tư vấn dinh dưỡng', 'Lịch nhắc tái khám'],
  },
];
