import axiosClient from '@/lib/axiosClient';
import { isAuthenticated, waitForKeycloakReady } from '@/services/keycloak';
import type { Doctor, DoctorCardViewModel, Slot } from '@/features/doctors/types/doctor';

const DEFAULT_DOCTOR_IMAGE = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=500';

const toDoctorCard = (doctor: Doctor): DoctorCardViewModel => ({
  id: doctor.id,
  name: doctor.name,
  specialty: doctor.specialization,
  workplace: doctor.active ? 'Cơ sở đã kích hoạt' : 'Cơ sở đang cập nhật',
  type: 'Phòng khám',
  area: 'TP. Hồ Chí Minh',
  address: doctor.email,
  image: doctor.avatarUrl || DEFAULT_DOCTOR_IMAGE,
  price: 'Liên hệ',
  rating: 4.8,
  experience: doctor.qualifications || (doctor.active ? 'Bác sĩ chuyên khoa' : 'Tạm ngưng nhận lịch'),
  introduction: doctor.biography || `Bác sĩ chuyên khoa ${doctor.specialization}. Liên hệ qua ${doctor.phoneNumber} để được hỗ trợ thêm.`,
  strengths: [doctor.specialization, 'Tư vấn khám bệnh', 'Theo dõi lịch hẹn'],
});

export const fetchDoctors = async (specialization?: string) => {
  const response = await axiosClient.get<Doctor[]>('/doctors', {
    params: specialization ? { specialization } : undefined,
  });
  return response.data;
};

export const fetchDoctorSlots = async (doctorId: string) => {
  const response = await axiosClient.get<Slot[]>(`/doctors/${doctorId}/slots`);
  return response.data;
};

export const addDoctorSlot = async (doctorId: string, startTime: string, endTime: string) => {
  const response = await axiosClient.post<Doctor>(`/doctors/${doctorId}/slots`, {
    startTime,
    endTime,
  });
  return response.data;
};

export const generateDoctorSlots = async (
  doctorId: string,
  startTime: string,
  endTime: string,
  slotDurationMinutes: number = 30
) => {
  const response = await axiosClient.post<Doctor>(`/doctors/${doctorId}/slots/generate`, {
    startTime,
    endTime,
    slotDurationMinutes,
  });
  return response.data;
};

export const reserveDoctorSlot = async (doctorId: string, slotId: string) => {
  const response = await axiosClient.post<Slot>(`/doctors/${doctorId}/slots/${slotId}/reserve`);
  return response.data;
};

export const releaseDoctorSlot = async (doctorId: string, slotId: string) => {
  const response = await axiosClient.post<Slot>(`/doctors/${doctorId}/slots/${slotId}/release`);
  return response.data;
};

export const bookDoctorSlot = async (doctorId: string, slotId: string) => {
  const response = await axiosClient.post<Slot>(`/doctors/${doctorId}/slots/${slotId}/book`);
  return response.data;
};

export const cancelDoctorSlotBooking = async (doctorId: string, slotId: string) => {
  const response = await axiosClient.delete<Slot>(`/doctors/${doctorId}/slots/${slotId}/book`);
  return response.data;
};

export const deleteDoctorSlot = async (doctorId: string, slotId: string) => {
  await axiosClient.delete(`/doctors/${doctorId}/slots/${slotId}`);
};

export const fetchMyProfile = async () => {
  await waitForKeycloakReady();
  if (!isAuthenticated()) {
    throw new Error('Keycloak is not authenticated yet');
  }
  const response = await axiosClient.get<Doctor>('/doctors/me');
  return response.data;
};

export const updateMyProfile = async (data: Partial<Doctor>) => {
  const response = await axiosClient.put<Doctor>('/doctors/me', data);
  return response.data;
};

export const mapDoctorToCard = toDoctorCard;
