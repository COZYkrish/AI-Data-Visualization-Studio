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
  ownerId: string;
  datasetIds: string[];
  createdAt: string;
  updatedAt: string;
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
