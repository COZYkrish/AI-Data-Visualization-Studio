/**
 * ML API Service — Phase 7
 *
 * Axios wrappers for all Machine Learning endpoints.
 * Follows the same pattern as analytics.service.ts.
 */

import { apiClient } from "../../../api/client";
import type {
  EvaluationResult,
  ForecastData,
  ForecastRequest,
  MLModel,
  MLModelDetail,
  ModelRecommendationResponse,
  PredictRequest,
  PredictionResult,
  RetrainRequest,
  TrainRequest,
} from "../types";

const BASE = "/ml";

export const mlService = {
  // ── Recommendations ─────────────────────────────────────────────────────
  getRecommendations: async (
    datasetId: string,
    targetColumn?: string | null,
  ): Promise<ModelRecommendationResponse> => {
    const params: Record<string, string> = {};
    if (targetColumn) params.target_column = targetColumn;
    const res = await apiClient.get(`${BASE}/recommend/${datasetId}`, {
      params,
    });
    return res.data.data;
  },

  // ── Models ──────────────────────────────────────────────────────────────
  listModels: async (): Promise<MLModel[]> => {
    const res = await apiClient.get(`${BASE}/models`);
    return res.data.data;
  },

  getModel: async (modelId: string): Promise<MLModelDetail> => {
    const res = await apiClient.get(`${BASE}/models/${modelId}`);
    return res.data.data;
  },

  deleteModel: async (modelId: string): Promise<void> => {
    await apiClient.delete(`${BASE}/models/${modelId}`);
  },

  // ── Training ────────────────────────────────────────────────────────────
  trainModel: async (request: TrainRequest): Promise<MLModel> => {
    const res = await apiClient.post(`${BASE}/train`, request, {
      timeout: 120_000, // 2 min for training
    });
    return res.data.data;
  },

  trainForecast: async (request: ForecastRequest): Promise<MLModel> => {
    const res = await apiClient.post(`${BASE}/forecast`, request, {
      timeout: 180_000, // 3 min for Prophet / ARIMA
    });
    return res.data.data;
  },

  retrainModel: async (
    modelId: string,
    request: RetrainRequest,
  ): Promise<MLModel> => {
    const res = await apiClient.post(
      `${BASE}/models/${modelId}/retrain`,
      request,
      { timeout: 120_000 },
    );
    return res.data.data;
  },

  // ── Prediction ──────────────────────────────────────────────────────────
  predict: async (request: PredictRequest): Promise<PredictionResult> => {
    const res = await apiClient.post(`${BASE}/predict`, request);
    return res.data.data;
  },

  // ── Evaluation ──────────────────────────────────────────────────────────
  getEvaluation: async (modelId: string): Promise<EvaluationResult[]> => {
    const res = await apiClient.get(`${BASE}/evaluation/${modelId}`);
    return res.data.data;
  },

  // ── History ─────────────────────────────────────────────────────────────
  getHistory: async (): Promise<MLModel[]> => {
    const res = await apiClient.get(`${BASE}/history`);
    return res.data.data;
  },

  // ── Forecast Data ────────────────────────────────────────────────────────
  getForecast: async (modelId: string): Promise<ForecastData> => {
    const res = await apiClient.get(`${BASE}/models/${modelId}/forecast`);
    return res.data.data;
  },
};
