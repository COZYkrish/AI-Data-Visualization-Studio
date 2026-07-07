/**
 * TrainingWizard — Step-by-step model training workflow
 *
 * Steps: Dataset → Target → Features → Model → Configure → Train
 * Handles both supervised (regression/classification) and
 * unsupervised (clustering/forecasting) flows.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Target,
  Layers,
  BrainCircuit,
  Settings2,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { MLAlgorithm, WizardStep } from "../types";
import { useMLStore } from "../../../store/ml.store";

// ── Step definitions ────────────────────────────────────────────────────────

const STEPS: { id: WizardStep; label: string; icon: React.ElementType }[] = [
  { id: "dataset", label: "Dataset", icon: Database },
  { id: "target", label: "Target", icon: Target },
  { id: "features", label: "Features", icon: Layers },
  { id: "model", label: "Model", icon: BrainCircuit },
  { id: "configure", label: "Configure", icon: Settings2 },
  { id: "train", label: "Train", icon: PlayCircle },
];

const STEP_IDS = STEPS.map((s) => s.id);

// ── Algorithm metadata ───────────────────────────────────────────────────────

const ALGORITHMS: {
  id: MLAlgorithm;
  label: string;
  type: string;
  description: string;
}[] = [
  {
    id: "linear_regression",
    label: "Linear Regression",
    type: "Regression",
    description: "Fast, interpretable baseline for continuous targets",
  },
  {
    id: "random_forest_regressor",
    label: "Random Forest Regressor",
    type: "Regression",
    description: "Robust ensemble for non-linear relationships",
  },
  {
    id: "logistic_regression",
    label: "Logistic Regression",
    type: "Classification",
    description: "Probabilistic linear classifier, highly interpretable",
  },
  {
    id: "decision_tree_classifier",
    label: "Decision Tree",
    type: "Classification",
    description: "Rule-based transparent classifier",
  },
  {
    id: "random_forest_classifier",
    label: "Random Forest Classifier",
    type: "Classification",
    description: "High-accuracy ensemble classifier",
  },
  {
    id: "kmeans",
    label: "K-Means",
    type: "Clustering",
    description: "Discover natural groupings without labels",
  },
  {
    id: "dbscan",
    label: "DBSCAN",
    type: "Clustering",
    description: "Density-based clustering with noise detection",
  },
  {
    id: "prophet",
    label: "Prophet",
    type: "Forecasting",
    description: "Facebook's robust time-series forecaster",
  },
  {
    id: "arima",
    label: "ARIMA",
    type: "Forecasting",
    description: "Classical statistical time-series model",
  },
];

// ── Step Progress ────────────────────────────────────────────────────────────

interface StepProgressProps {
  currentStep: WizardStep;
}

const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  const currentIdx = STEP_IDS.indexOf(currentStep);
  return (
    <nav
      aria-label="Training wizard progress"
      className="flex items-center gap-1"
    >
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        return (
          <React.Fragment key={step.id}>
            <div
              className={`
                flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all
                ${isActive ? "bg-violet-500/15 text-violet-400 border border-violet-500/30" : ""}
                ${isDone ? "text-emerald-400" : ""}
                ${!isActive && !isDone ? "text-muted-foreground" : ""}
              `}
              aria-current={isActive ? "step" : undefined}
            >
              {isDone ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// ── Individual Step Panels ──────────────────────────────────────────────────

interface DatasetStepProps {
  datasets: Array<{ id: string; name: string; rows: number; cols: number }>;
}
const DatasetStep: React.FC<DatasetStepProps> = ({ datasets }) => {
  const { wizardState, setDatasetId, setWizardStep } = useMLStore();
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Select the dataset you want to train a model on.
      </p>
      <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
        {datasets.map((ds) => (
          <button
            key={ds.id}
            onClick={() => {
              setDatasetId(ds.id);
              setWizardStep("target");
            }}
            className={`
              flex items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-violet-500/40
              ${wizardState.datasetId === ds.id ? "border-violet-500/50 bg-violet-500/5" : "border-border/50 bg-card"}
            `}
          >
            <Database className="h-5 w-5 text-violet-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {ds.name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {ds.rows.toLocaleString()} rows · {ds.cols} columns
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

interface ColumnStepProps {
  columns: string[];
  label: string;
  stepOnSelect: WizardStep;
  currentValue: string | null;
  onSelect: (col: string) => void;
}
const ColumnStep: React.FC<ColumnStepProps> = ({
  columns,
  label,
  currentValue,
  onSelect,
}) => (
  <div className="space-y-3">
    <p className="text-sm text-muted-foreground">{label}</p>
    <div className="grid gap-1.5 max-h-64 overflow-y-auto pr-1">
      {columns.map((col) => (
        <button
          key={col}
          onClick={() => onSelect(col)}
          className={`
            flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all
            ${
              currentValue === col
                ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                : "border-border/30 hover:border-violet-500/30 text-foreground"
            }
          `}
        >
          {currentValue === col && (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          )}
          {col}
        </button>
      ))}
    </div>
  </div>
);

interface ModelStepProps {
  isForecast: boolean;
}
const ModelStep: React.FC<ModelStepProps> = ({ isForecast }) => {
  const { wizardState, setAlgorithm, setIsForecast, setWizardStep } =
    useMLStore();
  const filtered = isForecast
    ? ALGORITHMS.filter((a) => a.type === "Forecasting")
    : ALGORITHMS.filter((a) => a.type !== "Forecasting");

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setIsForecast(false)}
          className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all
            ${!isForecast ? "border-violet-500/50 bg-violet-500/10 text-violet-300" : "border-border/30 text-muted-foreground hover:text-foreground"}`}
        >
          Supervised / Unsupervised
        </button>
        <button
          onClick={() => setIsForecast(true)}
          className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all
            ${isForecast ? "border-violet-500/50 bg-violet-500/10 text-violet-300" : "border-border/30 text-muted-foreground hover:text-foreground"}`}
        >
          Forecasting
        </button>
      </div>
      <div className="grid gap-2 max-h-72 overflow-y-auto pr-1">
        {filtered.map((algo) => (
          <button
            key={algo.id}
            onClick={() => {
              setAlgorithm(algo.id);
              setWizardStep("configure");
            }}
            className={`
              rounded-xl border p-3 text-left transition-all hover:border-violet-500/40
              ${wizardState.algorithm === algo.id ? "border-violet-500/50 bg-violet-500/5" : "border-border/50 bg-card"}
            `}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                {algo.label}
              </p>
              <span className="text-[10px] rounded-full px-2 py-0.5 bg-muted text-muted-foreground">
                {algo.type}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {algo.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Main TrainingWizard ─────────────────────────────────────────────────────

interface TrainingWizardProps {
  datasets: Array<{ id: string; name: string; rows: number; cols: number }>;
  columns: string[];
  isTraining: boolean;
  onTrain: () => void;
}

export const TrainingWizard: React.FC<TrainingWizardProps> = ({
  datasets,
  columns,
  isTraining,
  onTrain,
}) => {
  const {
    wizardState,
    setWizardStep,
    setTargetColumn,
    setFeatureColumns,
    setModelName,
    resetWizard,
  } = useMLStore();

  const {
    step,
    targetColumn,
    featureColumns,
    algorithm,
    modelName,
    isForecast,
  } = wizardState;
  const stepIdx = STEP_IDS.indexOf(step);

  const canGoBack = stepIdx > 0;
  const canProceed = React.useMemo(() => {
    switch (step) {
      case "dataset":
        return !!wizardState.datasetId;
      case "target":
        return isForecast || !!targetColumn;
      case "features":
        return isForecast || featureColumns.length > 0;
      case "model":
        return !!algorithm;
      case "configure":
        return !!modelName.trim();
      default:
        return true;
    }
  }, [
    step,
    wizardState.datasetId,
    targetColumn,
    featureColumns,
    algorithm,
    modelName,
    isForecast,
  ]);

  const goNext = () => {
    const next = STEP_IDS[stepIdx + 1];
    if (next) setWizardStep(next);
  };

  const goBack = () => {
    const prev = STEP_IDS[stepIdx - 1];
    if (prev) setWizardStep(prev);
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Progress */}
      <div className="border-b border-border/50 px-5 py-3 bg-muted/20">
        <StepProgress currentStep={step} />
      </div>

      {/* Step Content */}
      <div className="p-5 min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            {step === "dataset" && <DatasetStep datasets={datasets} />}
            {step === "target" && (
              <ColumnStep
                columns={columns}
                label="Select the target column your model should predict."
                stepOnSelect="features"
                currentValue={targetColumn}
                onSelect={(col) => {
                  setTargetColumn(col);
                  setWizardStep("features");
                }}
              />
            )}
            {step === "features" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Select feature columns for training. Leave empty to use all
                  columns (minus target).
                </p>
                <div className="grid gap-1.5 max-h-64 overflow-y-auto pr-1">
                  {columns
                    .filter((c) => c !== targetColumn)
                    .map((col) => {
                      const selected = featureColumns.includes(col);
                      return (
                        <button
                          key={col}
                          onClick={() =>
                            setFeatureColumns(
                              selected
                                ? featureColumns.filter((f) => f !== col)
                                : [...featureColumns, col],
                            )
                          }
                          className={`
                          flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all
                          ${selected ? "border-violet-500/50 bg-violet-500/10 text-violet-300" : "border-border/30 hover:border-violet-500/30 text-foreground"}
                        `}
                        >
                          {selected && (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          )}
                          {col}
                        </button>
                      );
                    })}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {featureColumns.length === 0
                    ? "All columns (except target) will be used."
                    : `${featureColumns.length} column(s) selected.`}
                </p>
              </div>
            )}
            {step === "model" && <ModelStep isForecast={isForecast} />}
            {step === "configure" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder={`My ${algorithm?.replace(/_/g, " ") ?? "Model"}`}
                    className="mt-1 w-full rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Test Size
                    </label>
                    <input
                      type="number"
                      min={0.1}
                      max={0.4}
                      step={0.05}
                      value={wizardState.testSize}
                      onChange={(e) =>
                        useMLStore
                          .getState()
                          .setTestSize(Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      20% recommended
                    </p>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Random State
                    </label>
                    <input
                      type="number"
                      value={wizardState.randomState}
                      onChange={(e) =>
                        useMLStore.getState().wizardState.randomState
                      }
                      className="mt-1 w-full rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                    />
                  </div>
                </div>
              </div>
            )}
            {step === "train" && (
              <div className="flex flex-col items-center justify-center py-8 gap-5">
                {isTraining ? (
                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Loader2 className="h-10 w-10 text-violet-400" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground">
                      Training in progress…
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl bg-violet-500/10 border border-violet-500/20 p-6">
                      <PlayCircle className="h-10 w-10 text-violet-400" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-semibold text-foreground">
                        Ready to Train
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {modelName || "Your model"} ·{" "}
                        {algorithm?.replace(/_/g, " ")}
                      </p>
                    </div>
                    <button
                      onClick={onTrain}
                      className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors shadow-lg shadow-violet-500/20"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Start Training
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="border-t border-border/50 px-5 py-3 flex items-center justify-between bg-muted/10">
        <div className="flex gap-2">
          <button
            onClick={resetWizard}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
        </div>
        <div className="flex gap-2">
          {canGoBack && step !== "train" && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>
          )}
          {step !== "train" && step !== "dataset" && (
            <button
              onClick={goNext}
              disabled={!canProceed}
              className={`
                flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all
                ${
                  canProceed
                    ? "bg-violet-600 hover:bg-violet-500 text-white"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }
              `}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
