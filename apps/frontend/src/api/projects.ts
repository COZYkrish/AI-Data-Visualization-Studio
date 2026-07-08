import { apiClient } from "./client";
import {
  APIResponse,
  Project,
  ProjectSnapshot,
  ProjectHistory,
} from "@studio/types";
import { API_ROUTES } from "../constants";

export const projectsApi = {
  list: async (skip = 0, limit = 100): Promise<APIResponse<Project[]>> => {
    const response = await apiClient.get<APIResponse<Project[]>>(
      `${API_ROUTES.PROJECTS.BASE}?skip=${skip}&limit=${limit}`,
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

  update: async (
    id: string,
    data: Partial<Project>,
  ): Promise<APIResponse<Project>> => {
    const response = await apiClient.patch<APIResponse<Project>>(
      `${API_ROUTES.PROJECTS.BASE}/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: string): Promise<APIResponse<Project>> => {
    const response = await apiClient.delete<APIResponse<Project>>(
      `${API_ROUTES.PROJECTS.BASE}/${id}`,
    );
    return response.data;
  },

  duplicate: async (id: string): Promise<APIResponse<Project>> => {
    const response = await apiClient.post<APIResponse<Project>>(
      `${API_ROUTES.PROJECTS.BASE}/${id}/duplicate`,
    );
    return response.data;
  },

  favorite: async (
    id: string,
    favorite: boolean = true,
  ): Promise<APIResponse<Project>> => {
    const response = await apiClient.post<APIResponse<Project>>(
      `${API_ROUTES.PROJECTS.BASE}/${id}/favorite?favorite=${favorite}`,
    );
    return response.data;
  },

  archive: async (
    id: string,
    archive: boolean = true,
  ): Promise<APIResponse<Project>> => {
    const response = await apiClient.post<APIResponse<Project>>(
      `${API_ROUTES.PROJECTS.BASE}/${id}/archive?archive=${archive}`,
    );
    return response.data;
  },

  getHistory: async (id: string): Promise<APIResponse<ProjectHistory[]>> => {
    const response = await apiClient.get<APIResponse<ProjectHistory[]>>(
      `${API_ROUTES.PROJECTS.BASE}/${id}/history`,
    );
    return response.data;
  },

  createSnapshot: async (
    id: string,
    name: string,
    description?: string,
  ): Promise<APIResponse<ProjectSnapshot>> => {
    const response = await apiClient.post<APIResponse<ProjectSnapshot>>(
      `${API_ROUTES.PROJECTS.BASE}/${id}/snapshots`,
      { name, description },
    );
    return response.data;
  },

  listSnapshots: async (
    id: string,
  ): Promise<APIResponse<ProjectSnapshot[]>> => {
    const response = await apiClient.get<APIResponse<ProjectSnapshot[]>>(
      `${API_ROUTES.PROJECTS.BASE}/${id}/snapshots`,
    );
    return response.data;
  },

  restoreSnapshot: async (
    projectId: string,
    snapshotId: string,
  ): Promise<APIResponse<Project>> => {
    const response = await apiClient.post<APIResponse<Project>>(
      `${API_ROUTES.PROJECTS.BASE}/${projectId}/snapshots/${snapshotId}/restore`,
    );
    return response.data;
  },
};
