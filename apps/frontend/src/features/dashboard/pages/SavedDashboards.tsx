/**
 * SavedDashboards — Placeholder page for Phase 6
 */
import * as React from "react";
import { motion } from "framer-motion";
import { Star, Lock } from "lucide-react";
import { useDashboardStore } from "../../../store/dashboard.store";

export const SavedDashboards: React.FC = () => {
  const favoriteCharts = useDashboardStore((s) => s.favoriteCharts);
  const removeFavoriteChart = useDashboardStore((s) => s.removeFavoriteChart);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-extrabold">Saved Dashboards</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your saved chart configurations and dashboard layouts.
        </p>
      </motion.div>

      {/* Favorites */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Star className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold">Favorite Charts</h3>
          <span className="ml-auto text-xs text-muted-foreground">
            {favoriteCharts.length} saved
          </span>
        </div>
        {favoriteCharts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No saved charts yet. Use the ★ button on any chart to save it here.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {favoriteCharts.map((chart, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-4 py-3"
              >
                <Star className="h-4 w-4 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {chart.title ?? chart.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {chart.type} · x: {chart.x ?? "—"} · y: {chart.y ?? "—"}
                  </p>
                </div>
                <button
                  onClick={() => removeFavoriteChart(i)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove ${chart.title} from favorites`}
                >
                  Remove
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Phase 6 Preview */}
      <div className="relative rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Lock className="h-32 w-32" />
        </div>
        <Lock className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
        <h3 className="text-base font-bold">Saved Dashboard Layouts</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          Full dashboard persistence, sharing, and layout management will be
          available in Phase 6 — Analytics & Insight Engine.
        </p>
        <span className="mt-4 inline-block rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold text-primary">
          Coming in Phase 6
        </span>
      </div>
    </div>
  );
};
