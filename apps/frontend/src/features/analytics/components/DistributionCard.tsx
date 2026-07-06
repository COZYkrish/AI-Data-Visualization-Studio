import React from "react";
import { DistributionResult } from "../types/analytics";

export const DistributionCard: React.FC<{ data: DistributionResult }> = ({
  data,
}) => {
  const columns = Object.entries(data.columns);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Distributions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {columns.slice(0, 6).map(([colName, stats]) => (
          <div
            key={colName}
            className="p-4 rounded-lg bg-muted/20 border border-border"
          >
            <h4 className="font-medium text-sm mb-2">{colName}</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Type</span>
                <span className="font-medium text-foreground">
                  {stats.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Classification</span>
                <span className="font-medium text-foreground">
                  {stats.classification}
                </span>
              </div>
              {stats.type === "numeric" && (
                <>
                  <div className="flex justify-between">
                    <span>Mean</span>
                    <span className="font-medium text-foreground">
                      {stats.mean?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Missing</span>
                    <span className="font-medium text-foreground">
                      {stats.missing_percentage?.toFixed(1)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
