import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { APIResponse } from "@studio/types";
import { STORAGE_KEYS, API_ROUTES } from "../constants";
import { useUserStore } from "../store";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds
});

// Request Interceptor: Attach Authorization token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Format errors and handle unauthorized sessions
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<APIResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error.response?.status;
    const errorData = error.response?.data;

    // Handle session expirations / invalid token states
    if (status === 401 && !originalRequest._retry) {
      // If we're already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent refresh via cookie
        const response = await axios.post(
          `${API_BASE_URL}${API_ROUTES.AUTH.REFRESH}`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = response.data?.data?.access_token;
        if (newAccessToken) {
          useUserStore.getState().setToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        useUserStore.getState().setSessionExpired();
        // Return original error rather than refresh error
      } finally {
        isRefreshing = false;
      }
    }

    // Return structured API response format
    const structuredError: APIResponse = errorData || {
      success: false,
      message: error.message || "An unexpected error occurred",
      error: {
        code: "UNEXPECTED_ERROR",
        details: [{ issue: error.message }],
      },
    };

    return Promise.reject(structuredError);
  },
);
