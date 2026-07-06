import React from "react";
import { ExecutiveSummary } from "../types/analytics";

export const ExecutiveSummaryCard: React.FC<{ summary: ExecutiveSummary }> = ({
  summary,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border bg-muted/20">
        <h2 className="text-xl font-bold tracking-tight">Executive Summary</h2>
        <p className="text-sm text-muted-foreground mt-1">
          AI-generated dataset evaluation
        </p>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex flex-col justify-center">
            <span className="text-sm text-primary font-medium">
              Quality Score
            </span>
            <span className="text-3xl font-bold text-primary mt-1">
              {summary.dataset_quality_score}/100
            </span>
          </div>
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 flex flex-col justify-center">
            <span className="text-sm text-accent-foreground font-medium">
              Readiness
            </span>
            <span className="text-3xl font-bold text-accent-foreground mt-1">
              {summary.readiness_score}/100
            </span>
          </div>
          <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20 flex flex-col justify-center">
            <span className="text-sm text-secondary-foreground font-medium">
              Completeness
            </span>
            <span className="text-3xl font-bold text-secondary-foreground mt-1">
              {summary.completeness.toFixed(1)}%
            </span>
          </div>
        </div>

        <div>
          <p className="text-base leading-relaxed">
            {summary.executive_summary_text}
          </p>
        </div>

        {summary.potential_risks.length > 0 && (
          <div>
            <h3 className="font-semibold text-destructive mb-3">
              Potential Risks
            </h3>
            <ul className="space-y-2">
              {summary.potential_risks.map((risk) => (
                <li
                  key={risk.id}
                  className="text-sm text-muted-foreground flex gap-2"
                >
                  <span className="text-destructive">•</span>
                  {risk.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
