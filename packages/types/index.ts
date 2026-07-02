export type Theme = "light" | "dark" | "system";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
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
