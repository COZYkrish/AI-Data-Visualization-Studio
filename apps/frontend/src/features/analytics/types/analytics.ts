export interface Insight {
  id: string;
  title: string;
  description: string;
  severity: "Info" | "Warning" | "Critical";
  confidence: "High" | "Medium" | "Low";
  category: string;
  affected_columns: string[];
  recommendation?: string;
}

export interface FeatureImportanceItem {
  column: string;
  overall_importance_score: number;
  variance_score: number;
  correlation_score: number;
  missing_value_penalty: number;
  cardinality_score: number;
  information_density: number;
}

export interface CorrelationResult {
  pearson_matrix: Record<string, Record<string, number>>;
  spearman_matrix: Record<string, Record<string, number>>;
  covariance_matrix: Record<string, Record<string, number>>;
  strong_correlations: Array<{
    col1: string;
    col2: string;
    score: number;
    method: string;
    strength: string;
    direction: string;
  }>;
}

export interface DistributionResult {
  columns: Record<string, any>; // Complex nested object
}

export interface TrendResult {
  increasing_trends: Array<{
    column: string;
    time_column: string;
    growth_percentage: number;
    slope: number;
  }>;
  decreasing_trends: Array<{
    column: string;
    time_column: string;
    growth_percentage: number;
    slope: number;
  }>;
  rolling_averages: Record<string, { dates: string[]; values: number[] }>;
  seasonality_indicators?: Record<string, any>;
}

export interface OutlierResult {
  outlier_count: number;
  outlier_percentage: number;
  affected_columns: string[];
  extreme_values: Record<
    string,
    Array<{ index: number; value: number; type: string }>
  >;
  data_quality_warnings: string[];
}

export interface FeatureImportanceResult {
  ranked_features: FeatureImportanceItem[];
}

export interface ExecutiveSummary {
  dataset_quality_score: number;
  readiness_score: number;
  completeness: number;
  strongest_findings: Insight[];
  weakest_areas: Insight[];
  potential_risks: Insight[];
  executive_summary_text: string;
}

export interface AnalyticsResultResponse {
  id: string;
  dataset_id: string;
  analysis_version?: string;
  correlation_data?: CorrelationResult;
  distribution_data?: DistributionResult;
  trend_data?: TrendResult;
  outlier_data?: OutlierResult;
  feature_importance?: FeatureImportanceResult;
  insights?: Insight[];
  executive_summary?: ExecutiveSummary;
  processing_duration?: number;
  created_at: string;
  updated_at: string;
}
