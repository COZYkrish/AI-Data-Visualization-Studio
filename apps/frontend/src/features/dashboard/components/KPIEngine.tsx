/**
 * KPIEngine — Renders the full KPI grid for a selected dataset
 */
import * as React from "react";
import { useKPIs } from "../hooks";
import { KPICard } from "./KPICard";
import type { KPICard as KPICardType } from "../types";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorState } from "./ErrorState";

interface Props {
  datasetId: string;
}

export const KPIEngine: React.FC<Props> = ({ datasetId }) => {
  const { data: kpis, isLoading, error } = useKPIs(datasetId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load KPIs" />;
  }

  if (!kpis?.length) return null;

  return (
    <section aria-label="Key performance indicators">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {kpis.map((kpi: KPICardType, i: number) => (
          <KPICard key={kpi.key} kpi={kpi} index={i} />
        ))}
      </div>
    </section>
  );
};
