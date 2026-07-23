import axiosClient from '@/api/axiosClient';

export type PaymentTiming = 'PAY_NOW' | 'PAY_LATER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface PaymentResponse {
  id: string;
  appointmentId: string;
  patientUserId: string;
  amount: number;
  currency: string;
  paymentTiming: PaymentTiming;
  status: PaymentStatus;
  method: string;
  provider: string;
  description: string;
  paidAt: string | null;
  failedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentPayload {
  appointmentId: string;
  paymentTiming: PaymentTiming;
}

export const paymentApi = {
  async createPayment(payload: CreatePaymentPayload) {
    const response = await axiosClient.post<PaymentResponse>('/api/payments', payload);
    return response.data;
  },

  async getPayment(paymentId: string) {
    const response = await axiosClient.get<PaymentResponse>(`/api/payments/${paymentId}`);
    return response.data;
  },

  async getPaymentByAppointment(appointmentId: string) {
    const response = await axiosClient.get<PaymentResponse>(`/api/payments/appointment/${appointmentId}`);
    return response.data;
  },

  async confirmPaid(paymentId: string) {
    const response = await axiosClient.post<PaymentResponse>(`/api/payments/${paymentId}/confirm-paid`);
    return response.data;
  },
};
