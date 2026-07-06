import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics.service";

export const analyticsKeys = {
  all: ["analytics"] as const,
  detail: (datasetId: string) => [...analyticsKeys.all, datasetId] as const,
};

export const useAnalytics = (datasetId: string | undefined) => {
  return useQuery({
    queryKey: analyticsKeys.detail(datasetId!),
    queryFn: () => analyticsService.getAnalytics(datasetId!),
    enabled: !!datasetId,
    staleTime: Infinity, // Analytics don't change unless refreshed
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    retry: 1,
  });
};

export const useRefreshAnalytics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datasetId: string) =>
      analyticsService.refreshAnalytics(datasetId),
    onSuccess: (data, datasetId) => {
      // Invalidate and set the new data in cache
      queryClient.setQueryData(analyticsKeys.detail(datasetId), data);
    },
  });
};
