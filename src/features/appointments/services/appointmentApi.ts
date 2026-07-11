import axiosClient from '@/lib/axiosClient';
import type { Appointment, CreateAppointmentPayload } from '@/features/appointments/types/appointment.types';

export const createAppointment = async (payload: CreateAppointmentPayload) => {
  const response = await axiosClient.post<Appointment>('/api/appointments', payload);
  return response.data;
};
