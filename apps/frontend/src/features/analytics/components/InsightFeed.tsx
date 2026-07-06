import React from "react";
import { Insight } from "../types/analytics";

const severityColorMap = {
  Critical: "bg-destructive/10 text-destructive border-destructive/20",
  Warning: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

export const InsightFeed: React.FC<{ insights: Insight[] }> = ({
  insights,
}) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-border text-center text-muted-foreground">
        No insights generated yet.
      </div>
    );
  }

  // Display top 10 insights to avoid clutter
  const displayInsights = insights.slice(0, 10);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center justify-between">
        Key Insights
        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {insights.length} total
        </span>
      </h3>
      <div className="space-y-3">
        {displayInsights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-xl border shadow-sm transition-all hover:shadow-md ${severityColorMap[insight.severity] || "border-border bg-card"}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-sm">{insight.title}</h4>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                {insight.category}
              </span>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              {insight.description}
            </p>
            {insight.recommendation && (
              <p className="text-xs opacity-75 mt-3 pt-3 border-t border-current/10">
                <span className="font-semibold block mb-1">
                  Recommendation:
                </span>
                {insight.recommendation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
