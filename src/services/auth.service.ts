import axiosClient from '@/api/axiosClient';
import type { AuthTokenResponse, CurrentUser, LoginRequest, MessageResponse, RegisterRequest, UserResponse } from '@/models/auth.model';

export const authService = {
  async login(data: LoginRequest): Promise<AuthTokenResponse> {
    const response = await axiosClient.post<AuthTokenResponse>('/auth/login', data);
    return response.data;
  },

  async refresh(refreshToken: string): Promise<AuthTokenResponse> {
    const response = await axiosClient.post<AuthTokenResponse>('/auth/refresh', { refreshToken });
    return response.data;
  },

  async logout(refreshToken?: string | null): Promise<MessageResponse> {
    const response = await axiosClient.post<MessageResponse>('/auth/logout', { refreshToken: refreshToken ?? null });
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