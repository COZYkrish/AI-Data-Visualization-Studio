import { apiClient } from "@/api/client";
import { APIResponse } from "@studio/types";
import {
  Dataset,
  PaginatedDatasets,
  DatasetSummary,
  DatasetPreview,
} from "../types";
import { AxiosProgressEvent } from "axios";

const BASE_PATH = "/datasets";

export const datasetsApi = {
  upload: async (
    file: File,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
  ): Promise<APIResponse<any>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<APIResponse<any>>(
      `${BASE_PATH}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      },
    );
    return response.data;
  },

  list: async (
    skip: number = 0,
    limit: number = 20,
  ): Promise<APIResponse<PaginatedDatasets>> => {
    const response = await apiClient.get<APIResponse<PaginatedDatasets>>(
      BASE_PATH,
      {
        params: { skip, limit },
      },
    );
    return response.data;
  },

  getById: async (id: string): Promise<APIResponse<Dataset>> => {
    const response = await apiClient.get<APIResponse<Dataset>>(
      `${BASE_PATH}/${id}`,
    );
    return response.data;
  },

  delete: async (id: string): Promise<APIResponse<null>> => {
    const response = await apiClient.delete<APIResponse<null>>(
      `${BASE_PATH}/${id}`,
    );
    return response.data;
  },

  getPreview: async (
    id: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<APIResponse<DatasetPreview>> => {
    const response = await apiClient.get<APIResponse<DatasetPreview>>(
      `${BASE_PATH}/${id}/preview`,
      {
        params: { limit, offset },
      },
    );
    return response.data;
  },

  getSummary: async (id: string): Promise<APIResponse<DatasetSummary>> => {
    const response = await apiClient.get<APIResponse<DatasetSummary>>(
      `${BASE_PATH}/${id}/summary`,
    );
    return response.data;
  },

  reprocess: async (id: string): Promise<APIResponse<any>> => {
    const response = await apiClient.post<APIResponse<any>>(
      `${BASE_PATH}/${id}/reprocess`,
    );
    return response.data;
  },
};
