import axios from 'axios';
import { create } from 'zustand';
import { authService } from '@/services/auth.service';
import type { ApiErrorResponse, CurrentUser, LoginRequest } from '@/models/auth.model';

interface AuthState {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearUser: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const normalizeRole = (role: string) => role.trim().toUpperCase();

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  initialized: false,
  error: null,

  async login(data) {
    set({ loading: true, error: null });

    try {
      await authService.login(data);
      // Backend sẽ set HttpOnly cookies tự động, không cần lưu token
      
      const user = await authService.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        loading: false,
        initialized: true,
        error: null,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        initialized: true,
        error: getErrorMessage(error, 'Không thể đăng nhập. Vui lòng thử lại.'),
      });
      throw error;
    }
  },

  async logout() {
    set({ loading: true, error: null });

    try {
      await authService.logout();
      // Backend sẽ xóa cookies
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        initialized: true,
        error: null,
      });
    }
  },

  async fetchCurrentUser() {
    set({ loading: true, error: null });

    try {
      const user = await authService.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        loading: false,
        initialized: true,
        error: null,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        initialized: true,
        error: null,
      });
    }
  },

  clearUser() {
    set({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  },

  hasRole(role) {
    const expectedRole = normalizeRole(role);
    return get().user?.roles?.some((userRole) => normalizeRole(userRole) === expectedRole) ?? false;
  },

  hasAnyRole(roles) {
    return roles.some((role) => get().hasRole(role));
  },
}));
