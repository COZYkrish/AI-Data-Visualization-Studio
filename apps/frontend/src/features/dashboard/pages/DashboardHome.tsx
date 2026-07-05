/**
 * DashboardHome — Main analytics overview page
 * The primary landing page after login showing overview stats, recent datasets,
 * KPIs for the selected dataset, chart recommendations, and the explorer.
 */
import * as React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BarChart2,
  Database,
  Upload,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useDashboard } from "../hooks";
import { useDashboardStore } from "../../../store/dashboard.store";
import { DatasetSelector } from "../components/DatasetSelector";
import { KPIEngine } from "../components/KPIEngine";
import { VisualizationPanel } from "../components/VisualizationPanel";
import { DatasetExplorer } from "../components/DatasetExplorer";
import { FilterPanel } from "../components/FilterPanel";
import { QuickStatsCard } from "../components/QuickStatsCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { useDatasetStatistics } from "../hooks";
import { formatBytes } from "../utils";

export const DashboardHome: React.FC = () => {
  const { data: overview, isLoading: overviewLoading } = useDashboard();
  const selectedDatasetId = useDashboardStore((s) => s.selectedDatasetId);
  const { data: statistics } = useDatasetStatistics(selectedDatasetId);

  return (
    <div className="space-y-6" aria-label="Analytics dashboard">
      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600 p-6 text-white shadow-xl"
      >
        {/* Geometric decoration */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute right-20 bottom-0 h-24 w-24 rounded-full bg-white/5" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Analytics Workspace
            </h1>
            <p className="mt-1 text-sm text-white/75">
              {overviewLoading ? (
                "Loading your workspace…"
              ) : (
                <>
                  {overview?.ready_datasets ?? 0} ready datasets ·{" "}
                  {(overview?.total_rows_processed ?? 0).toLocaleString()} rows
                  processed · {formatBytes(overview?.total_storage_bytes ?? 0)}{" "}
                  stored
                </>
              )}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              to="/dashboard/datasets/upload"
              className="flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2.5 text-sm font-semibold transition-all"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Link>
            <Link
              to="/dashboard/datasets"
              className="flex items-center gap-2 rounded-xl bg-white text-indigo-700 hover:bg-white/90 px-4 py-2.5 text-sm font-semibold transition-all"
            >
              <Database className="h-4 w-4" />
              Datasets
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Overview Stats (top-level) ────────────────────────────────────── */}
      {!overviewLoading && overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Datasets",
              value: overview.total_datasets,
              icon: Database,
              color: "violet",
            },
            {
              label: "Ready",
              value: overview.ready_datasets,
              icon: CheckCircle2,
              color: "emerald",
            },
            {
              label: "Rows Processed",
              value: overview.total_rows_processed.toLocaleString(),
              icon: BarChart2,
              color: "blue",
            },
            {
              label: "Storage",
              value: formatBytes(overview.total_storage_bytes),
              icon: Clock,
              color: "amber",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
                <stat.icon className="h-4 w-4 text-primary/60" />
              </div>
              <p className="text-2xl font-extrabold tabular-nums">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {overviewLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {/* ── Dataset Selector ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold text-muted-foreground shrink-0">
          Explore:
        </p>
        <DatasetSelector />
        {selectedDatasetId && (
          <Link
            to={`/dashboard/analytics/${selectedDatasetId}`}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            Full analytics
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {/* ── Per-Dataset Content ───────────────────────────────────────────── */}
      {!selectedDatasetId ? (
        <EmptyState />
      ) : (
        <>
          {/* KPIs */}
          <KPIEngine datasetId={selectedDatasetId} />

          {/* Main 2-column grid: Chart + Sidebar */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Visualization Engine */}
              <VisualizationPanel
                datasetId={selectedDatasetId}
                statistics={statistics}
              />
            </div>

            <div className="space-y-4">
              {/* Filters */}
              <FilterPanel statistics={statistics} />
              {/* Column Stats */}
              {statistics && <QuickStatsCard statistics={statistics} />}
            </div>
          </div>

          {/* Dataset Explorer */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold">Dataset Explorer</h2>
              <Link
                to={`/dashboard/analytics/${selectedDatasetId}`}
                className="ml-auto text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                Full view <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <DatasetExplorer datasetId={selectedDatasetId} />
          </section>
        </>
      )}
    </div>
  );
};
