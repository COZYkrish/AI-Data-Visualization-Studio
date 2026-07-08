import { apiClient } from "./client";
import { APIResponse, Report, ExportJob, ExportFormat } from "@studio/types";
import { API_ROUTES } from "../constants";

// Assuming we add API_ROUTES.REPORTS to constants later, but hardcoding for now if needed.
const BASE_URL = "/reports";

export const reportsApi = {
  create: async (
    projectId: string,
    data: Partial<Report>,
  ): Promise<APIResponse<Report>> => {
    const response = await apiClient.post<APIResponse<Report>>(
      `${BASE_URL}/?project_id=${projectId}`,
      data,
    );
    return response.data;
  },

  list: async (projectId: string): Promise<APIResponse<Report[]>> => {
    const response = await apiClient.get<APIResponse<Report[]>>(
      `${BASE_URL}/project/${projectId}`,
    );
    return response.data;
  },

  requestExport: async (
    projectId: string,
    format: ExportFormat,
    reportId?: string,
  ): Promise<APIResponse<ExportJob>> => {
    const response = await apiClient.post<APIResponse<ExportJob>>(
      `${BASE_URL}/project/${projectId}/export`,
      { format, report_id: reportId },
    );
    return response.data;
  },

  getExportStatus: async (jobId: string): Promise<APIResponse<ExportJob>> => {
    const response = await apiClient.get<APIResponse<ExportJob>>(
      `${BASE_URL}/export/${jobId}`,
    );
    return response.data;
  },
};
