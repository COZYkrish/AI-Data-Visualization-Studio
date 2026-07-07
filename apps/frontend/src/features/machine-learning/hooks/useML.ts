/**
 * ML TanStack Query Hooks — Phase 7
 *
 * Centralised query/mutation hooks for all ML API interactions.
 * Follows the same pattern as useAnalytics.ts.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mlService } from "../services/ml.service";
import type {
  ForecastRequest,
  PredictRequest,
  RetrainRequest,
  TrainRequest,
} from "../types";

// ── Query Keys ──────────────────────────────────────────────────────────────

export const mlKeys = {
  all: ["ml"] as const,
  models: () => [...mlKeys.all, "models"] as const,
  model: (id: string) => [...mlKeys.models(), id] as const,
  evaluation: (id: string) => [...mlKeys.all, "evaluation", id] as const,
  forecast: (id: string) => [...mlKeys.all, "forecast", id] as const,
  history: () => [...mlKeys.all, "history"] as const,
  recommendations: (datasetId: string, target?: string | null) =>
    [...mlKeys.all, "recommendations", datasetId, target ?? "none"] as const,
};

// ── Queries ─────────────────────────────────────────────────────────────────

export const useSavedModels = () =>
  useQuery({
    queryKey: mlKeys.models(),
    queryFn: mlService.listModels,
    staleTime: 1000 * 60 * 5, // 5 min
  });

export const useModel = (modelId: string | undefined) =>
  useQuery({
    queryKey: mlKeys.model(modelId!),
    queryFn: () => mlService.getModel(modelId!),
    enabled: !!modelId,
  });

export const useEvaluation = (modelId: string | undefined) =>
  useQuery({
    queryKey: mlKeys.evaluation(modelId!),
    queryFn: () => mlService.getEvaluation(modelId!),
    enabled: !!modelId,
    staleTime: Infinity,
  });

export const useForecastData = (modelId: string | undefined) =>
  useQuery({
    queryKey: mlKeys.forecast(modelId!),
    queryFn: () => mlService.getForecast(modelId!),
    enabled: !!modelId,
    staleTime: Infinity,
  });

export const useModelHistory = () =>
  useQuery({
    queryKey: mlKeys.history(),
    queryFn: mlService.getHistory,
    staleTime: 1000 * 60 * 2,
  });

export const useModelRecommendations = (
  datasetId: string | undefined,
  targetColumn?: string | null,
) =>
  useQuery({
    queryKey: mlKeys.recommendations(datasetId!, targetColumn),
    queryFn: () => mlService.getRecommendations(datasetId!, targetColumn),
    enabled: !!datasetId,
    staleTime: 1000 * 60 * 10,
  });

// ── Mutations ───────────────────────────────────────────────────────────────

export const useTrainModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (request: TrainRequest) => mlService.trainModel(request),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mlKeys.models() });
      qc.invalidateQueries({ queryKey: mlKeys.history() });
    },
  });
};

export const useForecast = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (request: ForecastRequest) => mlService.trainForecast(request),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mlKeys.models() });
      qc.invalidateQueries({ queryKey: mlKeys.history() });
    },
  });
};

export const usePrediction = () =>
  useMutation({
    mutationFn: (request: PredictRequest) => mlService.predict(request),
  });

export const useRetrainModel = (modelId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (request: RetrainRequest) =>
      mlService.retrainModel(modelId, request),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mlKeys.model(modelId) });
      qc.invalidateQueries({ queryKey: mlKeys.evaluation(modelId) });
      qc.invalidateQueries({ queryKey: mlKeys.history() });
    },
  });
};

export const useDeleteModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (modelId: string) => mlService.deleteModel(modelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mlKeys.models() });
      qc.invalidateQueries({ queryKey: mlKeys.history() });
    },
  });
};
