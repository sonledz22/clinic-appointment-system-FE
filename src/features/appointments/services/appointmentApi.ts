import axiosClient from '@/lib/axiosClient';
import type { Appointment, CreateAppointmentPayload } from '@/features/appointments/types/appointment.types';

export const createAppointment = async (payload: CreateAppointmentPayload) => {
  const response = await axiosClient.post<Appointment>('/api/appointments', payload);
  return response.data;
};

export const getMyAppointments = async () => {
  const response = await axiosClient.get<Appointment[]>('/api/appointments/me');
  return response.data;
};

