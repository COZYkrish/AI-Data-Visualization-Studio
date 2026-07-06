import { api } from "../../../api/client";
import { AnalyticsResultResponse } from "../types/analytics";

export const analyticsService = {
  getAnalytics: async (datasetId: string): Promise<AnalyticsResultResponse> => {
    const response = await api.get(`/analytics/${datasetId}`);
    return response.data;
  },

  refreshAnalytics: async (
    datasetId: string,
  ): Promise<AnalyticsResultResponse> => {
    const response = await api.post(`/analytics/${datasetId}/refresh`);
    return response.data;
  },
};
