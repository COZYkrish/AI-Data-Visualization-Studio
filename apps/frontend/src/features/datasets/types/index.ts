export type UploadStatus =
  | "uploading"
  | "uploaded"
  | "validating"
  | "parsing"
  | "cleaning"
  | "analyzing"
  | "metadata_generation"
  | "ready"
  | "failed"
  | "archived";

export interface DatasetMetadata {
  id: string;
  dataset_id: string;
  memory_usage: number | null;
  missing_values: Record<string, number> | null;
  duplicate_rows: number | null;
  detected_columns: Record<string, any> | null;
  detected_data_types: Record<string, string> | null;
  normalization_status: string | null;
  preprocessing_status: string | null;
}

export interface ProcessingJob {
  id: string;
  dataset_id: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration: number | null;
}

export interface Dataset {
  id: string;
  user_id: string;
  original_filename: string;
  stored_filename: string;
  file_type: string;
  file_size: number;
  row_count: number | null;
  column_count: number | null;
  upload_status: UploadStatus;
  upload_progress: number;
  created_at: string;
  updated_at: string;
  metadata?: DatasetMetadata;
  jobs?: ProcessingJob[];
}

export interface PaginatedDatasets {
  items: Dataset[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface DatasetSummary {
  dataset: Dataset;
  statistics: Record<string, any> | null;
}

export interface DatasetPreview {
  dataset_id: string;
  columns: string[];
  rows: Record<string, any>[];
  total_rows: number;
  limit: number;
  offset: number;
}
