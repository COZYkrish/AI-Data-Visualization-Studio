import { apiClient } from "./client";
import { APIResponse, Dataset } from "@studio/types";
import { API_ROUTES } from "../constants";

export const datasetsApi = {
  list: async (): Promise<APIResponse<Dataset[]>> => {
    const response = await apiClient.get<APIResponse<Dataset[]>>(
      API_ROUTES.DATASETS.BASE,
    );
    return response.data;
  },

  upload: async (
    file: File,
    projectId?: string,
  ): Promise<APIResponse<Dataset>> => {
    const formData = new FormData();
    formData.append("file", file);
    if (projectId) {
      formData.append("project_id", projectId);
    }

    const response = await apiClient.post<APIResponse<Dataset>>(
      API_ROUTES.DATASETS.UPLOAD,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
};
