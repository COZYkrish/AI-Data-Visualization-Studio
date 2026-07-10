/**
 * NaturalLanguageQueryBar — NLQ input with results display
 * Shows in the dashboard header when a dataset is active
 */
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  X,
  ChevronRight,
  BarChart2,
  TrendingUp,
  PieChart,
  Loader2,
} from "lucide-react";
import { useNLQ } from "../hooks/useNLQ";

const CHART_ICONS: Record<string, React.ElementType> = {
  bar: BarChart2,
  line: TrendingUp,
  pie: PieChart,
  area: TrendingUp,
  scatter: BarChart2,
  histogram: BarChart2,
};

const PLACEHOLDER_QUERIES = [
  "Show sales by month…",
  "Top 5 customers by revenue…",
  "Average order value by category…",
  "Compare January and February…",
  "Distribution of prices…",
];

interface NLQBarProps {
  datasetId?: string;
  onResultApply?: (result: import("@studio/types").NLQResult) => void;
}

export const NaturalLanguageQueryBar: React.FC<NLQBarProps> = ({
  datasetId,
  onResultApply,
}) => {
  const { query, result, isLoading, error, submit, reset } = useNLQ();
  const [localQuery, setLocalQuery] = React.useState("");
  const [placeholderIdx, setPlaceholderIdx] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Rotating placeholder
  React.useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDER_QUERIES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (localQuery.trim()) {
      submit(localQuery, datasetId);
    }
  };

  const handleReset = () => {
    setLocalQuery("");
    reset();
    inputRef.current?.focus();
  };

  const ChartIcon = result?.chart_type
    ? (CHART_ICONS[result.chart_type] ?? BarChart2)
    : BarChart2;

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-200 ${
            localQuery
              ? "border-primary/50 bg-card shadow-sm ring-1 ring-primary/20"
              : "border-border bg-muted/50 hover:border-border/80"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-500" />
          <input
            ref={inputRef}
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={PLACEHOLDER_QUERIES[placeholderIdx]}
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            aria-label="Natural language query"
          />
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
          ) : localQuery ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Clear query"
              >
                <X className="h-3 w-3" />
              </button>
              <button
                type="submit"
                className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/20"
                aria-label="Submit query"
              >
                Ask
              </button>
            </div>
          ) : (
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
          )}
        </div>
      </form>

      {/* Results dropdown */}
      <AnimatePresence>
        {(result || error) && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border bg-card p-3 shadow-xl"
          >
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : result?.success ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ChartIcon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    {result.chart_type?.toUpperCase()} Chart
                  </span>
                  <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {result.intent?.replace("_", " ")}
                  </span>
                </div>
                {result.explanation && (
                  <p className="text-xs text-muted-foreground">
                    {result.explanation}
                  </p>
                )}
                {result.operation && (
                  <div className="flex flex-wrap gap-1">
                    {result.operation.x_column && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        x: {result.operation.x_column}
                      </span>
                    )}
                    {result.operation.y_column && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        y: {result.operation.y_column}
                      </span>
                    )}
                    {result.operation.aggregation && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        agg: {result.operation.aggregation}
                      </span>
                    )}
                    {result.operation.limit && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        limit: {result.operation.limit}
                      </span>
                    )}
                  </div>
                )}
                <button
                  onClick={() => {
                    onResultApply?.(result);
                    handleReset();
                  }}
                  className="flex w-full items-center justify-center gap-1 rounded-lg bg-primary py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Apply to Dashboard <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Couldn't understand that query. Try one of these:
                </p>
                <div className="space-y-1">
                  {(result?.fallback_suggestions ?? []).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setLocalQuery(s);
                        submit(s, datasetId);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                      <Sparkles className="h-3 w-3 text-violet-500" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
