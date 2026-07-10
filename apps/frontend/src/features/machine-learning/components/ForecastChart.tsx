/**
 * ForecastChart — Interactive Recharts forecast visualisation
 * Shows historical data, forecast line, and confidence interval
 */

import * as React from "react";
import { motion } from "framer-motion";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { ForecastData, ForecastMetrics } from "../types";

interface ForecastChartProps {
  forecastData: ForecastData;
  height?: number;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  forecastData,
  height = 380,
}) => {
  const { forecast_data, metrics, date_column, value_column, horizon } =
    forecastData;

  const chartData = React.useMemo(() => {
    if (!forecast_data) return [];
    return forecast_data.map((pt) => ({
      date: new Date(pt.ds).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit",
      }),
      forecast: Number(pt.yhat.toFixed(4)),
      lower: Number(pt.yhat_lower.toFixed(4)),
      upper: Number(pt.yhat_upper.toFixed(4)),
      isFuture: pt.is_future,
    }));
  }, [forecast_data]);

  // Find where future starts
  const futureSeparatorIdx = chartData.findIndex((d) => d.isFuture);
  const futureSeparatorDate =
    futureSeparatorIdx >= 0 ? chartData[futureSeparatorIdx]?.date : null;

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        No forecast data available
      </div>
    );
  }

  const metricsData = metrics as ForecastMetrics | null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/50 bg-card p-5 space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Forecast — {value_column}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {horizon}-period ahead · Date column: {date_column}
          </p>
        </div>
        {metricsData && (
          <div className="flex gap-4 text-right">
            {metricsData.mae !== null && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  MAE
                </p>
                <p className="text-sm font-bold text-foreground tabular-nums">
                  {metricsData.mae?.toFixed(3)}
                </p>
              </div>
            )}
            {metricsData.rmse !== null && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  RMSE
                </p>
                <p className="text-sm font-bold text-foreground tabular-nums">
                  {metricsData.rmse?.toFixed(3)}
                </p>
              </div>
            )}
            {metricsData.mape !== null && metricsData.mape !== undefined && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  MAPE
                </p>
                <p className="text-sm font-bold text-foreground tabular-nums">
                  {metricsData.mape?.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
        >
          <defs>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.03} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.4}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            interval={Math.floor(chartData.length / 8)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            width={60}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "10px",
              fontSize: "12px",
            }}
            labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
            formatter={(value: any, name: any) => [
              typeof value === "number" ? value.toFixed(3) : value,
              name === "forecast"
                ? "Forecast"
                : name === "upper"
                  ? "Upper CI"
                  : "Lower CI",
            ]}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />

          {/* Confidence interval */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="url(#confidenceGradient)"
            fillOpacity={1}
            name="upper"
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="hsl(var(--card))"
            fillOpacity={1}
            name="lower"
            legendType="none"
          />

          {/* Forecast line */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
            name="forecast"
            activeDot={{ r: 4, fill: "#8b5cf6" }}
          />

          {/* Future boundary */}
          {futureSeparatorDate && (
            <ReferenceLine
              x={futureSeparatorDate}
              stroke="#8b5cf6"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{
                value: "Forecast →",
                position: "top",
                fontSize: 10,
                fill: "#8b5cf6",
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-6 bg-violet-500 rounded" />
          <span>Forecast</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-6 rounded bg-violet-500/15" />
          <span>Confidence interval</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 border-b-2 border-dashed border-violet-500/60" />
          <span>Future boundary</span>
        </div>
      </div>
    </motion.div>
  );
};
