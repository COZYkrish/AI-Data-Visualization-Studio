import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { APIResponse } from "@studio/types";
import { STORAGE_KEYS } from "../constants";

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

// Response Interceptor: Format errors and handle unauthorized sessions
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<APIResponse>) => {
    const status = error.response?.status;
    const errorData = error.response?.data;

    // Handle session expirations / invalid token states
    if (status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      // Optional: window.location.href = "/login";
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
