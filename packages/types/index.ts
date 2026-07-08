export type Theme = "light" | "dark" | "system";

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
