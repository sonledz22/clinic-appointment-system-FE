export interface Slot {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  booked: boolean;
  status?: string;
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
