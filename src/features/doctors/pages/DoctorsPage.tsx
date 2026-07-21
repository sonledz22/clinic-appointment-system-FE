import { useEffect, useMemo, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import SearchBar from '@/components/ui/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import DoctorCard from '@/features/doctors/components/DoctorCard';
import AppImage from '@/components/common/AppImage';
import { 
  fetchDoctors, 
  mapDoctorToCard, 
  fetchDoctorSlots, 
  reserveDoctorSlot, 
  bookDoctorSlot 
} from '@/features/doctors/services/doctorApi';
import type { DoctorCardViewModel, Slot } from '@/features/doctors/types/doctor';
import { useAuthStore } from '@/stores/auth.store';

export interface DoctorsPageProps {}

const DoctorsPage = ({}: Readonly<DoctorsPageProps>) => {
  const user = useAuthStore((state) => state.user);
  const [doctors, setDoctors] = useState<DoctorCardViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [workplaceType, setWorkplaceType] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [specialtyOptions, setSpecialtyOptions] = useState<string[]>([]);

  // States for Booking Dialog
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorCardViewModel | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // States for Patient Info Form
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientSymptoms, setPatientSymptoms] = useState('');
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadDoctors = async () => {
      setLoading(true);
      try {
        const response = await fetchDoctors(specialty || undefined);
        if (!mounted) {
          return;
        }
        const mapped = response.map(mapDoctorToCard);
        setDoctors(mapped);
        
        // Save the full list of specialties on initial load
        if (!specialty) {
          const uniqueSpecialties = Array.from(new Set(mapped.map((doctor) => doctor.specialty)));
          setSpecialtyOptions(uniqueSpecialties);
        }
        setError('');
      } catch {
        if (!mounted) {
          return;
        }
        setDoctors([]);
        setError('Khong the tai danh sach bac si tu doctor-service.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDoctors();

    return () => {
      mounted = false;
    };
  }, [specialty]);

  const typeOptions = ['Bệnh viện', 'Phòng khám'];
  const ratingOptions = [5, 4.8, 4.5];

  const filteredDoctors = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSearch = !keyword || [doctor.name, doctor.specialty, doctor.workplace, doctor.area].some((value) => value.toLowerCase().includes(keyword));
      const matchesType = !workplaceType || doctor.type === workplaceType;
      const matchesRating = !rating || doctor.rating >= rating;
      return matchesSearch && matchesType && matchesRating;
    });
  }, [doctors, rating, searchTerm, workplaceType]);

  // Handle open Booking Dialog
  const handleOpenBooking = async (doctor: DoctorCardViewModel) => {
    setSelectedDoctor(doctor);
    setShowBookingDialog(true);
    setSlots([]);
    setSelectedSlot(null);
    setBookingSuccess(false);
    setBookingError('');
    setLoadingSlots(true);

    const currentUserEmail = user?.email ?? '';
    setPatientName(currentUserEmail ? currentUserEmail.split('@')[0] : '');
    setPatientPhone('');
    setPatientSymptoms('');

    try {
      const data = await fetchDoctorSlots(doctor.id);
      setSlots(data);
    } catch {
      setBookingError('Không thể tải danh sách khung giờ khám của bác sĩ.');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Helper to format slot time nicely
  const formatSlotTime = (startTimeStr: string, endTimeStr: string) => {
    try {
      const start = new Date(startTimeStr);
      const end = new Date(endTimeStr);
      const timeFormatter = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return {
        time: `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`,
        date: dateFormatter.format(start),
      };
    } catch {
      return { time: 'Chưa xác định', date: 'Chưa xác định' };
    }
  };

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const groups: Record<string, Slot[]> = {};
    slots.forEach((slot) => {
      const formatted = formatSlotTime(slot.startTime, slot.endTime);
      if (!groups[formatted.date]) {
        groups[formatted.date] = [];
      }
      groups[formatted.date].push(slot);
    });
    return groups;
  }, [slots]);

  // Confirm booking handler
  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    if (!patientName.trim() || !patientPhone.trim()) {
      setBookingError('Vui lòng nhập đầy đủ Họ tên và Số điện thoại.');
      return;
    }

    setBookingInProgress(true);
    setBookingError('');

    try {
      // 1. Reserve the slot
      await reserveDoctorSlot(selectedDoctor.id, selectedSlot.id);
      
      // 2. Book the slot
      await bookDoctorSlot(selectedDoctor.id, selectedSlot.id);
      
      // 3. Save to localStorage for patient profile history
      const newAppointment = {
        id: selectedSlot.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        patientName,
        patientPhone,
        patientSymptoms,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
      };
      const existingAppts = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
      localStorage.setItem('patient_appointments', JSON.stringify([newAppointment, ...existingAppts]));

      setBookingSuccess(true);
      
      // Refresh the slots list
      const updatedSlots = await fetchDoctorSlots(selectedDoctor.id);
      setSlots(updatedSlots);
      setSelectedSlot(null);
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình đặt lịch khám.');
    } finally {
      setBookingInProgress(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader eyebrow="Danh sách bác sĩ" title="Tìm bác sĩ phù hợp với nhu cầu khám" description="Lọc theo chuyên khoa, loại cơ sở và đánh giá để đặt lịch nhanh hơn." badge={`${filteredDoctors.length} bác sĩ`} />
      <section className="filter-bar">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Tìm tên bác sĩ, chuyên khoa, nơi làm việc..." />
        <Dropdown value={specialty} options={specialtyOptions} onChange={(event) => setSpecialty(event.value)} placeholder="Chuyên khoa" showClear />
        <Dropdown value={workplaceType} options={typeOptions} onChange={(event) => setWorkplaceType(event.value)} placeholder="Cơ sở" showClear />
        <Dropdown value={rating} options={ratingOptions} onChange={(event) => setRating(event.value)} placeholder="Rating từ" showClear />
      </section>
      {loading ? (
        <EmptyState title="Dang tai du lieu bac si" description="Frontend dang goi doctor-service de lay danh sach bac si." />
      ) : error ? (
        <EmptyState title="Khong tai duoc doctor-service" description={error} />
      ) : filteredDoctors.length ? (
        <section className="entity-grid">
          {filteredDoctors.map((doctor) => (
            <DoctorCard 
              key={doctor.id} 
              doctor={doctor} 
              onViewDetails={handleOpenBooking}
              onBook={handleOpenBooking}
            />
          ))}
        </section>
      ) : (
        <EmptyState title="Không tìm thấy bác sĩ" description="Thử đổi từ khóa hoặc bỏ bớt bộ lọc để xem thêm kết quả." />
      )}

      {/* Booking and Details Dialog */}
      <Dialog
        header={selectedDoctor ? `Thông tin & Đặt lịch khám: ${selectedDoctor.name}` : ''}
        visible={showBookingDialog}
        style={{ width: '90vw', maxWidth: '850px' }}
        onHide={() => setShowBookingDialog(false)}
        modal
        dismissableMask
        className="booking-dialog"
      >
        {selectedDoctor && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            
            {/* Left side: Doctor Profile Details */}
            <div className="flex flex-col gap-3 p-3 border-right border-gray-200">
              <div className="flex items-center gap-3">
                <AppImage 
                  src={selectedDoctor.image} 
                  alt={selectedDoctor.name} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-500" 
                  fallbackLabel={selectedDoctor.name}
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 m-0">{selectedDoctor.name}</h3>
                  <span className="text-blue-600 font-semibold">{selectedDoctor.specialty}</span>
                  <div className="text-sm text-gray-500 mt-1">Đánh giá: ⭐ {selectedDoctor.rating.toFixed(1)}</div>
                </div>
              </div>

              <div className="mt-3">
                <h4 className="text-sm font-bold text-gray-700 mb-1">Nơi công tác & địa chỉ</h4>
                <p className="text-sm text-gray-600 m-0">{selectedDoctor.workplace}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedDoctor.address}</p>
              </div>

              <div className="mt-2">
                <h4 className="text-sm font-bold text-gray-700 mb-1">Giới thiệu</h4>
                <p className="text-sm text-gray-600 leading-relaxed m-0 italic">"{selectedDoctor.introduction}"</p>
              </div>

              <div className="mt-2">
                <h4 className="text-sm font-bold text-gray-700 mb-1">Kinh nghiệm & Bằng cấp</h4>
                <p className="text-sm text-gray-600 m-0">{selectedDoctor.experience}</p>
              </div>
            </div>

            {/* Right side: Slot booking workflow */}
            <div className="flex flex-col gap-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 border-b-2 border-blue-100 pb-1">
                  1. Chọn khung giờ khám
                </h3>

                {loadingSlots ? (
                  <div className="text-center py-4 text-gray-500">
                    <i className="pi pi-spin pi-spinner mr-2" /> Đang tải danh sách khung giờ...
                  </div>
                ) : Object.keys(slotsByDate).length === 0 ? (
                  <div className="text-center py-4 text-gray-500 italic">
                    Bác sĩ hiện không có khung giờ khám khả dụng.
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto pr-1">
                    {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                      <div key={date} className="mb-3">
                        <strong className="block text-sm text-gray-700 mb-1 font-semibold">📅 Ngày {date}</strong>
                        <div className="flex flex-wrap gap-1">
                          {dateSlots.map((slot) => {
                            const formatted = formatSlotTime(slot.startTime, slot.endTime);
                            const isSelected = selectedSlot?.id === slot.id;
                            const isBooked = slot.booked || slot.status === 'BOOKED' || slot.status === 'RESERVED';

                            return (
                              <button
                                key={slot.id}
                                type="button"
                                disabled={isBooked}
                                onClick={() => setSelectedSlot(slot)}
                                className={`text-xs font-semibold py-2 px-3 rounded border transition-colors cursor-pointer ${
                                  isBooked
                                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50'
                                }`}
                              >
                                {formatted.time} {isBooked && '(Đã đặt)'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 2: Patient Info Form */}
              {selectedSlot && (
                <div className="mt-2 border-t border-gray-200 pt-3">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    2. Nhập thông tin cá nhân
                  </h3>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="patient-name" className="text-xs font-bold text-gray-700">Họ tên bệnh nhân *</label>
                      <InputText 
                        id="patient-name" 
                        value={patientName} 
                        onChange={(e) => setPatientName(e.target.value)} 
                        placeholder="Nhập đầy đủ họ tên"
                        className="p-inputtext-sm w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="patient-phone" className="text-xs font-bold text-gray-700">Số điện thoại liên hệ *</label>
                      <InputText 
                        id="patient-phone" 
                        value={patientPhone} 
                        onChange={(e) => setPatientPhone(e.target.value)} 
                        placeholder="Nhập số điện thoại"
                        className="p-inputtext-sm w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="patient-symptoms" className="text-xs font-bold text-gray-700">Lý do khám / Triệu chứng bệnh</label>
                      <InputTextarea 
                        id="patient-symptoms" 
                        value={patientSymptoms} 
                        onChange={(e) => setPatientSymptoms(e.target.value)} 
                        placeholder="Mô tả triệu chứng để bác sĩ nắm được thông tin trước buổi khám..."
                        rows={2}
                        className="p-inputtext-sm w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status and Actions */}
              <div className="mt-3">
                {bookingError && (
                  <div className="p-2 mb-2 bg-red-50 text-red-600 rounded text-xs font-semibold flex items-center gap-1">
                    <i className="pi pi-exclamation-triangle" /> {bookingError}
                  </div>
                )}

                {bookingSuccess && (
                  <div className="p-3 mb-2 bg-green-50 text-green-700 rounded text-sm font-semibold flex items-center gap-2 border border-green-200">
                    <i className="pi pi-check-circle text-lg" />
                    <div>
                      <div>Đặt lịch khám thành công!</div>
                      <div className="text-xs font-normal text-gray-600 mt-1">Lịch khám của bạn đã được ghi nhận trên hệ thống.</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button 
                    label="Đóng" 
                    icon="pi pi-times" 
                    outlined 
                    onClick={() => setShowBookingDialog(false)} 
                    className="p-button-sm"
                  />
                  {selectedSlot && !bookingSuccess && (
                    <Button 
                      label={bookingInProgress ? "Đang xử lý..." : "Xác nhận đặt lịch"} 
                      icon="pi pi-calendar-check" 
                      onClick={handleConfirmBooking}
                      disabled={bookingInProgress}
                      className="p-button-sm p-button-success"
                    />
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </Dialog>

    </AppLayout>
  );
};

export default DoctorsPage;
