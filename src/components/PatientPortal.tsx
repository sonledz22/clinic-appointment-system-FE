import React, { useState } from 'react';
import { Search, MapPin, Calendar, Clock, LogOut, CheckCircle, Award, Star, ShieldCheck, Stethoscope, ChevronRight } from 'lucide-react';
import { doLogout, getUserInfo } from '../services/keycloak';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  address: string;
  image: string;
  price: string;
  rating: string;
  experience: string;
  introduction: string;
  strengths: string[];
}

const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Bác sĩ Chuyên khoa I Lý Thị Mỹ Dung',
    specialty: 'Sản Phụ khoa & Vô sinh',
    clinic: 'Phòng khám Sản Phụ khoa Tâm Đức',
    address: '229 Nguyễn Chí Thanh, Phường 12, Quận 5, TP. Hồ Chí Minh',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    price: '320.000 đ',
    rating: '4.9',
    experience: '26 năm kinh nghiệm',
    introduction: 'Bác sĩ Chuyên khoa I Lý Thị Mỹ Dung là chuyên gia có hơn 26 năm kinh nghiệm trong lĩnh vực Sản phụ khoa, chẩn đoán trước sinh và điều trị vô sinh hiếm muộn, đồng hành cùng hàng ngàn bà mẹ vượt cạn an toàn.',
    strengths: ['Khám thai định kỳ & Quản lý thai sản phức tạp', 'Điều trị các bệnh lý phụ khoa lành tính & viêm nhiễm', 'Tư vấn sức khỏe sinh sản & Kế hoạch hóa gia đình']
  },
  {
    id: '2',
    name: 'Phó Giáo sư, Tiến sĩ, Bác sĩ Mai Xuân Hiên',
    specialty: 'Hồi sức Cấp cứu & Gây mê',
    clinic: 'Bệnh viện Đa khoa 16A Hà Đông',
    address: 'Lô 150 Khu Dịch Vụ Xa La, Phúc La, Hà Đông, Hà Nội',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    price: '500.000 đ',
    rating: '5.0',
    experience: '42 năm kinh nghiệm',
    introduction: 'Thầy thuốc Nhân dân, PGS.TS Mai Xuân Hiên là chuyên gia đầu ngành trong lĩnh vực gây mê hồi sức và hồi sức cấp cứu tại Việt Nam với hơn 40 năm cống hiến tại các bệnh viện lớn.',
    strengths: ['Hồi sức cấp cứu nội khoa và ngoại khoa', 'Gây mê hồi sức trong các ca phẫu thuật phức tạp', 'Điều trị chống đau sau phẫu thuật và đau mãn tính']
  },
  {
    id: '3',
    name: 'Thạc sĩ, Bác sĩ Chuyên khoa II Bùi Tiến Công',
    specialty: 'Chẩn đoán Hình ảnh',
    clinic: 'Bệnh viện Đa khoa 16A Hà Đông',
    address: 'Lô 150 Khu Dịch Vụ Xa La, Phúc La, Hà Đông, Hà Nội',
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300',
    price: '350.000 đ',
    rating: '4.8',
    experience: '18 năm kinh nghiệm',
    introduction: 'Thạc sĩ Bác sĩ Bùi Tiến Công chuyên sâu về đọc phim chẩn đoán hình ảnh cao cấp (MRI, CT-Scan) hỗ trợ đắc lực và chính xác cho các khoa lâm sàng đưa ra hướng điều trị tốt nhất.',
    strengths: ['Chụp và đọc kết quả Cắt lớp vi tính (CT 64, 128 dãy)', 'Cộng hưởng từ (MRI) tim mạch, thần kinh, cơ xương khớp', 'Siêu âm Doppler màu mạch máu và siêu âm 4D']
  }
];

