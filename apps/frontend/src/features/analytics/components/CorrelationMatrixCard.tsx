import React from "react";
import { CorrelationResult } from "../types/analytics";

export const CorrelationMatrixCard: React.FC<{ data: CorrelationResult }> = ({
  data,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Top Correlations</h3>
      {data.strong_correlations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No strong correlations found.
        </p>
      ) : (
        <div className="space-y-3">
          {data.strong_correlations.slice(0, 5).map((corr, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{corr.col1}</span>
                <span className="text-muted-foreground text-xs">↔</span>
                <span className="font-medium text-sm">{corr.col2}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold">
                  {corr.score.toFixed(2)}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">
                  {corr.strength}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
