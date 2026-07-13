import * as React from "react";
import { useToast } from "@studio/ui";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Plus, Sparkles, AlertCircle } from "lucide-react";

import { useAppStore } from "../../../store";
import { useMLStore } from "../../../store/ml.store";
import {
  useSavedModels,
  useModel,
  useEvaluation,
  useForecastData,
  useModelRecommendations,
  useTrainModel,
  useForecast,
  usePrediction,
  useDeleteModel,
  useRetrainModel,
} from "../hooks/useML";
import { useDatasets } from "../../datasets/hooks/useDatasets";

import {
  MLEmptyState,
  MLSkeleton,
  MLErrorState,
  MLToolbar,
} from "../components/MLShared";
import { TrainingWizard } from "../components/TrainingWizard";
import { ModelCard } from "../components/ModelCard";
import {
  MetricGrid,
  FeatureImportanceCard,
  EvaluationCard,
} from "../components/EvaluationComponents";
import { ConfusionMatrixCard } from "../components/ConfusionMatrixCard";
import { ForecastChart } from "../components/ForecastChart";
import {
  PredictionPanel,
  ModelHistoryTable,
} from "../components/PredictionAndHistory";

import type {
  MLModel,
  TrainRequest,
  ForecastRequest,
  PredictionResult,
} from "../types";

