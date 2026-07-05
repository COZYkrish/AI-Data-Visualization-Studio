/**
 * DatasetAnalytics — Full per-dataset analytics workspace
 * Deep-dive into a specific dataset with full-page charts, stats, and explorer.
 */
import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Database } from "lucide-react";
import { KPIEngine } from "../components/KPIEngine";
import { VisualizationPanel } from "../components/VisualizationPanel";
import { DatasetExplorer } from "../components/DatasetExplorer";
import { FilterPanel } from "../components/FilterPanel";
import { QuickStatsCard } from "../components/QuickStatsCard";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";
import { useDatasetStatistics } from "../hooks";
import { useDashboardStore } from "../../../store/dashboard.store";

export const DatasetAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const setSelectedDataset = useDashboardStore((s) => s.setSelectedDataset);

  // Auto-select the dataset from the URL
  React.useEffect(() => {
    if (id) setSelectedDataset(id);
  }, [id, setSelectedDataset]);

  const { data: statistics, isLoading, error } = useDatasetStatistics(id);

  if (!id) return <ErrorState message="No dataset ID in URL" />;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-sm"
      >
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <Database className="h-3.5 w-3.5 text-primary" />
          Dataset Analytics
        </span>
        {statistics && (
          <>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-muted-foreground truncate max-w-[200px]">
              {id.slice(0, 8)}…
            </span>
          </>
        )}
      </motion.div>

      {/* Dataset Header */}
      {isLoading ? (
        <LoadingSkeleton className="h-20 rounded-2xl" />
      ) : error ? (
        <ErrorState message="Failed to load dataset statistics" />
      ) : statistics ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-base font-bold">{id}</p>
              <p className="text-xs text-muted-foreground">
                {statistics.row_count.toLocaleString()} rows ·{" "}
                {statistics.column_count} columns
              </p>
            </div>
            <div className="ml-auto flex gap-3 text-xs text-muted-foreground">
              {Object.entries(
                Object.values(statistics.data_types ?? {}).reduce<
                  Record<string, number>
                >((acc, t) => {
                  acc[t] = (acc[t] ?? 0) + 1;
                  return acc;
                }, {}),
              ).map(([type, count]) => (
                <span key={type} className="px-2 py-1 rounded-lg bg-muted">
                  {count} {type}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* KPIs */}
      <KPIEngine datasetId={id} />

      {/* Main Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <VisualizationPanel datasetId={id} statistics={statistics} />
          <DatasetExplorer datasetId={id} />
        </div>
        <div className="space-y-4">
          <FilterPanel statistics={statistics} />
          {statistics && <QuickStatsCard statistics={statistics} />}
        </div>
      </div>
    </div>
  );
};
