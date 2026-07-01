export interface GuideMock {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
  description: string;
  readingTime: string;
}

export const guides: GuideMock[] = [
  {
    id: 'guide-1',
    title: '5 dấu hiệu nên đi khám tim mạch sớm',
    category: 'Tim mạch',
    publishedAt: '24/06/2026',
    description: 'Nhận biết các triệu chứng thường gặp như đau ngực, khó thở, hồi hộp để chủ động đặt lịch khám kịp thời.',
    readingTime: '4 phút đọc',
  },
  {
    id: 'guide-2',
    title: 'Chuẩn bị gì trước khi khám sức khỏe tổng quát?',
    category: 'Khám tổng quát',
    publishedAt: '20/06/2026',
    description: 'Các lưu ý về nhịn ăn, giấy tờ, tiền sử bệnh và danh sách thuốc đang sử dụng trước ngày khám.',
    readingTime: '5 phút đọc',
  },
  {
    id: 'guide-3',
    title: 'Lịch tiêm chủng quan trọng cho trẻ nhỏ',
    category: 'Nhi khoa',
    publishedAt: '18/06/2026',
    description: 'Tóm tắt các mốc tiêm chủng cần nhớ và cách theo dõi phản ứng sau tiêm tại nhà.',
    readingTime: '6 phút đọc',
  },
  {
    id: 'guide-4',
    title: 'Dinh dưỡng thai kỳ trong 3 tháng đầu',
    category: 'Sản phụ khoa',
    publishedAt: '12/06/2026',
    description: 'Gợi ý nhóm thực phẩm, vitamin cần thiết và những điều nên tránh trong giai đoạn đầu thai kỳ.',
    readingTime: '5 phút đọc',
  },
];
