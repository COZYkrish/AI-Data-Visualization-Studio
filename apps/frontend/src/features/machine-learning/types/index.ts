/**
 * Machine Learning Feature Types — Phase 7
 *
 * TypeScript interfaces mirroring backend Pydantic schemas.
 * Covers: models, training, evaluation, prediction, forecasting.
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type MLModelType =
  "regression" | "classification" | "clustering" | "forecasting";

export type MLAlgorithm =
  | "linear_regression"
  | "random_forest_regressor"
  | "logistic_regression"
  | "decision_tree_classifier"
  | "random_forest_classifier"
  | "kmeans"
  | "dbscan"
  | "prophet"
  | "arima";

export type MLModelStatus = "training" | "trained" | "failed" | "archived";

// ── Model ──────────────────────────────────────────────────────────────────

export interface MLModel {
  id: string;
  user_id: string;
  dataset_id: string;
  name: string;
  description: string | null;
  model_type: MLModelType;
  algorithm: MLAlgorithm;
  status: MLModelStatus;
  model_version: string;
  hyperparameters: Record<string, unknown> | null;
  feature_columns: string[] | null;
  target_column: string | null;
  test_size: number;
  random_state: number;
  evaluation_summary: Record<string, unknown> | null;
  feature_importances: Record<string, number> | null;
  training_duration: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModelRun {
  id: string;
  model_id: string;
  run_number: number;
  status: MLModelStatus;
  metrics: Record<string, unknown> | null;
  training_duration: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface MLModelDetail extends MLModel {
  runs: ModelRun[];
  evaluation_results: EvaluationResult[];
}

// ── Evaluation ─────────────────────────────────────────────────────────────

export interface EvaluationResult {
  id: string;
  model_id: string;
  metrics: Record<string, unknown> | null;
  confusion_matrix: number[][] | null;
  classification_report: Record<string, unknown> | null;
  roc_curve_data: ROCCurveData | null;
  residuals_data: ResidualPoint[] | null;
  actual_vs_predicted: ActualVsPredicted[] | null;
  cluster_stats: Record<string, ClusterStat> | null;
  cluster_assignments: ClusterAssignment[] | null;
  created_at: string;
}

export interface RegressionMetrics {
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
  mape: number | null;
}

export interface ClassificationMetrics {
  accuracy: number;
  precision: number | null;
  recall: number | null;
  f1: number | null;
  roc_auc: number | null;
  n_classes: number;
}

export interface ClusteringMetrics {
  n_clusters: number;
  silhouette_score: number | null;
  davies_bouldin_index: number | null;
  inertia: number | null;
  cluster_distribution: Record<string, number>;
  noise_points: number;
}

export interface ForecastMetrics {
  mae: number | null;
  rmse: number | null;
  mape: number | null;
}

export interface ResidualPoint {
  index: number;
  actual: number;
  predicted: number;
  residual: number;
}

export interface ActualVsPredicted {
  actual: number;
  predicted: number;
}

export interface ROCCurveData {
  type: "binary" | "multiclass";
  fpr?: number[];
  tpr?: number[];
  auc?: number;
  classes?: Record<string, { fpr: number[]; tpr: number[]; auc: number }>;
}

export interface ClusterStat {
  size: number;
  means: Record<string, number>;
  stds: Record<string, number>;
}

export interface ClusterAssignment {
  cluster: number;
  [feature: string]: number;
}

// ── Prediction ─────────────────────────────────────────────────────────────

export interface PredictionResult {
  model_id: string;
  predicted_value: {
    value?: number | string;
    label?: string;
    encoded?: number;
  };
  prediction_confidence: number | null;
  class_probabilities?: Record<string, number>;
  feature_contributions: Record<string, number> | null;
}

// ── Forecast ───────────────────────────────────────────────────────────────

export interface ForecastPoint {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
  is_future: boolean;
}

export interface ForecastData {
  id: string;
  model_id: string;
  date_column: string;
  value_column: string;
  horizon: number;
  forecast_data: ForecastPoint[] | null;
  trend_data: Array<{ ds: string; trend: number }> | null;
  seasonality_data: Record<string, unknown> | null;
  metrics: ForecastMetrics | null;
  created_at: string;
}

// ── Recommendation ─────────────────────────────────────────────────────────

export interface ModelRecommendation {
  algorithm: MLAlgorithm;
  model_type: MLModelType;
  reason: string;
  confidence: "High" | "Medium" | "Low";
  suitable_for: string[];
}

export interface ModelRecommendationResponse {
  dataset_id: string;
  recommendations: ModelRecommendation[];
  dataset_summary: {
    n_rows: number;
    n_cols: number;
    n_numeric: number;
    n_categorical: number;
    has_datetime: boolean;
    target_column: string | null;
  };
}

// ── Request Bodies ──────────────────────────────────────────────────────────

export interface TrainRequest {
  dataset_id: string;
  model_name: string;
  algorithm: MLAlgorithm;
  target_column?: string | null;
  feature_columns?: string[] | null;
  test_size: number;
  random_state: number;
  hyperparameters?: Record<string, unknown> | null;
}

export interface ForecastRequest {
  dataset_id: string;
  model_name: string;
  algorithm: "prophet" | "arima";
  date_column: string;
  value_column: string;
  horizon: number;
  hyperparameters?: Record<string, unknown> | null;
}

export interface PredictRequest {
  model_id: string;
  input_data: Record<string, unknown>;
}

export interface RetrainRequest {
  hyperparameters?: Record<string, unknown> | null;
  test_size: number;
  random_state: number;
}

// ── Wizard State ────────────────────────────────────────────────────────────

export type WizardStep =
  | "dataset"
  | "target"
  | "features"
  | "model"
  | "configure"
  | "train"
  | "evaluate";

export interface WizardState {
  step: WizardStep;
  datasetId: string | null;
  targetColumn: string | null;
  featureColumns: string[];
  algorithm: MLAlgorithm | null;
  hyperparameters: Record<string, unknown>;
  modelName: string;
  testSize: number;
  randomState: number;
  isForecast: boolean;
  dateColumn: string | null;
  valueColumn: string | null;
  forecastHorizon: number;
}
