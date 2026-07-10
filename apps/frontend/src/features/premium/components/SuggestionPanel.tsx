/**
 * SuggestionPanel — AI-style suggestion sidebar with explainability
 */
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  X,
  BarChart2,
  TrendingUp,
  PieChart,
  BrainCircuit,
  Target,
  Zap,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import type { DashboardSuggestion } from "@studio/types";
import {
  useSuggestions,
  useDismissSuggestion,
  useApplySuggestion,
  useGenerateSuggestions,
} from "../hooks/useSuggestions";
import { useSuggestionStore } from "../../../store/premium.store";

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  chart: {
    icon: BarChart2,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    label: "Chart",
  },
  forecast: {
    icon: TrendingUp,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Forecast",
  },
  ml: {
    icon: BrainCircuit,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    label: "ML",
  },
  kpi: {
    icon: Target,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "KPI",
  },
  correlation: {
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    label: "Insight",
  },
  filter: {
    icon: ChevronRight,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    label: "Filter",
  },
};

const SuggestionCard: React.FC<{
  suggestion: DashboardSuggestion;
  onDismiss: (id: string) => void;
  onApply: (id: string) => void;
}> = ({ suggestion, onDismiss, onApply }) => {
  const [showWhy, setShowWhy] = React.useState(false);
  const cfg = TYPE_CONFIG[suggestion.suggestion_type] || TYPE_CONFIG.chart;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.2 }}
      className="group rounded-xl border border-border bg-card p-3 hover:border-primary/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-2">
        <div
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}
        >
          <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-xs font-semibold text-foreground leading-snug">
              {suggestion.title}
            </p>
            <button
              onClick={() => onDismiss(suggestion.id)}
              className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity"
              aria-label="Dismiss suggestion"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
            {suggestion.description}
          </p>

          {/* Why explanation toggle */}
          <button
            onClick={() => setShowWhy((v) => !v)}
            className="mt-1.5 flex items-center gap-1 text-[10px] text-violet-500 hover:text-violet-400 transition-colors"
          >
            <Lightbulb className="h-2.5 w-2.5" />
            {showWhy ? "Hide reasoning" : "Why this?"}
          </button>
          <AnimatePresence>
            {showWhy && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1.5 overflow-hidden text-[11px] text-muted-foreground/80 italic border-l-2 border-violet-500/30 pl-2"
              >
                {suggestion.why}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Priority bar */}
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex-1 rounded-full bg-muted h-1">
              <div
                className={`h-1 rounded-full ${cfg.color.replace("text", "bg")} opacity-70`}
                style={{ width: `${suggestion.priority * 10}%` }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground">
              {suggestion.priority >= 8
                ? "High"
                : suggestion.priority >= 5
                  ? "Med"
                  : "Low"}
            </span>
          </div>

          <button
            onClick={() => onApply(suggestion.id)}
            className={`mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
              suggestion.applied
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            {suggestion.applied ? (
              <>
                <CheckCircle2 className="h-3 w-3" /> Applied
              </>
            ) : (
              <>
                <ChevronRight className="h-3 w-3" /> Apply
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

interface SuggestionPanelProps {
  datasetId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({
  datasetId,
  isOpen,
  onClose,
}) => {
  const { suggestions } = useSuggestionStore();
  const dismiss = useDismissSuggestion();
  const apply = useApplySuggestion();
  const generate = useGenerateSuggestions();
  useSuggestions(datasetId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-72 shrink-0 flex-col border-r border-border bg-card/50"
          aria-label="AI suggestions panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-foreground">
                Suggestions
              </h3>
              {suggestions.length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-[9px] font-bold text-amber-600">
                  {suggestions.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {datasetId && (
                <button
                  onClick={() => generate.mutate(datasetId)}
                  disabled={generate.isPending}
                  className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                  aria-label="Refresh suggestions"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${generate.isPending ? "animate-spin" : ""}`}
                  />
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded p-1 text-muted-foreground hover:bg-accent"
                aria-label="Close suggestions panel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {suggestions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-10 text-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      No suggestions yet
                    </p>
                    {datasetId && (
                      <button
                        onClick={() => generate.mutate(datasetId)}
                        className="mt-2 text-xs text-primary hover:underline"
                      >
                        Generate now
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                suggestions.map((s) => (
                  <SuggestionCard
                    key={s.id}
                    suggestion={s}
                    onDismiss={(id) => dismiss.mutate(id)}
                    onApply={(id) => apply.mutate(id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
