import { apiClient } from "./client";
import { APIResponse, Project } from "@studio/types";
import { API_ROUTES } from "../constants";

export const projectsApi = {
  list: async (): Promise<APIResponse<Project[]>> => {
    const response = await apiClient.get<APIResponse<Project[]>>(
      API_ROUTES.PROJECTS.BASE,
    );
    return response.data;
  },

  create: async (data: Partial<Project>): Promise<APIResponse<Project>> => {
    const response = await apiClient.post<APIResponse<Project>>(
      API_ROUTES.PROJECTS.BASE,
      data,
    );
    return response.data;
  },

  get: async (id: string): Promise<APIResponse<Project>> => {
    const response = await apiClient.get<APIResponse<Project>>(
      `${API_ROUTES.PROJECTS.BASE}/${id}`,
    );
    return response.data;
  },
};