export const MLWorkspace: React.FC = () => {
  const { toast } = useToast();
  const { wizardState, activeModel, setActiveModel, resetWizard } =
    useMLStore();

  const [isWizardOpen, setIsWizardOpen] = React.useState(false);

  // Queries
  const { data: datasetsResponse, isLoading: isLoadingDatasets } = useDatasets(
    0,
    100,
  );
  // datasetsResponse.data is PaginatedDatasets — unwrap .items
  const datasets = datasetsResponse?.data?.items ?? [];

  const { data: savedModels = [], isLoading: isLoadingModels } =
    useSavedModels();

  const { data: modelDetails, isLoading: isLoadingModel } = useModel(
    activeModel?.id,
  );
  const { data: evalResults } = useEvaluation(activeModel?.id);
  const { data: forecastData } = useForecastData(
    activeModel?.model_type === "forecasting" ? activeModel.id : undefined,
  );

  // Mutations
  const trainMutation = useTrainModel();
  const forecastMutation = useForecast();
  const predictMutation = usePrediction();
  const deleteMutation = useDeleteModel();
  const retrainMutation = useRetrainModel(activeModel?.id ?? "");

  // Selection
  const handleSelectModel = (model: MLModel) => {
    setIsWizardOpen(false);
    setActiveModel(model);
    predictMutation.reset();
  };

  const handleStartWizard = () => {
    setActiveModel(null);
    resetWizard();
    setIsWizardOpen(true);
  };

  const handleTrain = async () => {
    try {
      let result;
      if (wizardState.isForecast) {
        const req: ForecastRequest = {
          dataset_id: wizardState.datasetId!,
          model_name: wizardState.modelName,
          algorithm: wizardState.algorithm as any,
          date_column: wizardState.dateColumn!,
          value_column: wizardState.valueColumn!,
          horizon: wizardState.forecastHorizon,
          hyperparameters: wizardState.hyperparameters,
        };
        result = await forecastMutation.mutateAsync(req);
      } else {
        const req: TrainRequest = {
          dataset_id: wizardState.datasetId!,
          model_name: wizardState.modelName,
          algorithm: wizardState.algorithm!,
          target_column: wizardState.targetColumn,
          feature_columns: wizardState.featureColumns,
          test_size: wizardState.testSize,
          random_state: wizardState.randomState,
          hyperparameters: wizardState.hyperparameters,
        };
        result = await trainMutation.mutateAsync(req);
      }
      setIsWizardOpen(false);
      setActiveModel(result);
      toast({
        title: "Success",
        description: "Model training initiated successfully",
        type: "success",
      });
    } catch (e: any) {
      console.error(e);
      const msg =
        e.response?.data?.detail || e.message || "Failed to train model";
      toast({ title: "Error", description: msg, type: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this model?")) {
      try {
        await deleteMutation.mutateAsync(id);
        if (activeModel?.id === id) setActiveModel(null);
        toast({
          title: "Success",
          description: "Model deleted",
          type: "success",
        });
      } catch (e: any) {
        console.error(e);
        toast({
          title: "Error",
          description: e.response?.data?.detail || "Failed to delete model",
          type: "error",
        });
      }
    }
  };

  const handlePredict = async (input: Record<string, unknown>) => {
    if (!activeModel) return;
    try {
      await predictMutation.mutateAsync({
        model_id: activeModel.id,
        input_data: input,
      });
      toast({
        title: "Success",
        description: "Prediction generated successfully",
        type: "success",
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Error",
        description: e.response?.data?.detail || "Prediction failed",
        type: "error",
      });
    }
  };

  // Derive columns from the already-fetched dataset list (available immediately).
  // Using useDataset lazily would leave dsColumns empty when the Target step first renders.
  const selectedDataset = datasets.find((d) => d.id === wizardState.datasetId);
  const dsColumns = selectedDataset?.metadata?.detected_columns
    ? Object.keys(selectedDataset.metadata.detected_columns)
    : [];

  return (
    <div className="space-y-6">
      <MLToolbar
        title="Machine Learning Studio"
        subtitle="Train models, forecast time series, and generate predictions without code."
        actions={
          <button
            onClick={handleStartWizard}
            className="flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Model
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Model List or Wizard */}
        <div className="lg:col-span-4 space-y-6">
          {!isWizardOpen && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Saved Models
              </h3>
              {isLoadingModels ? (
                <MLSkeleton rows={5} />
              ) : savedModels.length === 0 ? (
                <MLEmptyState
                  title="No models yet"
                  description="Click 'New Model' to start training."
                />
              ) : (
                <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
                  {savedModels.map((m) => (
                    <ModelCard
                      key={m.id}
                      model={m}
                      isSelected={activeModel?.id === m.id}
                      onSelect={handleSelectModel}
                      onDelete={handleDelete}
                      onRetrain={() =>
                        retrainMutation.mutate({
                          test_size: m.test_size,
                          random_state: m.random_state,
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {isWizardOpen && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                Training Wizard
              </h3>
              <TrainingWizard
                datasets={datasets
                  .filter((d) => d.upload_status === "ready")
                  .map((d) => ({
                    id: d.id,
                    name: d.original_filename,
                    rows: d.row_count ?? 0,
                    cols: d.column_count ?? 0,
                  }))}
                columns={dsColumns}
                isTraining={
                  trainMutation.isPending || forecastMutation.isPending
                }
                onTrain={handleTrain}
              />
            </div>
          )}
        </div>

        {/* Right column: Model Details */}
        <div className="lg:col-span-8 space-y-6">
          {!activeModel && !isWizardOpen && (
            <div className="rounded-2xl border border-border/50 bg-card/50 p-12 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[400px]">
              <BrainCircuit className="h-16 w-16 text-muted/50 mb-4" />
              <p>
                Select a model from the list to view its details and evaluation.
              </p>
            </div>
          )}

          {activeModel && (
            <div className="space-y-6">
              {isLoadingModel ? (
                <MLSkeleton rows={6} />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeModel.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Header */}
                    <div className="rounded-2xl border border-border/50 bg-card p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-foreground">
                            {activeModel.name}
                          </h2>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground capitalize">
                            <span>{activeModel.model_type}</span>
                            <span>•</span>
                            <span>
                              {activeModel.algorithm.replace(/_/g, " ")}
                            </span>
                            <span>•</span>
                            <span
                              className={
                                activeModel.status === "trained"
                                  ? "text-emerald-400 font-medium"
                                  : "text-amber-400"
                              }
                            >
                              {activeModel.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content depending on type */}
                    {activeModel.model_type === "forecasting" &&
                    forecastData ? (
                      <ForecastChart forecastData={forecastData} />
                    ) : (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          {/* Metrics */}
                          {activeModel.evaluation_summary && (
                            <EvaluationCard title="Evaluation Metrics">
                              <MetricGrid
                                metrics={Object.entries(
                                  activeModel.evaluation_summary,
                                ).map(([k, v]) => ({
                                  label: k,
                                  value: v as number,
                                  color:
                                    k === "r2" || k === "accuracy"
                                      ? "violet"
                                      : "blue",
                                }))}
                                columns={2}
                              />
                            </EvaluationCard>
                          )}

                          {/* Feature Importances */}
                          {activeModel.feature_importances && (
                            <FeatureImportanceCard
                              importances={activeModel.feature_importances}
                            />
                          )}

                          {/* Confusion Matrix */}
                          {evalResults?.[0]?.confusion_matrix && (
                            <ConfusionMatrixCard
                              matrix={evalResults[0].confusion_matrix}
                            />
                          )}
                        </div>

                        <div className="space-y-6">
                          {/* Prediction Form */}
                          <EvaluationCard title="Run Prediction">
                            <PredictionPanel
                              model={activeModel}
                              result={predictMutation.data ?? null}
                              isLoading={predictMutation.isPending}
                              onPredict={handlePredict}
                            />
                          </EvaluationCard>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
