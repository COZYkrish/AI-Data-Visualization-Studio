/**
 * ChartToolbar — Download, share, and settings actions for a chart
 */
import * as React from "react";
import { Download, RefreshCw, Star } from "lucide-react";
import { useDashboardStore } from "../../../store/dashboard.store";
import { useExportChart } from "../hooks";
import { toast } from "sonner";

interface Props {
  datasetId: string;
}

export const ChartToolbar: React.FC<Props> = ({ datasetId }) => {
  const chartSettings = useDashboardStore((s) => s.chartSettings);
  const addFavoriteChart = useDashboardStore((s) => s.addFavoriteChart);
  const { mutate: exportChart, isPending } = useExportChart();

  const handleExport = () => {
    if (!chartSettings) return;
    exportChart(
      {
        dataset_id: datasetId,
        chart_type: chartSettings.type,
        x: chartSettings.x,
        y: chartSettings.y,
        config: chartSettings.config,
      },
      {
        onSuccess: () => toast.success("Chart data exported"),
        onError: () => toast.error("Export failed"),
      },
    );
  };

  const handleFavorite = () => {
    if (!chartSettings) return;
    addFavoriteChart(chartSettings);
    toast.success("Chart saved to favorites");
  };

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={handleFavorite}
        disabled={!chartSettings}
        title="Save to favorites"
        className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-40 transition-colors"
        aria-label="Save chart to favorites"
      >
        <Star className="h-3.5 w-3.5 text-amber-400" />
      </button>
      <button
        onClick={handleExport}
        disabled={!chartSettings || isPending}
        title="Export chart data"
        className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-40 transition-colors"
        aria-label="Export chart"
      >
        {isPending ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : (
          <Download className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
    </div>
  );
};
