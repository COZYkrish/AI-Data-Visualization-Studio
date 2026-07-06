import React from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { ExecutiveSummaryCard } from "./ExecutiveSummaryCard";
import { InsightFeed } from "./InsightFeed";
import { CorrelationMatrixCard } from "./CorrelationMatrixCard";
import { DistributionCard } from "./DistributionCard";
import { FeatureImportanceCard } from "./FeatureImportanceCard";

export const AnalyticsOverview: React.FC<{ datasetId: string }> = ({
  datasetId,
}) => {
  const { data: analytics, isLoading, error } = useAnalytics(datasetId);

  if (isLoading)
    return (
      <div className="p-8 text-center animate-pulse text-muted-foreground">
        Loading Analytics...
      </div>
    );
  if (error || !analytics)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load analytics
      </div>
    );

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {analytics.executive_summary && (
          <ExecutiveSummaryCard summary={analytics.executive_summary} />
        )}

        {analytics.feature_importance && (
          <FeatureImportanceCard data={analytics.feature_importance} />
        )}

        {analytics.correlation_data && (
          <CorrelationMatrixCard data={analytics.correlation_data} />
        )}

        {analytics.distribution_data && (
          <DistributionCard data={analytics.distribution_data} />
        )}
      </div>
      <div className="space-y-6">
        {analytics.insights && <InsightFeed insights={analytics.insights} />}
      </div>
    </div>
  );
};
