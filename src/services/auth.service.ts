import axiosClient from '@/api/axiosClient';
import type { CurrentUser, LoginRequest, MessageResponse, RegisterRequest, UserResponse } from '@/models/auth.model';

export const authService = {
  async login(data: LoginRequest): Promise<MessageResponse> {
    const response = await axiosClient.post<MessageResponse>('/auth/login', data);
    return response.data;
  },

  async logout(): Promise<MessageResponse> {
    const response = await axiosClient.post<MessageResponse>('/auth/logout');
    return response.data;
  },

  async getCurrentUser(): Promise<CurrentUser> {
    const response = await axiosClient.get<CurrentUser>('/auth/me');
    return response.data;
  },

  async register(data: RegisterRequest): Promise<UserResponse> {
    const response = await axiosClient.post<UserResponse>('/api/users/register', data);
    return response.data;
  },
};
