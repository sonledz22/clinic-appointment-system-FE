import axios, { type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // HttpOnly cookies sẽ tự động được gửi với credentials
  withCredentials: true,
});

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
}

// Flag để tránh gọi refresh token nhiều lần đồng thời khi có nhiều request 401
let isRefreshing = false;
let refreshRequest: Promise<void> | null = null;

/**
 * Phát sự kiện unauthorized để app có thể xử lý (redirect to login, etc.)
 */
const notifyUnauthorized = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:unauthorized'));
  }
};

/**
 * Gọi API refresh token, đảm bảo chỉ gọi một lần khi có nhiều request lỗi 401
 * - Những request khác chờ promise này thay vì gọi refresh song song
 */
const refreshAccessToken = () => {
  if (!refreshRequest) {
    refreshRequest = axiosClient
      .post('/auth/refresh', undefined, { skipAuthRefresh: true } as RetriableRequestConfig)
      .then(() => undefined)
      .catch((error) => {
        // Nếu refresh thất bại với 401, refresh token hết hạn
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // Backend sẽ xóa cookies tự động
        }
        throw error;
      })
      .finally(() => {
        isRefreshing = false;
        refreshRequest = null;
      });
  }

  return refreshRequest;
};

/**
 * Response interceptor: Xử lý 401 Unauthorized
 *
 * Quy trình:
 * 1. Bắt 401 → Kiểm tra có retry rồi chưa (tránh vòng lặp vô hạn)
 * 2. Skip endpoints: /auth/login (invalid credentials), /auth/refresh (skip flag)
 * 3. Gọi /auth/refresh (chỉ 1 lần ngay cả khi 10 request 401 cùng lúc)
 * 4. Retry request ban đầu nếu refresh OK
 * 5. Notify unauthorized nếu refresh fail → redirect to login
 */
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Chỉ xử lý error 401
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetriableRequestConfig | undefined;

    // Kiểm tra nếu request không hợp lệ
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Nếu request có flag skipAuthRefresh (ví dụ: /auth/refresh, /auth/login)
    // thì không cố refresh nữa, trả lỗi ngay
    if (originalRequest.skipAuthRefresh) {
      notifyUnauthorized();
      return Promise.reject(error);
    }

    // Nếu đã retry rồi mà vẫn 401, không retry lần 2 (tránh vòng lặp vô hạn)
    if (originalRequest._retry) {
      notifyUnauthorized();
      return Promise.reject(error);
    }

    // Đánh dấu retry để tránh retry 2 lần
    originalRequest._retry = true;

    try {
      // Gọi refresh token
      // - Chỉ gọi 1 lần ngay cả khi có nhiều request 401 cùng lúc
      // - Những request khác chờ promise này hoàn thành
      if (!isRefreshing) {
        isRefreshing = true;
        await refreshAccessToken();
      } else {
        // Nếu đang refresh, chờ refresh hoàn thành
        await refreshRequest;
      }

      // Retry request ban đầu với token mới (cookie mới sẽ được gửi)
      return axiosClient(originalRequest);
    } catch (refreshError) {
      // Refresh thất bại → notify và redirect to login
      notifyUnauthorized();
      return Promise.reject(refreshError);
    }
  },
);

export default axiosClient;
