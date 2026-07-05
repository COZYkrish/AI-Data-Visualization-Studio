/**
 * Dashboard Feature — TypeScript Types
 * Phase 5: Dashboard & Visualization Engine
 */

// ─── Chart Types ────────────────────────────────────────────────────────────

export type ChartType =
  | "bar"
  | "line"
  | "area"
  | "pie"
  | "donut"
  | "scatter"
  | "histogram"
  | "box"
  | "heatmap"
  | "treemap"
  | "bubble"
  | "radar";

export interface ChartDataPoint {
  [key: string]: string | number | null | undefined;
}

export interface ChartPayload {
  chart_type: ChartType;
  data: ChartDataPoint[];
  x_key?: string;
  y_key?: string;
  x_label?: string;
  y_label?: string;
  name_key?: string;
  value_key?: string;
  color_key?: string;
  size_key?: string;
  columns?: string[];
  // Heatmap specific
  matrix?: (number | null)[][];
}

// ─── Chart Recommendation ──────────────────────────────────────────────────

export interface ChartRecommendation {
  chart_type: ChartType;
  title: string;
  x?: string;
  y?: string;
  reason: string;
  priority: number;
  config?: Record<string, unknown>;
}

// ─── KPI ──────────────────────────────────────────────────────────────────

export interface KPICard {
  key: string;
  label: string;
  value: number | string;
  unit?: string;
  icon?: string;
  color?: string;
  meta?: string;
  trend?: number;
}

// ─── Column Statistics ────────────────────────────────────────────────────

export interface ColumnStat {
  dtype: string;
  inferred_type: "numeric" | "categorical" | "datetime" | "boolean" | "unknown";
  null_count: number;
  unique_values: number;
  null_percentage: number;
  // Numeric
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
  q1?: number;
  q3?: number;
  // Categorical
  top_values?: Array<{ value: string; count: number }>;
}

export interface DatasetStatistics {
  dataset_id: string;
  row_count: number;
  column_count: number;
  columns: string[];
  data_types: Record<string, string>;
  global_stats?: Record<string, unknown>;
  column_stats?: Record<string, ColumnStat>;
}

// ─── Filter ───────────────────────────────────────────────────────────────

export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "greater_than"
  | "less_than"
  | "between"
  | "in"
  | "is_null"
  | "is_not_null";

export interface FilterCondition {
  id: string; // Client-side ID for React keys
  column: string;
  operator: FilterOperator;
  value?: unknown;
}

// ─── Query ────────────────────────────────────────────────────────────────

export interface DashboardQueryRequest {
  dataset_id: string;
  filters: Omit<FilterCondition, "id">[];
  sort_by?: string;
  sort_order?: "asc" | "desc";
  page: number;
  page_size: number;
  search?: string;
}

export interface DashboardQueryResponse {
  dataset_id: string;
  columns: string[];
  rows: Record<string, unknown>[];
  total_rows: number;
  page: number;
  page_size: number;
  total_pages: number;
  applied_filters: number;
  query_time_ms: number;
}

// ─── Dashboard Overview ───────────────────────────────────────────────────

export interface RecentDatasetItem {
  id: string;
  name: string;
  status: string;
  rows?: number;
  columns?: number;
  created_at: string;
}

export interface DashboardOverview {
  total_datasets: number;
  ready_datasets: number;
  total_rows_processed: number;
  total_storage_bytes: number;
  recent_datasets: RecentDatasetItem[];
}

// ─── Zustand State ─────────────────────────────────────────────────────────

export interface ChartSettings {
  type: ChartType;
  x?: string;
  y?: string;
  config?: Record<string, unknown>;
  title?: string;
}

export interface DashboardLayoutItem {
  id: string;
  type: "kpi" | "chart" | "table";
  title: string;
  chartSettings?: ChartSettings;
  position?: { x: number; y: number; w: number; h: number };
}

export interface DashboardState {
  selectedDatasetId: string | null;
  activeFilters: FilterCondition[];
  chartSettings: ChartSettings | null;
  isSidebarOpen: boolean;
  isFullscreen: boolean;
  favoriteCharts: ChartSettings[];
  sortBy: string | null;
  sortOrder: "asc" | "desc";
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  // Actions
  setSelectedDataset: (id: string | null) => void;
  addFilter: (filter: FilterCondition) => void;
  removeFilter: (id: string) => void;
  clearFilters: () => void;
  setChartSettings: (settings: ChartSettings | null) => void;
  toggleSidebar: () => void;
  setFullscreen: (v: boolean) => void;
  addFavoriteChart: (chart: ChartSettings) => void;
  removeFavoriteChart: (index: number) => void;
  setSortBy: (col: string | null) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setSearchQuery: (q: string) => void;
  setCurrentPage: (p: number) => void;
  setPageSize: (s: number) => void;
  resetDashboard: () => void;
}
