/**
 * ModelCard — Displays a saved ML model in list/grid view
 */

import * as React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  XCircle,
  BrainCircuit,
  TrendingUp,
  PieChart,
  Layers,
  Calendar,
  Trash2,
  RotateCcw,
} from "lucide-react";
import type { MLModel, MLModelType } from "../types";

const MODEL_TYPE_ICONS: Record<MLModelType, React.ElementType> = {
  regression: TrendingUp,
  classification: PieChart,
  clustering: Layers,
  forecasting: Calendar,
};

const MODEL_TYPE_COLORS: Record<MLModelType, string> = {
  regression: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  classification: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  clustering: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  forecasting: "text-violet-400 bg-violet-500/10 border-violet-500/20",
};

const STATUS_ICONS = {
  trained: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  training: <Clock className="h-4 w-4 text-amber-400 animate-spin" />,
  failed: <XCircle className="h-4 w-4 text-red-400" />,
  archived: <Clock className="h-4 w-4 text-slate-400" />,
};

interface ModelCardProps {
  model: MLModel;
  index?: number;
  onSelect?: (model: MLModel) => void;
  onDelete?: (modelId: string) => void;
  onRetrain?: (modelId: string) => void;
  isSelected?: boolean;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  index = 0,
  onSelect,
  onDelete,
  onRetrain,
  isSelected = false,
}) => {
  const TypeIcon = MODEL_TYPE_ICONS[model.model_type] ?? BrainCircuit;
  const colorClass =
    MODEL_TYPE_COLORS[model.model_type] ?? MODEL_TYPE_COLORS.regression;

  const primaryMetric = React.useMemo(() => {
    const m = model.evaluation_summary as Record<string, number> | null;
    if (!m) return null;
    if (m.r2 !== undefined) return { label: "R²", value: m.r2.toFixed(3) };
    if (m.accuracy !== undefined)
      return { label: "Accuracy", value: (m.accuracy * 100).toFixed(1) + "%" };
    if (m.silhouette_score !== undefined)
      return { label: "Silhouette", value: m.silhouette_score.toFixed(3) };
    if (m.mae !== undefined) return { label: "MAE", value: m.mae.toFixed(3) };
    return null;
  }, [model.evaluation_summary]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => onSelect?.(model)}
      className={`
        relative group rounded-2xl border p-4 cursor-pointer transition-all duration-200
        hover:shadow-lg hover:shadow-violet-500/5
        ${
          isSelected
            ? "border-violet-500/50 bg-violet-500/5 shadow-md shadow-violet-500/10"
            : "border-border/50 bg-card hover:border-violet-500/30"
        }
      `}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Model: ${model.name}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.(model)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${colorClass}`}
          >
            <TypeIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {model.name}
            </p>
            <p className="text-[11px] text-muted-foreground capitalize">
              {model.algorithm.replace(/_/g, " ")} · v{model.model_version}
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1">
          {STATUS_ICONS[model.status]}
        </div>
      </div>

      {/* Metrics */}
      {primaryMetric && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
            {primaryMetric.label}
          </span>
          <span className="text-sm font-bold text-foreground tabular-nums">
            {primaryMetric.value}
          </span>
          {model.training_duration && (
            <span className="ml-auto text-[11px] text-muted-foreground">
              {model.training_duration.toFixed(1)}s
            </span>
          )}
        </div>
      )}

      {/* Target */}
      {model.target_column && (
        <div className="mt-2 text-[11px] text-muted-foreground truncate">
          Target:{" "}
          <span className="font-medium text-foreground">
            {model.target_column}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="absolute top-3 right-10 hidden group-hover:flex items-center gap-1">
        {onRetrain && model.status === "trained" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRetrain(model.id);
            }}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
            title="Retrain model"
            aria-label="Retrain model"
          >
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(model.id);
            }}
            className="p-1 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Delete model"
            aria-label="Delete model"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-400" />
          </button>
        )}
      </div>

      {/* Decorative accent */}
      <div className="pointer-events-none absolute -right-3 -bottom-3 h-10 w-10 rounded-full opacity-5 bg-current" />
    </motion.div>
  );
};
