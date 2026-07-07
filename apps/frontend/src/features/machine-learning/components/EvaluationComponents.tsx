/**
 * MetricGrid — Responsive grid of evaluation metric cards
 * FeatureImportanceCard — Horizontal bar chart of feature importances
 * EvaluationCard — Wrapper card for an evaluation section
 */

import * as React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ── MetricGrid ──────────────────────────────────────────────────────────────

export interface Metric {
  label: string;
  value: string | number;
  color?: string;
  description?: string;
}

interface MetricGridProps {
  metrics: Metric[];
  columns?: 2 | 3 | 4;
}

const COLOR_VARIANTS: Record<string, string> = {
  blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
  emerald:
    "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
  violet:
    "from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400",
  amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400",
  red: "from-red-500/20 to-red-600/5 border-red-500/20 text-red-400",
  cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
};

export const MetricGrid: React.FC<MetricGridProps> = ({
  metrics,
  columns = 3,
}) => {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {metrics.map((metric, i) => {
        const colorClass =
          COLOR_VARIANTS[metric.color ?? "violet"] ?? COLOR_VARIANTS.violet;
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${colorClass} p-4`}
            role="article"
            aria-label={metric.label}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70">
              {metric.label}
            </p>
            <p className="mt-1.5 text-2xl font-extrabold tabular-nums text-foreground">
              {typeof metric.value === "number"
                ? metric.value % 1 === 0
                  ? metric.value.toLocaleString()
                  : metric.value.toFixed(4)
                : metric.value}
            </p>
            {metric.description && (
              <p className="mt-1 text-[11px] opacity-60">
                {metric.description}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

// ── FeatureImportanceCard ───────────────────────────────────────────────────

interface FeatureImportanceCardProps {
  importances: Record<string, number>;
  maxFeatures?: number;
  title?: string;
}

const BAR_COLORS = [
  "#8b5cf6",
  "#6d28d9",
  "#7c3aed",
  "#5b21b6",
  "#4c1d95",
  "#a78bfa",
  "#c4b5fd",
  "#ddd6fe",
];

export const FeatureImportanceCard: React.FC<FeatureImportanceCardProps> = ({
  importances,
  maxFeatures = 10,
  title = "Feature Importance",
}) => {
  const data = React.useMemo(() => {
    return Object.entries(importances)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxFeatures)
      .map(([feature, value]) => ({
        feature,
        value: Number(value.toFixed(4)),
      }));
  }, [importances, maxFeatures]);

  if (!data.length) return null;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={data.length * 36 + 20}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => v.toFixed(3)}
          />
          <YAxis
            type="category"
            dataKey="feature"
            width={120}
            tick={{ fontSize: 11 }}
            tickLine={false}
          />
          <Tooltip
            formatter={(v: number) => [v.toFixed(4), "Importance"]}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── EvaluationCard ──────────────────────────────────────────────────────────

interface EvaluationCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ElementType;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({
  title,
  children,
  icon: Icon,
}) => (
  <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    {children}
  </div>
);
