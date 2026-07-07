/**
 * PredictionPanel — Interactive single-prediction form
 * ModelHistoryTable — Tabular list of training runs
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronDown, ChevronUp } from "lucide-react";
import type { MLModel, PredictionResult } from "../types";

// ── PredictionPanel ─────────────────────────────────────────────────────────

interface PredictionPanelProps {
  model: MLModel;
  onPredict: (input: Record<string, unknown>) => void;
  result: PredictionResult | null;
  isLoading: boolean;
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({
  model,
  onPredict,
  result,
  isLoading,
}) => {
  const features = model.feature_columns ?? [];
  const [values, setValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(features.map((f) => [f, ""])),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(values)) {
      parsed[k] = isNaN(Number(v)) || v === "" ? v : Number(v);
    }
    onPredict(parsed);
  };

  if (!features.length) {
    return (
      <div className="text-sm text-muted-foreground text-center py-6">
        Feature column information is not available for this model.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-2 max-h-60 overflow-y-auto pr-1">
          {features.map((feat) => (
            <div key={feat} className="flex items-center gap-3">
              <label
                htmlFor={`feat-${feat}`}
                className="w-32 shrink-0 text-[11px] font-medium text-muted-foreground truncate"
                title={feat}
              >
                {feat}
              </label>
              <input
                id={`feat-${feat}`}
                type="text"
                value={values[feat] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [feat]: e.target.value }))
                }
                placeholder="Enter value"
                className="flex-1 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 w-full justify-center rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Send className="h-4 w-4" />
            </motion.div>
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isLoading ? "Predicting…" : "Predict"}
        </button>
      </form>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 space-y-2"
            role="status"
            aria-live="polite"
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-400">
              Prediction Result
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-foreground tabular-nums">
                {result.predicted_value?.label ??
                  String(result.predicted_value?.value ?? "—")}
              </span>
              {result.prediction_confidence != null && (
                <span className="text-xs text-muted-foreground">
                  {(result.prediction_confidence * 100).toFixed(1)}% confidence
                </span>
              )}
            </div>

            {result.class_probabilities && (
              <div className="space-y-1 mt-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Class Probabilities
                </p>
                {Object.entries(result.class_probabilities)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cls, prob]) => (
                    <div key={cls} className="flex items-center gap-2">
                      <span className="text-[11px] w-16 truncate text-muted-foreground">
                        {cls}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-violet-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${prob * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <span className="text-[11px] tabular-nums text-foreground w-10 text-right">
                        {(prob * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── ModelHistoryTable ───────────────────────────────────────────────────────

interface ModelHistoryTableProps {
  models: MLModel[];
  onSelect?: (model: MLModel) => void;
  selectedId?: string | null;
}

export const ModelHistoryTable: React.FC<ModelHistoryTableProps> = ({
  models,
  onSelect,
  selectedId,
}) => {
  if (!models.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No models trained yet.
      </p>
    );
  }

  const STATUS_COLOR: Record<string, string> = {
    trained: "text-emerald-400",
    training: "text-amber-400",
    failed: "text-red-400",
    archived: "text-slate-400",
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border/50">
      <table className="w-full text-sm" role="table" aria-label="Model history">
        <thead className="bg-muted/30">
          <tr>
            {[
              "Name",
              "Algorithm",
              "Status",
              "Metric",
              "Duration",
              "Created",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {models.map((model, i) => {
            const m = model.evaluation_summary as Record<string, number> | null;
            const metric =
              m?.r2 !== undefined
                ? `R² ${m.r2.toFixed(3)}`
                : m?.accuracy !== undefined
                  ? `Acc ${(m.accuracy * 100).toFixed(1)}%`
                  : m?.silhouette_score !== undefined
                    ? `Sil ${m.silhouette_score.toFixed(3)}`
                    : "—";

            return (
              <motion.tr
                key={model.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onSelect?.(model)}
                className={`
                  cursor-pointer border-b border-border/30 transition-colors hover:bg-muted/30
                  ${selectedId === model.id ? "bg-violet-500/5" : ""}
                `}
                role="row"
              >
                <td className="px-4 py-2.5 font-medium text-foreground truncate max-w-[140px]">
                  {model.name}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground capitalize">
                  {model.algorithm.replace(/_/g, " ")}
                </td>
                <td
                  className={`px-4 py-2.5 capitalize font-medium ${STATUS_COLOR[model.status] ?? ""}`}
                >
                  {model.status}
                </td>
                <td className="px-4 py-2.5 tabular-nums text-foreground">
                  {metric}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                  {model.training_duration
                    ? `${model.training_duration.toFixed(1)}s`
                    : "—"}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {new Date(model.created_at).toLocaleDateString()}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
