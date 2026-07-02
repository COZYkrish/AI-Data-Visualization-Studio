import { apiClient } from "./client";
import { APIResponse, User } from "@studio/types";
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

  getMe: async (): Promise<APIResponse<User>> => {
    const response = await apiClient.get<APIResponse<User>>(API_ROUTES.AUTH.ME);
    return response.data;
  },
};
