import { apiClient } from "../../../api/client";
import { AnalyticsResultResponse } from "../types/analytics";

export const analyticsService = {
  getAnalytics: async (datasetId: string): Promise<AnalyticsResultResponse> => {
    const response = await apiClient.get(`/analytics/${datasetId}`);
    return response.data;
  },

  refreshAnalytics: async (
    datasetId: string,
  ): Promise<AnalyticsResultResponse> => {
    const response = await apiClient.post(`/analytics/${datasetId}/refresh`);
    return response.data;
  },
};
