import axios from 'axios';
import keycloak, { getToken, isAuthenticated, waitForKeycloakReady } from '@/services/keycloak';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  async (config) => {
    try {
      await waitForKeycloakReady();

      if (isAuthenticated() && keycloak && typeof keycloak.updateToken === 'function') {
        await keycloak.updateToken(30);
      }
    } catch (error) {
      console.error('Failed to prepare Keycloak token:', error);
    }

    const token = getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
