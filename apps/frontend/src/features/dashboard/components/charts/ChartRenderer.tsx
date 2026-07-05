/**
 * ChartRenderer — Phase 5: Dashboard & Visualization Engine
 *
 * Central renderer that dispatches to the correct chart component
 * based on chart_type from the backend payload. Supports loading,
 * error, empty states, and theme-aware color palettes.
 */
import * as React from "react";
import { motion } from "framer-motion";
import type { ChartPayload, ChartType } from "../../types";
import { BarChartComponent } from "./BarChartComponent";
import { LineChartComponent } from "./LineChartComponent";
import { AreaChartComponent } from "./AreaChartComponent";
import { PieChartComponent } from "./PieChartComponent";
import { ScatterChartComponent } from "./ScatterChartComponent";
import { HistogramComponent } from "./HistogramComponent";
import { HeatmapComponent } from "./HeatmapComponent";
import { TreemapComponent } from "./TreemapComponent";
import { RadarChartComponent } from "./RadarChartComponent";
import { BubbleChartComponent } from "./BubbleChartComponent";
import { BoxPlotComponent } from "./BoxPlotComponent";

export const CHART_COLORS = [
  "#8b5cf6",
  "#6366f1",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
  "#3b82f6",
  "#a855f7",
];

interface ChartRendererProps {
  payload: ChartPayload | null | undefined;
  isLoading?: boolean;
  error?: string | null;
  height?: number;
  className?: string;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  payload,
  isLoading,
  error,
  height = 320,
  className = "",
}) => {
  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-muted/30 ${className}`}
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs text-muted-foreground">Rendering chart…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 ${className}`}
        style={{ height }}
      >
        <div className="text-center px-4">
          <p className="text-sm font-semibold text-destructive">Chart Error</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!payload || !payload.data || payload.data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-muted/20 border border-dashed border-border ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No data to display</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Select columns to visualize
          </p>
        </div>
      </div>
    );
  }

  const chartType: ChartType = payload.chart_type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
      style={{ height }}
    >
      {chartType === "bar" && (
        <BarChartComponent
          payload={payload}
          height={height}
          colors={CHART_COLORS}
        />
      )}
      {chartType === "line" && (
        <LineChartComponent
          payload={payload}
          height={height}
          colors={CHART_COLORS}
        />
      )}
      {chartType === "area" && (
        <AreaChartComponent
          payload={payload}
          height={height}
          colors={CHART_COLORS}
        />
      )}
      {(chartType === "pie" || chartType === "donut") && (
        <PieChartComponent
          payload={payload}
          height={height}
          colors={CHART_COLORS}
        />
      )}
      {chartType === "scatter" && (
        <ScatterChartComponent
          payload={payload}
          height={height}
          colors={CHART_COLORS}
        />
      )}
      {chartType === "histogram" && (
        <HistogramComponent
          payload={payload}
          height={height}
          colors={CHART_COLORS}
        />
      )}
      {chartType === "heatmap" && (
        <HeatmapComponent payload={payload} height={height} />
      )}
      {chartType === "treemap" && (
        <TreemapComponent
          payload={payload}
          height={height}
          colors={CHART_COLORS}
        />
      )}
      {chartType === "radar" && (
        <RadarChartComponent
          payload={payload}
          height={height}
          colors={CHART_COLORS}
        />
      )}
      {chartType === "bubble" && (
        <BubbleChartComponent
          payload={payload}
          height={height}
          colors={CHART_COLORS}
        />
      )}
      {chartType === "box" && (
        <BoxPlotComponent
          payload={payload}
          height={height}
          colors={CHART_COLORS}
        />
      )}
    </motion.div>
  );
};
