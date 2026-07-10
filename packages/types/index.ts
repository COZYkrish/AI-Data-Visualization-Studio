export type Theme = "light" | "dark" | "system" | "high-contrast";

export interface UserPreference {
  id: string;
  user_id: string;
  theme: Theme;
  accent_color: string;
  compact_mode: boolean;
  large_font: boolean;
  reduced_motion: boolean;
  high_contrast: boolean;
  focus_visible: boolean;
  color_blind_mode?: string | null;
  timezone: string;
  date_format: string;
  number_format: string;
  language: string;
  default_chart_type?: string | null;
  default_dataset_id?: string | null;
  notification_preferences: Record<string, boolean>;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  entity_name?: string | null;
  status: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface PersistentNotification {
  id: string;
  user_id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  action_label?: string | null;
  action_url?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  read: boolean;
  dismissed: boolean;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface NLQOperation {
  intent: string;
  x_column?: string | null;
  y_column?: string | null;
  group_by?: string | null;
  filter_column?: string | null;
  filter_value?: unknown;
  filter_operator?: string | null;
  sort_by?: string | null;
  sort_order?: string | null;
  limit?: number | null;
  aggregation?: string | null;
  chart_type?: string | null;
  compare_values?: unknown[] | null;
}

export interface NLQResult {
  success: boolean;
  intent?: string | null;
  operation?: NLQOperation | null;
  chart_type?: string | null;
  explanation?: string | null;
  fallback_suggestions?: string[] | null;
  raw_query: string;
}

export interface NLQResponse {
  result: NLQResult;
  processing_time_ms: number;
}

export interface DashboardSuggestion {
  id: string;
  user_id: string;
  dataset_id?: string | null;
  suggestion_type:
    "chart" | "filter" | "kpi" | "ml" | "forecast" | "correlation";
  title: string;
  description: string;
  why: string;
  priority: number;
  config?: Record<string, unknown> | null;
  dismissed: boolean;
  applied: boolean;
  created_at: string;
  updated_at: string;
}

export interface KeyboardShortcut {
  id: string;
  user_id: string;
  action_id: string;
  label: string;
  default_keys: string[];
  custom_keys?: string[] | null;
  category: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  // Computed effective keys
  effective_keys?: string[];
}

export interface AccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  largeFont: boolean;
  focusVisible: boolean;
  colorBlindMode?: string | null;
}

export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  category:
    | "navigation"
    | "action"
    | "dataset"
    | "project"
    | "report"
    | "ml"
    | "search";
  keywords?: string[];
  shortcut?: string[];
  action: () => void;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  timezone?: string;
  email_verified: boolean;
  is_active: boolean;
  last_login_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  device_name?: string;
  browser?: string;
  operating_system?: string;
  ip_address?: string;
  created_at: string;
  last_active: string;
  is_current: boolean;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface Dataset {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  rowCount: number;
  columnCount: number;
  mimeType: string;
  projectId?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  version: number;
  status: string;
  favorite: boolean;
  archived: boolean;
  dataset_references?: any[];
  dashboard_layout?: any;
  filters?: any;
  charts?: any[];
  analytics_results?: any;
  ml_models?: any;
  forecast_results?: any;
  theme?: any;
  created_at: string;
  updated_at: string;
  last_opened_at?: string;
}

export interface ProjectSnapshot {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  version: number;
  created_at: string;
}

export interface ProjectHistory {
  id: string;
  project_id: string;
  version: number;
  action: string;
  description?: string;
  created_at: string;
}

export interface Report {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  template_type: string;
  configuration?: any;
  created_at: string;
}

export type ExportFormat = "pdf" | "csv" | "excel" | "json";
export type ExportStatus = "pending" | "processing" | "completed" | "failed";

export interface ExportJob {
  id: string;
  project_id: string;
  report_id?: string;
  format: ExportFormat;
  status: ExportStatus;
  file_url?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface APIErrorDetail {
  field?: string;
  issue: string;
}

export interface APIError {
  code: string;
  details?: APIErrorDetail[];
}

export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: APIError;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
}

export interface Configuration {
  apiUrl: string;
  environment: "development" | "production" | "testing";
}
