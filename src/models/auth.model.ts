export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}

export interface CurrentUser {
  id: string;
  userId?: string;
  patientId?: string;
  email: string;
  roles: string[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string | null;
  role?: string | null;
  specialization?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  contactInformation?: string | null;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: string;
  keycloakUserId: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  status: string;
  roles: RoleResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
}
