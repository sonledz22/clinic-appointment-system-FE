export interface DoctorMock {
  id: string;
  name: string;
  specialty: string;
  workplace: string;
  type: 'Bệnh viện' | 'Phòng khám';
  area: string;
  address: string;
  image: string;
  price: string;
  rating: number;
  experience: string;
  introduction: string;
  strengths: string[];
}

export const doctors: DoctorMock[] = [
  {
    id: 'doctor-1',
    name: 'Bác sĩ Chuyên khoa I Lý Thị Mỹ Dung',
    specialty: 'Sản Phụ khoa',
    workplace: 'Phòng khám Sản Phụ khoa Tâm Đức',
    type: 'Phòng khám',
    area: 'TP. Hồ Chí Minh',
    address: '229 Nguyễn Chí Thanh, Phường 12, Quận 5, TP. Hồ Chí Minh',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=500',
    price: '320.000 đ',
    rating: 4.9,
    experience: '26 năm kinh nghiệm',
    introduction: 'Chuyên gia sản phụ khoa, tư vấn thai sản và sức khỏe sinh sản với kinh nghiệm đồng hành cùng nhiều gia đình.',
    strengths: ['Khám thai định kỳ', 'Tư vấn sức khỏe sinh sản', 'Điều trị bệnh lý phụ khoa'],
  },
  {
    id: 'doctor-2',
    name: 'PGS.TS.BS Mai Xuân Hiên',
    specialty: 'Hồi sức Cấp cứu',
    workplace: 'Bệnh viện Đa khoa 16A Hà Đông',
    type: 'Bệnh viện',
    area: 'Hà Nội',
    address: 'Khu dịch vụ Xa La, Hà Đông, Hà Nội',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=500',
    price: '500.000 đ',
    rating: 5,
    experience: '42 năm kinh nghiệm',
    introduction: 'Bác sĩ chuyên sâu hồi sức cấp cứu và gây mê hồi sức, nhiều năm công tác tại bệnh viện tuyến trung ương.',
    strengths: ['Hồi sức cấp cứu', 'Gây mê hồi sức', 'Điều trị đau sau phẫu thuật'],
  },
  {
    id: 'doctor-3',
    name: 'ThS.BS CKII Bùi Tiến Công',
    specialty: 'Chẩn đoán Hình ảnh',
    workplace: 'Bệnh viện Đa khoa 16A Hà Đông',
    type: 'Bệnh viện',
    area: 'Hà Nội',
    address: 'Khu dịch vụ Xa La, Hà Đông, Hà Nội',
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=500',
    price: '350.000 đ',
    rating: 4.8,
    experience: '18 năm kinh nghiệm',
    introduction: 'Bác sĩ chuyên đọc kết quả CT, MRI, siêu âm và hỗ trợ chẩn đoán chính xác cho điều trị lâm sàng.',
    strengths: ['CT Scanner', 'MRI tim mạch và thần kinh', 'Siêu âm Doppler màu'],
  },
  {
    id: 'doctor-4',
    name: 'Bác sĩ Nguyễn Minh Anh',
    specialty: 'Nhi khoa',
    workplace: 'Phòng khám Nhi An Tâm',
    type: 'Phòng khám',
    area: 'Đà Nẵng',
    address: '72 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=500',
    price: '280.000 đ',
    rating: 4.7,
    experience: '12 năm kinh nghiệm',
    introduction: 'Bác sĩ nhi khoa thân thiện, chuyên khám tổng quát, tư vấn dinh dưỡng và theo dõi phát triển trẻ nhỏ.',
    strengths: ['Khám nhi tổng quát', 'Tư vấn dinh dưỡng', 'Tiêm chủng và theo dõi phát triển'],
  },
];
