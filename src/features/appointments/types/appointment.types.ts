export interface CreateAppointmentPayload {
  specialization: string;
  startTime: string;
  endTime: string;
  rescheduledFromAppointmentId?: string | null;
  reason?: string;
  bookingSource?: string;
  patientId?: string;
  doctorId?: string;
  slotId?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  specialization?: string;
  startTime?: string;
  endTime?: string;
  rescheduledFromAppointmentId?: string | null;
  reason?: string | null;
  bookingSource?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}
