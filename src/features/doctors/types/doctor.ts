export interface Slot {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  booked: boolean;
  status?: string;
}

export interface SlotFilters {
  fromDate?: string;
  toDate?: string;
  status?: 'AVAILABLE' | 'BOOKED' | 'RESERVED' | 'BLOCKED';
}

export interface WeeklyPatternItem {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  workStartTime: string;
  workEndTime: string;
  breakStartTime: string | null;
  breakEndTime: string | null;
}

export interface GenerateRecurringSchedulePayload {
  startDate: string;
  endDate: string;
  slotDurationMinutes: number;
  weeklyPattern: WeeklyPatternItem[];
}

export interface DoctorLeave {
  id: string;
  doctorId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'REQUESTED' | 'CANCELED';
}

export interface RequestDoctorLeavePayload {
  startDate: string;
  endDate: string;
  reason: string;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  specialization: string;
  phoneNumber: string;
  email: string;
  active: boolean;
  biography?: string;
  qualifications?: string;
  avatarUrl?: string;
  slots: Slot[];
}

export interface DoctorConsultationPatient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
  contactInformation: string | null;
}

export interface DoctorMedicalRecordPrescription {
  id: string;
  medicalRecordId: string;
  medicationName: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
}

export interface DoctorMedicalRecordSummary {
  id: string;
  patientId: string;
  recordDate: string;
  diagnosis: string;
  treatment: string | null;
  notes: string | null;
  prescriptions: DoctorMedicalRecordPrescription[];
}

export interface DoctorAppointmentContext {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  appointmentStatus: string;
  startTime: string;
  endTime: string;
  reason: string | null;
  patient: DoctorConsultationPatient;
  medicalHistory: DoctorMedicalRecordSummary[];
}

export interface DoctorScheduleAppointment {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  appointmentStatus: string;
  startTime: string;
  endTime: string;
  reason: string | null;
}

export interface DoctorCancelAppointmentPayload {
  reason: string;
}

export interface DoctorCheckoutPrescriptionPayload {
  medicationName: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

export interface DoctorCheckoutPayload {
  recordDate: string;
  diagnosis: string;
  treatment?: string;
  notes?: string;
  prescriptions: DoctorCheckoutPrescriptionPayload[];
}

export interface DoctorCardViewModel {
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
