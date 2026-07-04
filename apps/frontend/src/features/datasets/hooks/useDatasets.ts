import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { datasetsApi } from "../api/datasetsApi";
import { useDatasetStore } from "../store/datasetStore";
import { toast } from "sonner";
import { AxiosProgressEvent } from "axios";

export const useDatasetsKeys = {
  all: ["datasets"] as const,
  lists: () => [...useDatasetsKeys.all, "list"] as const,
  list: (skip: number, limit: number) =>
    [...useDatasetsKeys.lists(), { skip, limit }] as const,
  details: () => [...useDatasetsKeys.all, "detail"] as const,
  detail: (id: string) => [...useDatasetsKeys.details(), id] as const,
  summaries: () => [...useDatasetsKeys.all, "summary"] as const,
  summary: (id: string) => [...useDatasetsKeys.summaries(), id] as const,
  previews: () => [...useDatasetsKeys.all, "preview"] as const,
  preview: (id: string, limit: number, offset: number) =>
    [...useDatasetsKeys.previews(), id, { limit, offset }] as const,
};

export function useDatasets(skip: number = 0, limit: number = 20) {
  return useQuery({
    queryKey: useDatasetsKeys.list(skip, limit),
    queryFn: () => datasetsApi.list(skip, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDataset(id: string) {
  return useQuery({
    queryKey: useDatasetsKeys.detail(id),
    queryFn: () => datasetsApi.getById(id),
    enabled: !!id,
  });
}

export function useDatasetSummary(id: string) {
  return useQuery({
    queryKey: useDatasetsKeys.summary(id),
    queryFn: () => datasetsApi.getSummary(id),
    enabled: !!id,
    staleTime: Infinity, // Summaries rarely change unless reprocessed
  });
}

export function useDatasetPreview(
  id: string,
  limit: number = 100,
  offset: number = 0,
) {
  return useQuery({
    queryKey: useDatasetsKeys.preview(id, limit, offset),
    queryFn: () => datasetsApi.getPreview(id, limit, offset),
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useUploadDataset() {
  const queryClient = useQueryClient();
  const { setUploadProgress, setProcessingState, setValidationError } =
    useDatasetStore();

  return useMutation({
    mutationFn: async (file: File) => {
      return datasetsApi.upload(file, (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(file.name, percentage);
          if (percentage === 100) {
            setProcessingState(file.name, "processing");
          }
        }
      });
    },
    onSuccess: () => {
      toast.success("Dataset uploaded successfully");
      queryClient.invalidateQueries({ queryKey: useDatasetsKeys.lists() });
    },
    onError: (error: any, file: File) => {
      const message =
        error?.response?.data?.detail || error.message || "Upload failed";
      setValidationError(file.name, message);
      toast.error(`Failed to upload ${file.name}: ${message}`);
    },
  });
}

export function useDeleteDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => datasetsApi.delete(id),
    onSuccess: () => {
      toast.success("Dataset deleted");
      queryClient.invalidateQueries({ queryKey: useDatasetsKeys.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to delete dataset");
    },
  });
}
