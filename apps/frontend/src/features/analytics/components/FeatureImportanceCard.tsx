import React from "react";
import { FeatureImportanceResult } from "../types/analytics";

export const FeatureImportanceCard: React.FC<{
  data: FeatureImportanceResult;
}> = ({ data }) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Feature Importance</h3>
      <div className="space-y-4">
        {data.ranked_features.slice(0, 8).map((feature, idx) => (
          <div key={feature.column}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{feature.column}</span>
              <span className="font-bold">
                {feature.overall_importance_score.toFixed(1)}
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${feature.overall_importance_score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
