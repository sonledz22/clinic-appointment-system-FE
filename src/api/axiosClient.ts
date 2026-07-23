import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from '@/lib/storage';
import type { AuthTokenResponse } from '@/models/auth.model';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_PROXY_TARGET || 'http://localhost:8080';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
}

let isRefreshing = false;
let refreshRequest: Promise<AuthTokenResponse> | null = null;

const notifyUnauthorized = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:unauthorized'));
  }
};

const isAuthEndpoint = (url?: string) => {
  if (!url) {
    return false;
  }

  return url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/logout');
};
const shouldAttachAccessToken = (url?: string) => {
  if (!url) {
    return true;
  }

  return !(
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout') ||
    url.includes('/api/users/register')
  );
};

const refreshAccessToken = () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthTokens();
    return Promise.reject(new Error('Missing refresh token'));
  }

  if (!refreshRequest) {
    refreshRequest = axiosClient
      .post<AuthTokenResponse>('/auth/refresh', { refreshToken }, { skipAuthRefresh: true } as RetriableRequestConfig)
      .then((response) => {
        setAuthTokens(response.data);
        return response.data;
      })
      .catch((error) => {
        clearAuthTokens();
        throw error;
      })
      .finally(() => {
        isRefreshing = false;
        refreshRequest = null;
      });
  }

  return refreshRequest;
};

axiosClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (!accessToken || !shouldAttachAccessToken(config.url)) {
    return config;
  }

  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  config.headers.set('Authorization', `Bearer ${accessToken}`);
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetriableRequestConfig | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest.skipAuthRefresh || isAuthEndpoint(originalRequest.url)) {
      if (!originalRequest.url?.includes('/auth/login')) {
        clearAuthTokens();
        notifyUnauthorized();
      }
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearAuthTokens();
      notifyUnauthorized();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        await refreshAccessToken();
      } else {
        await refreshRequest;
      }

      const accessToken = getAccessToken();
      if (accessToken) {
        originalRequest.headers = originalRequest.headers ?? new AxiosHeaders();
        originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
      }

      return axiosClient(originalRequest);
    } catch (refreshError) {
      clearAuthTokens();
      notifyUnauthorized();
      return Promise.reject(refreshError);
    }
  },
);

export default axiosClient;
