/**
 * Dashboard API Service — Phase 5: Dashboard & Visualization Engine
 *
 * Axios-based API client for all /api/v1/dashboard endpoints.
 * Supports cancellation via AbortController, configurable timeouts, and retry.
 */
import { apiClient } from "./client";
import { APIResponse } from "@studio/types";
import {
  KPICard,
  DatasetStatistics,
  ChartRecommendation,
  ChartPayload,
  DashboardQueryRequest,
  DashboardQueryResponse,
  DashboardOverview,
} from "../features/dashboard/types";

const BASE = "/dashboard";

export const dashboardApi = {
  // ── Overview ──────────────────────────────────────────────────────────────
  getOverview: async (
    signal?: AbortSignal,
  ): Promise<APIResponse<DashboardOverview>> => {
    const res = await apiClient.get<APIResponse<DashboardOverview>>(BASE, {
      signal,
    });
    return res.data;
  },

  // ── KPIs ─────────────────────────────────────────────────────────────────
  getKPIs: async (
    datasetId: string,
    signal?: AbortSignal,
  ): Promise<APIResponse<KPICard[]>> => {
    const res = await apiClient.get<APIResponse<KPICard[]>>(`${BASE}/kpis`, {
      params: { dataset_id: datasetId },
      signal,
      timeout: 30000,
    });
    return res.data;
  },

  // ── Statistics ────────────────────────────────────────────────────────────
  getStatistics: async (
    datasetId: string,
    signal?: AbortSignal,
  ): Promise<APIResponse<DatasetStatistics>> => {
    const res = await apiClient.get<APIResponse<DatasetStatistics>>(
      `${BASE}/datasets/${datasetId}/statistics`,
      { signal, timeout: 30000 },
    );
    return res.data;
  },

  // ── Chart Recommendations ─────────────────────────────────────────────────
  getRecommendations: async (
    datasetId: string,
    signal?: AbortSignal,
  ): Promise<APIResponse<ChartRecommendation[]>> => {
    const res = await apiClient.get<APIResponse<ChartRecommendation[]>>(
      `${BASE}/recommendations`,
      { params: { dataset_id: datasetId }, signal, timeout: 30000 },
    );
    return res.data;
  },

  // ── Chart Data ────────────────────────────────────────────────────────────
  getChartData: async (
    payload: {
      dataset_id: string;
      chart_type: string;
      x?: string;
      y?: string;
      config?: Record<string, unknown>;
    },
    signal?: AbortSignal,
  ): Promise<APIResponse<ChartPayload>> => {
    const res = await apiClient.post<APIResponse<ChartPayload>>(
      `${BASE}/charts`,
      payload,
      { signal, timeout: 30000 },
    );
    return res.data;
  },

  // ── Filtered Query ────────────────────────────────────────────────────────
  runQuery: async (
    body: DashboardQueryRequest,
    signal?: AbortSignal,
  ): Promise<APIResponse<DashboardQueryResponse>> => {
    const res = await apiClient.post<APIResponse<DashboardQueryResponse>>(
      `${BASE}/query`,
      body,
      { signal, timeout: 45000 },
    );
    return res.data;
  },

  // ── Export ────────────────────────────────────────────────────────────────
  exportChart: async (
    payload: {
      dataset_id: string;
      chart_type: string;
      x?: string;
      y?: string;
      config?: Record<string, unknown>;
    },
    signal?: AbortSignal,
  ): Promise<APIResponse<ChartPayload>> => {
    const res = await apiClient.post<APIResponse<ChartPayload>>(
      `${BASE}/export-chart`,
      payload,
      { signal, timeout: 30000 },
    );
    return res.data;
  },
};
