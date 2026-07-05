/**
 * VisualizationPanel — Chart builder with recommendation sidebar
 */
import * as React from "react";
import { motion } from "framer-motion";
import { BarChart2, Lightbulb, Maximize2, Minimize2 } from "lucide-react";
import { useChartRecommendations, useCharts } from "../hooks";
import { useDashboardStore } from "../../../store/dashboard.store";
import { ChartRenderer } from "./charts/ChartRenderer";
import { ChartToolbar } from "./ChartToolbar";
import { LoadingSkeleton } from "./LoadingSkeleton";
import type { ChartRecommendation, DatasetStatistics } from "../types";

const CHART_TYPE_LABELS: Record<string, string> = {
  bar: "Bar",
  line: "Line",
  area: "Area",
  pie: "Pie",
  donut: "Donut",
  scatter: "Scatter",
  histogram: "Histogram",
  box: "Box Plot",
  heatmap: "Heatmap",
  treemap: "Treemap",
  bubble: "Bubble",
  radar: "Radar",
};

interface Props {
  datasetId: string;
  statistics?: DatasetStatistics | null;
}

export const VisualizationPanel: React.FC<Props> = ({
  datasetId,
  statistics,
}) => {
  const chartSettings = useDashboardStore((s) => s.chartSettings);
  const setChartSettings = useDashboardStore((s) => s.setChartSettings);
  const isFullscreen = useDashboardStore((s) => s.isFullscreen);
  const setFullscreen = useDashboardStore((s) => s.setFullscreen);

  const { data: recommendations, isLoading: recsLoading } =
    useChartRecommendations(datasetId);

  const chartQuery = chartSettings
    ? { ...chartSettings, dataset_id: datasetId }
    : null;

  const {
    data: chartData,
    isLoading: chartLoading,
    error: chartError,
  } = useCharts(chartQuery);

  const handleRecommendationClick = (rec: ChartRecommendation) => {
    setChartSettings({
      type: rec.chart_type,
      x: rec.x,
      y: rec.y,
      config: rec.config,
      title: rec.title,
    });
  };

  const columns = statistics?.columns ?? [];
  const dataTypes = statistics?.data_types ?? {};

  return (
    <div
      className={`flex flex-col gap-4 ${isFullscreen ? "fixed inset-0 z-50 bg-background p-6" : ""}`}
    >
      {/* Chart Recommendations */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold">Smart Recommendations</h3>
          <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Rule-based
          </span>
        </div>
        <div className="p-3 flex gap-2 overflow-x-auto custom-scrollbar pb-3">
          {recsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <LoadingSkeleton
                key={i}
                className="h-16 w-32 rounded-xl shrink-0"
              />
            ))
          ) : !recommendations?.length ? (
            <p className="text-xs text-muted-foreground px-2 py-3">
              No recommendations yet. Select a dataset with numeric or
              categorical columns.
            </p>
          ) : (
            recommendations
              .slice(0, 12)
              .map((rec: ChartRecommendation, i: number) => (
                <motion.button
                  key={`${rec.chart_type}-${i}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleRecommendationClick(rec)}
                  title={rec.reason}
                  className={`shrink-0 flex flex-col items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                    chartSettings?.type === rec.chart_type &&
                    chartSettings?.x === rec.x &&
                    chartSettings?.y === rec.y
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-background hover:border-primary/50 hover:bg-accent"
                  }`}
                  aria-label={rec.title}
                >
                  <BarChart2 className="h-4 w-4" />
                  <span>
                    {CHART_TYPE_LABELS[rec.chart_type] ?? rec.chart_type}
                  </span>
                  <span className="text-[9px] opacity-60 max-w-[80px] truncate">
                    {rec.title}
                  </span>
                </motion.button>
              ))
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">
              {chartSettings?.title ?? "Visualization Canvas"}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <ChartToolbar datasetId={datasetId} />
            <button
              onClick={() => setFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Custom Chart Builder */}
        {!chartSettings && (
          <div className="p-4 border-b border-border/50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Chart Type
                </label>
                <select
                  onChange={(e) =>
                    setChartSettings({
                      type: e.target.value as any,
                      x: undefined,
                      y: undefined,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label="Chart type"
                >
                  <option value="">Select…</option>
                  {Object.entries(CHART_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  X Axis / Column
                </label>
                <select
                  onChange={(e) =>
                    setChartSettings(
                      chartSettings
                        ? { ...chartSettings, x: e.target.value }
                        : null,
                    )
                  }
                  className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label="X axis column"
                >
                  <option value="">Select…</option>
                  {columns.map((c) => (
                    <option key={c} value={c}>
                      {c} ({dataTypes[c] ?? "?"})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Y Axis (optional)
                </label>
                <select
                  onChange={(e) =>
                    setChartSettings(
                      chartSettings
                        ? { ...chartSettings, y: e.target.value }
                        : null,
                    )
                  }
                  className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label="Y axis column"
                >
                  <option value="">None</option>
                  {columns
                    .filter((c) => dataTypes[c] === "numeric")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setChartSettings(null)}
                  className="w-full rounded-xl border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chart output */}
        <div className="p-4">
          <ChartRenderer
            payload={chartData}
            isLoading={chartLoading}
            error={chartError ? "Failed to load chart data" : null}
            height={isFullscreen ? window.innerHeight - 300 : 360}
          />
        </div>
      </div>
    </div>
  );
};
