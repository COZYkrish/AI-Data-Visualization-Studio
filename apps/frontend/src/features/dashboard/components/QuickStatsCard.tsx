/**
 * QuickStatsCard — Column statistics summary for the stats sidebar
 */
import * as React from "react";
import { motion } from "framer-motion";
import type { DatasetStatistics, ColumnStat } from "../types";

interface Props {
  statistics: DatasetStatistics;
}

const TYPE_BADGE: Record<string, string> = {
  numeric: "bg-blue-500/20 text-blue-400",
  categorical: "bg-amber-500/20 text-amber-400",
  datetime: "bg-cyan-500/20 text-cyan-400",
  boolean: "bg-emerald-500/20 text-emerald-400",
  unknown: "bg-slate-500/20 text-slate-400",
};

export const QuickStatsCard: React.FC<Props> = ({ statistics }) => {
  const columns = statistics.columns.slice(0, 15);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Column Statistics</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {statistics.column_count} columns ·{" "}
          {statistics.row_count.toLocaleString()} rows
        </p>
      </div>
      <div className="divide-y divide-border overflow-y-auto max-h-96 custom-scrollbar">
        {columns.map((col, i) => {
          const stat: ColumnStat | undefined = statistics.column_stats?.[col];
          const type = stat?.inferred_type ?? "unknown";
          const badgeClass = TYPE_BADGE[type] ?? TYPE_BADGE.unknown;

          return (
            <motion.div
              key={col}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="px-4 py-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-foreground truncate flex-1">
                  {col}
                </p>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${badgeClass}`}
                >
                  {type}
                </span>
              </div>
              {stat && (
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span>{stat.unique_values} unique</span>
                  <span>{stat.null_percentage.toFixed(1)}% null</span>
                  {stat.mean !== undefined && (
                    <span>μ {stat.mean?.toFixed(2)}</span>
                  )}
                </div>
              )}
              {/* Null indicator bar */}
              <div className="mt-1.5 h-1 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/50"
                  style={{ width: `${100 - (stat?.null_percentage ?? 0)}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
