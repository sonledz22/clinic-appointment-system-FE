import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import { useAuthStore } from '@/stores/auth.store';

interface PatientProfile {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: Date | null;
  gender: string;
  address: string;
  medicalHistory: string;
  avatarUrl: string;
}

interface AppointmentHistory {
  id: string;
  doctorName: string;
  specialty: string;
  startTime: string;
  endTime: string;
  patientName: string;
  patientPhone: string;
  patientSymptoms: string;
  status: string;
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const userInfo = {
    id: user?.userId ?? user?.id ?? 'anonymous',
    email: user?.email ?? '',
    name: user?.email ? user.email.split('@')[0] : '',
  };
  const profileKey = `patient_profile_${userInfo.id}`;

  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState<PatientProfile>({
    fullName: userInfo.name || '',
    phoneNumber: '',
    dateOfBirth: null,
    gender: 'Nam',
    address: '',
    medicalHistory: '',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  });

  // History state
  const [appointments, setAppointments] = useState<AppointmentHistory[]>([]);

  // Load profile and history from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem(profileKey);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile({
          ...parsed,
          dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
        });
      } catch (e) {
        console.error('Error parsing profile', e);
      }
    }

    const savedAppts = localStorage.getItem('patient_appointments');
    if (savedAppts) {
      try {
        setAppointments(JSON.parse(savedAppts));
      } catch (e) {
        console.error('Error parsing appointments', e);
      }
    }
  }, [profileKey]);

  const genderOptions = [
    { label: 'Nam', value: 'Nam' },
    { label: 'Nữ', value: 'Nữ' },
    { label: 'Khác', value: 'Khác' },
  ];

  const handleSave = () => {
    setLoading(true);
    setSaveSuccess(false);

    // Simulate API delay
    setTimeout(() => {
      localStorage.setItem(profileKey, JSON.stringify(profile));
      setLoading(false);
      setSaveSuccess(true);
      // Hide success banner after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  const formatSlotTime = (startTimeStr: string, endTimeStr: string) => {
    try {
      const start = new Date(startTimeStr);
      const end = new Date(endTimeStr);
      const timeFormatter = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return `${timeFormatter.format(start)} - ${timeFormatter.format(end)} ngày ${dateFormatter.format(start)}`;
    } catch {
      return 'Chưa xác định';
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        eyebrow="Hồ sơ bệnh nhân" 
        title="Trang cá nhân" 
        description="Quản lý thông tin y tế cá nhân và theo dõi lịch sử đặt lịch khám bệnh của bạn." 
      />

      <div className="max-w-4xl mx-auto px-4 mb-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-6 font-semibold border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="pi pi-user mr-2" />
            Thông tin cá nhân
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-6 font-semibold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="pi pi-calendar mr-2" />
            Lịch sử đặt khám
            {appointments.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {appointments.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Profile Edit */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: Avatar & Account summary */}
            <Card className="flex flex-col items-center text-center p-4 border border-gray-100 shadow-sm h-fit">
              <div className="flex flex-col items-center gap-3">
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 m-0">{profile.fullName || 'Chưa cập nhật tên'}</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-0">{userInfo.email}</p>
                </div>
                <Tag value="Bệnh nhân" severity="success" className="px-3 py-1 rounded" />
                <div className="mt-2 w-full">
                  <label htmlFor="avatar-url" className="text-xs font-bold text-gray-500 block mb-1">Link ảnh đại diện</label>
                  <InputText 
                    id="avatar-url"
                    value={profile.avatarUrl}
                    onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                    className="p-inputtext-sm w-full text-xs"
                    placeholder="URL hình ảnh"
                  />
                </div>
              </div>
            </Card>

            {/* Right Column: Profile Form fields */}
            <Card className="col-span-2 border border-gray-100 shadow-sm p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Thông tin y tế & liên lạc</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 col-span-2">
                  <label htmlFor="fullName" className="text-xs font-bold text-gray-700">Họ và tên *</label>
                  <InputText 
                    id="fullName" 
                    value={profile.fullName} 
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="phoneNumber" className="text-xs font-bold text-gray-700">Số điện thoại *</label>
                  <InputText 
                    id="phoneNumber" 
                    value={profile.phoneNumber} 
                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                    placeholder="Nhập số điện thoại"
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="email" className="text-xs font-bold text-gray-700">Địa chỉ Email</label>
                  <InputText 
                    id="email" 
                    value={userInfo.email || ''} 
                    disabled 
                    className="w-full bg-gray-50 cursor-not-allowed text-gray-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="dob" className="text-xs font-bold text-gray-700">Ngày sinh</label>
                  <Calendar 
                    id="dob" 
                    value={profile.dateOfBirth} 
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.value as Date | null })} 
                    showIcon 
                    dateFormat="dd/mm/yy"
                    placeholder="Chọn ngày sinh"
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="gender" className="text-xs font-bold text-gray-700">Giới tính</label>
                  <Dropdown 
                    id="gender" 
                    value={profile.gender} 
                    options={genderOptions} 
                    onChange={(e) => setProfile({ ...profile, gender: e.value })}
                    placeholder="Chọn giới tính"
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <label htmlFor="address" className="text-xs font-bold text-gray-700">Địa chỉ hiện tại</label>
                  <InputText 
                    id="address" 
                    value={profile.address} 
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="Nhập địa chỉ nhà"
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <label htmlFor="history" className="text-xs font-bold text-gray-700">Tiền sử bệnh án / Lưu ý sức khỏe</label>
                  <InputTextarea 
                    id="history" 
                    value={profile.medicalHistory} 
                    onChange={(e) => setProfile({ ...profile, medicalHistory: e.target.value })}
                    placeholder="Mô tả tiền sử bệnh án, dị ứng thuốc (nếu có)..."
                    rows={4}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="mt-5 flex items-center justify-between border-t pt-4">
                <div>
                  {saveSuccess && (
                    <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                      <i className="pi pi-check" /> Đã lưu thông tin thành công!
                    </span>
                  )}
                </div>
                <Button
                  label={loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  icon="pi pi-save"
                  onClick={handleSave}
                  disabled={loading}
                  className="p-button-primary px-4"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Appointment History */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-4">
            {appointments.length === 0 ? (
              <Card className="text-center p-8 border border-gray-100 shadow-sm">
                <i className="pi pi-calendar-times text-5xl text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-800 m-0">Không tìm thấy lịch hẹn</h3>
                <p className="text-sm text-gray-500 mt-2 mb-0">Bạn chưa đặt lịch khám nào trên hệ thống.</p>
              </Card>
            ) : (
              appointments.map((appt) => (
                <Card 
                  key={appt.id} 
                  className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Appointment details */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag value="Đã xác nhận" severity="success" className="rounded" />
                        <span className="text-xs text-gray-400">Đặt lúc: {new Date(appt.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 m-0">Bác sĩ: {appt.doctorName}</h4>
                      <div className="text-sm text-blue-600 font-semibold mt-1">{appt.specialty}</div>
                      
                      <div className="mt-2 flex flex-col gap-1 text-sm text-gray-600">
                        <div>
                          <i className="pi pi-clock mr-2 text-gray-400" />
                          <strong>Giờ khám: </strong>{formatSlotTime(appt.startTime, appt.endTime)}
                        </div>
                        <div>
                          <i className="pi pi-user mr-2 text-gray-400" />
                          <strong>Bệnh nhân: </strong>{appt.patientName} ({appt.patientPhone})
                        </div>
                        {appt.patientSymptoms && (
                          <div className="italic text-gray-500 mt-1">
                            "Triệu chứng: {appt.patientSymptoms}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions on history card */}
                    <div className="flex md:flex-col gap-2 justify-end">
                      <Button 
                        label="Xem hóa đơn" 
                        icon="pi pi-file-pdf" 
                        outlined 
                        className="p-button-sm text-xs" 
                        onClick={() => alert('Chức năng xuất hóa đơn sẽ được cập nhật sau.')}
                      />
                      <Button 
                        label="Yêu cầu hỗ trợ" 
                        icon="pi pi-question-circle" 
                        text 
                        className="p-button-sm text-xs text-gray-500 hover:text-gray-700" 
                        onClick={() => alert('Đã gửi yêu cầu hỗ trợ. Bộ phận CSKH sẽ liên hệ sớm nhất.')}
                      />
                    </div>

                  </div>
                </Card>
              ))
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default ProfilePage;
