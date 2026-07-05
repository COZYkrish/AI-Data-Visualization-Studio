/**
 * Dashboard TanStack Query Hooks — Phase 5: Dashboard & Visualization Engine
 *
 * Reusable hooks for fetching dashboard data with proper caching,
 * cache invalidation, cancellation, and retry strategies.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "../../api/dashboard";
import { useDashboardStore } from "../../store/dashboard.store";
import type { ChartSettings, DashboardQueryRequest } from "../dashboard/types";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: () => [...dashboardKeys.all, "overview"] as const,
  kpis: (datasetId: string) =>
    [...dashboardKeys.all, "kpis", datasetId] as const,
  stats: (datasetId: string) =>
    [...dashboardKeys.all, "stats", datasetId] as const,
  recommendations: (datasetId: string) =>
    [...dashboardKeys.all, "recs", datasetId] as const,
  chart: (datasetId: string, type: string, x?: string, y?: string) =>
    [...dashboardKeys.all, "chart", datasetId, type, x, y] as const,
  query: (params: DashboardQueryRequest) =>
    [...dashboardKeys.all, "query", JSON.stringify(params)] as const,
};

// ─── useDashboard ─────────────────────────────────────────────────────────

/**
 * Fetches the dashboard home page overview (dataset counts, totals, recent).
 */
export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: ({ signal }) => dashboardApi.getOverview(signal),
    staleTime: 30_000,
    select: (data) => data.data,
  });
}

// ─── useKPIs ─────────────────────────────────────────────────────────────

/**
 * Automatically generates KPI cards for the selected dataset.
 */
export function useKPIs(datasetId?: string | null) {
  return useQuery({
    queryKey: dashboardKeys.kpis(datasetId ?? ""),
    queryFn: ({ signal }) => dashboardApi.getKPIs(datasetId!, signal),
    enabled: !!datasetId,
    staleTime: 60_000,
    retry: 2,
    select: (data) => data.data ?? [],
  });
}

// ─── useDatasetStatistics ─────────────────────────────────────────────────

/**
 * Returns comprehensive column-level statistics for the selected dataset.
 */
export function useDatasetStatistics(datasetId?: string | null) {
  return useQuery({
    queryKey: dashboardKeys.stats(datasetId ?? ""),
    queryFn: ({ signal }) => dashboardApi.getStatistics(datasetId!, signal),
    enabled: !!datasetId,
    staleTime: 120_000,
    retry: 2,
    select: (data) => data.data,
  });
}

// ─── useChartRecommendations ──────────────────────────────────────────────

/**
 * Returns deterministic chart recommendations for the selected dataset.
 */
export function useChartRecommendations(datasetId?: string | null) {
  return useQuery({
    queryKey: dashboardKeys.recommendations(datasetId ?? ""),
    queryFn: ({ signal }) =>
      dashboardApi.getRecommendations(datasetId!, signal),
    enabled: !!datasetId,
    staleTime: 120_000,
    retry: 2,
    select: (data) => data.data ?? [],
  });
}

// ─── useCharts ────────────────────────────────────────────────────────────

/**
 * Fetches chart data for a given chart type and column mapping.
 */
export function useCharts(
  settings: (ChartSettings & { dataset_id: string }) | null,
) {
  return useQuery({
    queryKey: dashboardKeys.chart(
      settings?.dataset_id ?? "",
      settings?.type ?? "",
      settings?.x,
      settings?.y,
    ),
    queryFn: ({ signal }) =>
      dashboardApi.getChartData(
        {
          dataset_id: settings!.dataset_id,
          chart_type: settings!.type,
          x: settings!.x,
          y: settings!.y,
          config: settings!.config,
        },
        signal,
      ),
    enabled: !!settings?.dataset_id && !!settings?.type,
    staleTime: 60_000,
    retry: 1,
    select: (data) => data.data,
  });
}

// ─── useDashboardQuery ────────────────────────────────────────────────────

/**
 * Runs a filtered, sorted, and paginated query against a dataset.
 */
export function useDashboardQuery(params: DashboardQueryRequest | null) {
  return useQuery({
    queryKey: dashboardKeys.query(params!),
    queryFn: ({ signal }) => dashboardApi.runQuery(params!, signal),
    enabled: !!params?.dataset_id,
    staleTime: 30_000,
    retry: 1,
    select: (data) => data.data,
    placeholderData: (prev) => prev,
  });
}

// ─── useDashboardFilters ──────────────────────────────────────────────────

/**
 * Exposes the active filter state from the Zustand dashboard store.
 */
export function useDashboardFilters() {
  const activeFilters = useDashboardStore((s) => s.activeFilters);
  const addFilter = useDashboardStore((s) => s.addFilter);
  const removeFilter = useDashboardStore((s) => s.removeFilter);
  const clearFilters = useDashboardStore((s) => s.clearFilters);
  return { activeFilters, addFilter, removeFilter, clearFilters };
}

// ─── useExportChart ───────────────────────────────────────────────────────

/**
 * Mutation for exporting a chart (fetches data, then triggers client-side download).
 */
export function useExportChart() {
  return useMutation({
    mutationFn: (payload: {
      dataset_id: string;
      chart_type: string;
      x?: string;
      y?: string;
      config?: Record<string, unknown>;
    }) => dashboardApi.exportChart(payload),
  });
}

// ─── useInvalidateDashboard ───────────────────────────────────────────────

/**
 * Utility hook to invalidate all dashboard queries when data changes.
 */
export function useInvalidateDashboard() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: dashboardKeys.all });
}
