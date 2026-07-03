import { apiClient } from "./client";
import { APIResponse, User, Session } from "@studio/types";
import { API_ROUTES } from "../constants";

export interface LoginResponseData {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  login: async (
    credentials: Record<string, string>,
  ): Promise<APIResponse<LoginResponseData>> => {
    const response = await apiClient.post<APIResponse<LoginResponseData>>(
      API_ROUTES.AUTH.LOGIN,
      credentials,
    );
    return response.data;
  },

  register: async (
    userData: Record<string, string>,
  ): Promise<APIResponse<User>> => {
    const response = await apiClient.post<APIResponse<User>>(
      API_ROUTES.AUTH.REGISTER,
      userData,
    );
    return response.data;
  },

  logout: async (): Promise<APIResponse<null>> => {
    const response = await apiClient.post<APIResponse<null>>(
      API_ROUTES.AUTH.LOGOUT,
    );
    return response.data;
  },

  getMe: async (): Promise<APIResponse<User>> => {
    const response = await apiClient.get<APIResponse<User>>(API_ROUTES.AUTH.ME);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<APIResponse<null>> => {
    const response = await apiClient.post<APIResponse<null>>(
      API_ROUTES.AUTH.VERIFY_EMAIL,
      { token },
    );
    return response.data;
  },

  resendVerification: async (): Promise<APIResponse<null>> => {
    const response = await apiClient.post<APIResponse<null>>(
      API_ROUTES.AUTH.RESEND_VERIFICATION,
    );
    return response.data;
  },

  forgotPassword: async (email: string): Promise<APIResponse<null>> => {
    const response = await apiClient.post<APIResponse<null>>(
      API_ROUTES.AUTH.FORGOT_PASSWORD,
      { email },
    );
    return response.data;
  },

  resetPassword: async (
    data: Record<string, string>,
  ): Promise<APIResponse<null>> => {
    const response = await apiClient.post<APIResponse<null>>(
      API_ROUTES.AUTH.RESET_PASSWORD,
      data,
    );
    return response.data;
  },
};

export const profileApi = {
  getProfile: async (): Promise<APIResponse<User>> => {
    const response = await apiClient.get<APIResponse<User>>(
      API_ROUTES.PROFILE.BASE,
    );
    return response.data;
  },

  updateProfile: async (
    data: Record<string, string>,
  ): Promise<APIResponse<User>> => {
    const response = await apiClient.patch<APIResponse<User>>(
      API_ROUTES.PROFILE.BASE,
      data,
    );
    return response.data;
  },

  uploadAvatar: async (
    file: File,
  ): Promise<APIResponse<{ avatar_url: string }>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<APIResponse<{ avatar_url: string }>>(
      API_ROUTES.PROFILE.AVATAR,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  deleteAvatar: async (): Promise<APIResponse<null>> => {
    const response = await apiClient.delete<APIResponse<null>>(
      API_ROUTES.PROFILE.AVATAR,
    );
    return response.data;
  },

  getSessions: async (): Promise<APIResponse<Session[]>> => {
    const response = await apiClient.get<APIResponse<Session[]>>(
      API_ROUTES.PROFILE.SESSIONS,
    );
    return response.data;
  },

  revokeSession: async (sessionId: string): Promise<APIResponse<null>> => {
    const response = await apiClient.delete<APIResponse<null>>(
      `${API_ROUTES.PROFILE.SESSIONS}/${sessionId}`,
    );
    return response.data;
  },

  revokeAllSessions: async (): Promise<APIResponse<null>> => {
    const response = await apiClient.delete<APIResponse<null>>(
      API_ROUTES.PROFILE.SESSIONS,
    );
    return response.data;
  },
};
