import axiosClient from '@/api/axiosClient';

export interface PatientProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
  contactInformation: string | null;
}

export interface UserProfile {
  id: string;
  patientId: string | null;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  status: string;
  roles: Array<{ id: string; name: string; description: string }>;
}

export interface AppointmentHistory {
  id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  startTime: string;
  endTime: string;
  reason: string | null;
  specialization?: string | null;
  bookingSource?: string | null;
  cancelReason: string | null;
  cancelledBy?: string | null;
  cancelledByRole?: string | null;
  cancelledAt?: string | null;
  status: string;
  paymentStatus: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorSummary {
  id: string;
  userId: string;
  name: string;
  specialization: string;
  phoneNumber: string;
  email: string;
  active: boolean;
  biography?: string | null;
  qualifications?: string | null;
  avatarUrl?: string | null;
}

export interface UpdatePatientPayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string;
  contactInformation: string;
}

export interface UpdateUserPayload {
  fullName: string;
  phoneNumber: string;
}

export interface CancelAppointmentPayload {
  cancelReason: string;
}

export interface RescheduleAppointmentPayload {
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface RescheduleOption {
  startTime: string;
  endTime: string;
  availableCount: number;
}

export interface NotificationItem {
  id: string;
  recipientUserId: string;
  type: string;
  title: string;
  body: string;
  status: string;
  priority: number | null;
  createdAt: string;
  updatedAt: string;
  readAt: string | null;
}

export const profileApi = {
  async getUserProfile() {
    const response = await axiosClient.get<UserProfile>('/api/users/me');
    return response.data;
  },

  async updateUserProfile(payload: UpdateUserPayload) {
    const response = await axiosClient.put<UserProfile>('/api/users/me', payload);
    return response.data;
  },

  async getPatientProfile() {
    const response = await axiosClient.get<PatientProfile>('/api/patients/me');
    return response.data;
  },

  async updatePatientProfile(payload: UpdatePatientPayload) {
    const response = await axiosClient.put<PatientProfile>('/api/patients/me', payload);
    return response.data;
  },

  async getAppointments() {
    const response = await axiosClient.get<AppointmentHistory[]>('/api/appointments/me');
    return response.data;
  },

  async getAppointmentDetail(appointmentId: string) {
    const response = await axiosClient.get<AppointmentHistory>(`/api/appointments/${appointmentId}`);
    return response.data;
  },

  async cancelAppointment(appointmentId: string, payload: CancelAppointmentPayload) {
    const response = await axiosClient.post<AppointmentHistory>(`/api/appointments/${appointmentId}/cancel`, payload);
    return response.data;
  },

  async rescheduleAppointment(appointmentId: string, payload: RescheduleAppointmentPayload) {
    const response = await axiosClient.post<AppointmentHistory>(`/api/appointments/${appointmentId}/reschedule`, payload);
    return response.data;
  },

  async getRescheduleOptions(appointmentId: string, date: string) {
    const response = await axiosClient.get<RescheduleOption[]>(`/api/appointments/${appointmentId}/reschedule-options`, {
      params: { date },
    });
    return response.data;
  },

  async getDoctor(doctorId: string) {
    const response = await axiosClient.get<DoctorSummary>(`/api/doctors/${doctorId}`);
    return response.data;
  },

  async getNotifications(recipientId: string) {
    const response = await axiosClient.get<NotificationItem[]>(`/api/notifications/recipient/${recipientId}`);
    return response.data;
  },

  async markNotificationRead(notificationId: string) {
    const response = await axiosClient.put<NotificationItem>(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

};