const PatientPortal: React.FC = () => {
  const userInfo = getUserInfo();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(mockDoctors[0]);
  const [bookingDate, setBookingDate] = useState('2026-06-25');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const filteredDoctors = mockDoctors.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.clinic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTime) return;
    setBookingSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-700 font-sans flex flex-col w-full antialiased">
      {/* Navigation Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2.5 group cursor-pointer">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#007BFF] to-[#00BFFF] flex items-center justify-center text-white shadow-md shadow-[#007BFF]/20 transform group-hover:scale-105 transition-all duration-350">
                <Stethoscope className="w-5.5 h-5.5" />
              </div>
              <span className="text-2xl font-extrabold text-[#007BFF] tracking-tight">Đặtkhámnhanh</span>
            </div>
            <nav className="hidden lg:flex items-center gap-7 text-[14px] font-semibold text-slate-500">
              <a href="#" className="text-[#007BFF] hover:text-[#0056b3] transition-colors relative after:absolute after:bottom-[-29px] after:left-0 after:w-full after:h-0.5 after:bg-[#007BFF]">Trang chủ</a>
              <a href="#" className="hover:text-[#007BFF] transition-colors">Bác sĩ</a>
              <a href="#" className="hover:text-[#007BFF] transition-colors">Bệnh viện</a>
              <a href="#" className="hover:text-[#007BFF] transition-colors">Phòng khám</a>
              <a href="#" className="hover:text-[#007BFF] transition-colors">Gói khám</a>
              <a href="#" className="hover:text-[#007BFF] transition-colors">Cẩm nang</a>
            </nav>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-medium">Bệnh nhân</p>
              <p className="text-xs font-bold text-slate-700">{userInfo.name || 'Người dùng thử nghiệm'}</p>
            </div>
            <button
              onClick={() => doLogout()}
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-white border border-red-200 hover:bg-red-500 hover:border-red-500 px-4 py-2.5 rounded-xl transition-all-300 bg-white shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Search Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0062E6] via-[#007BFF] to-[#00C6FF] py-20 px-8 text-center text-white shadow-inner">
        {/* Decorative background shapes */}
        <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-50%] right-[-20%] w-[600px] h-[600px] rounded-full bg-cyan-400/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-sm font-display">
            Chăm sóc sức khỏe toàn diện
          </h1>
          <p className="text-md lg:text-lg text-slate-100 font-medium tracking-wide">
            Tìm bác sĩ chuyên khoa phù hợp và đặt lịch trực tuyến chỉ trong vài giây.
          </p>

          <div className="relative max-w-2xl mx-auto shadow-2xl rounded-2xl bg-white flex items-center p-2.5 border border-white/10 group focus-within:ring-2 focus-within:ring-[#E6F7FF]">
            <Search className="w-5.5 h-5.5 text-slate-400 ml-4 shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm chuyên khoa, bác sĩ, phòng khám..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-[14px] pl-3 pr-4 py-3.5 text-slate-800 focus:outline-none placeholder:text-slate-400 font-medium"
            />
            <button className="bg-gradient-to-r from-[#007BFF] to-[#0056b3] hover:from-[#0056b3] hover:to-[#004085] text-white rounded-xl px-7 py-3.5 font-bold text-xs tracking-wide transition-all-300 shadow-md cursor-pointer shrink-0">
              TÌM KIẾM
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid Viewport */}
      <main className="flex-1 max-w-7xl mx-auto px-8 py-14 w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Doctor Grid Column (7 cols) */}
        <section className="lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-150 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-display">Đặt lịch với bác sĩ nổi bật</h2>
              <p className="text-slate-400 text-xs mt-1">Thông tin minh bạch - Lịch hẹn chính xác</p>
            </div>
            <span className="text-xs font-bold text-[#007BFF] bg-[#E6F7FF] px-3.5 py-1.5 rounded-full shadow-sm">
              {filteredDoctors.length} bác sĩ sẵn sàng
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredDoctors.map(doc => (
              <div
                key={doc.id}
                onClick={() => {
                  setSelectedDoctor(doc);
                  setBookingSuccess(false);
                }}
                className={`bg-white border rounded-3xl p-6 flex flex-col items-center text-center cursor-pointer transition-all duration-350 shadow-premium hover:shadow-premium-hover ${
                  selectedDoctor.id === doc.id 
                    ? 'border-[#007BFF] ring-4 ring-[#007BFF]/5 scale-[1.01]' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="relative">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#E6F7FF] shadow-inner"
                  />
                  <div className="absolute bottom-0 right-1 bg-white shadow-md rounded-full px-2 py-0.5 flex items-center gap-0.5 border border-slate-100">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-extrabold text-slate-700">{doc.rating}</span>
                  </div>
                </div>

                <span className="text-[11px] font-extrabold text-[#007BFF] bg-[#E6F7FF] px-3 py-1 rounded-full mt-4 tracking-wide uppercase">
                  {doc.specialty}
                </span>

                <h3 className="font-extrabold text-slate-800 text-[14.5px] leading-snug mt-3 h-12 flex items-center justify-center line-clamp-2 px-1">
                  {doc.name}
                </h3>

                <p className="text-slate-400 text-[11px] font-semibold mt-1">{doc.experience}</p>

                <div className="flex items-center gap-1 text-slate-500 text-xs mt-4">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[210px] font-medium">{doc.clinic}</span>
                </div>

                <div className="w-full border-t border-slate-100 mt-5 pt-4 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Giá dịch vụ</span>
                    <span className="text-[14px] font-extrabold text-red-500">{doc.price}</span>
                  </div>
                  <span className="text-xs font-bold text-[#007BFF] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Xem chi tiết <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Doctor Details Section & Booking Form (5 cols) */}
        <section className="lg:col-span-5">
          <div className="bg-white border border-slate-100 rounded-3xl p-7 shadow-premium sticky top-28 space-y-6">
            
            {/* Doctor Info header card */}
            <div className="flex gap-4.5 pb-5 border-b border-slate-100">
              <img
                src={selectedDoctor.image}
                alt={selectedDoctor.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-[#007BFF] uppercase tracking-wider">{selectedDoctor.specialty}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>{selectedDoctor.rating}</span>
                  </div>
                </div>
                <h3 className="font-extrabold text-slate-800 text-[15px] leading-snug mt-1">{selectedDoctor.name}</h3>
                <p className="text-[11.5px] text-slate-400 font-semibold mt-0.5">{selectedDoctor.experience}</p>
              </div>
            </div>

            {/* Giới thiệu */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider font-display">Giới thiệu</h4>
              <p className="text-xs text-slate-550 leading-relaxed font-medium">{selectedDoctor.introduction}</p>
            </div>

            {/* Thế mạnh chuyên môn */}
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider font-display">Thế mạnh chuyên môn</h4>
              <ul className="space-y-2">
                {selectedDoctor.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                    <Award className="w-4 h-4 text-[#007BFF] shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Thông tin chung */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Địa điểm khám</span>
                <span className="text-slate-700 font-bold mt-1 block leading-tight">{selectedDoctor.clinic}</span>
                <span className="text-slate-400 text-[10px] font-medium mt-0.5 block leading-tight">{selectedDoctor.address}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Giá tư vấn</span>
                <span className="text-red-500 font-black text-base mt-1 block">{selectedDoctor.price}</span>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleBooking} className="pt-5 border-t border-slate-100 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Ngày khám</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-slate-200 text-xs rounded-xl p-3 text-slate-700 font-bold focus:outline-none focus:border-[#007BFF]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Khung giờ</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    required
                    className="w-full bg-[#F8F9FA] border border-slate-200 text-xs rounded-xl p-3 text-slate-700 font-bold focus:outline-none focus:border-[#007BFF]"
                  >
                    <option value="">Chọn giờ khám</option>
                    <option value="08:00">08:00 - 09:00</option>
                    <option value="09:00">09:00 - 10:00</option>
                    <option value="10:00">10:00 - 11:00</option>
                    <option value="14:00">14:00 - 15:00</option>
                    <option value="15:00">15:00 - 16:00</option>
                  </select>
                </div>
              </div>

              {bookingSuccess ? (
                <div className="bg-[#E6F7FF] border border-[#007BFF]/20 text-[#007BFF] rounded-2xl p-4 flex gap-3 items-center shadow-sm">
                  <CheckCircle className="w-5.5 h-5.5 text-[#007BFF] shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Đặt khám thành công!</p>
                    <p className="text-[11px] text-[#007BFF]/80 font-semibold mt-0.5">
                      Khung giờ: {bookingTime} ngày {bookingDate}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#007BFF] to-[#0056b3] hover:from-[#0056b3] hover:to-[#004085] text-white font-bold text-xs tracking-wider py-4 rounded-xl transition-all-300 shadow-md shadow-[#007BFF]/10 cursor-pointer"
                >
                  ĐẶT KHÁM BÁC SĨ NGAY
                </button>
              )}
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center text-xs text-slate-400 mt-16 shadow-inner">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-semibold">© 2026 Đặtkhámnhanh. Nền tảng kết nối y tế số một Việt Nam.</span>
          <div className="flex gap-4 font-bold text-slate-400">
            <a href="#" className="hover:text-[#007BFF]">Quy chế hoạt động</a>
            <span>•</span>
            <a href="#" className="hover:text-[#007BFF]">Liên hệ hợp tác</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientPortal;
