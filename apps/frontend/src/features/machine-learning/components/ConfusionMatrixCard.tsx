/**
 * ConfusionMatrixCard — Visual heatmap for classification confusion matrices
 */

import * as React from "react";
import { motion } from "framer-motion";

interface ConfusionMatrixCardProps {
  matrix: number[][];
  labels?: string[];
}

function cellColor(value: number, max: number): string {
  const intensity = max > 0 ? value / max : 0;
  const alpha = Math.round(intensity * 200 + 20);
  return `rgba(139, 92, 246, ${alpha / 255})`;
}

export const ConfusionMatrixCard: React.FC<ConfusionMatrixCardProps> = ({
  matrix,
  labels,
}) => {
  if (!matrix?.length) return null;

  const n = matrix.length;
  const maxVal = Math.max(...matrix.flat());
  const displayLabels =
    labels ?? Array.from({ length: n }, (_, i) => `Class ${i}`);

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        Confusion Matrix
      </h3>

      <div className="overflow-x-auto">
        <table
          className="text-xs border-collapse"
          aria-label="Confusion matrix"
          role="table"
        >
          <thead>
            <tr>
              <th className="p-2 text-muted-foreground font-normal text-right">
                Actual ↓ / Predicted →
              </th>
              {displayLabels.map((lbl) => (
                <th
                  key={lbl}
                  className="p-2 font-semibold text-foreground text-center min-w-[52px]"
                >
                  {lbl}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, ri) => (
              <tr key={ri}>
                <td className="p-2 font-semibold text-foreground text-right pr-4">
                  {displayLabels[ri]}
                </td>
                {row.map((val, ci) => (
                  <motion.td
                    key={ci}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (ri * n + ci) * 0.02 }}
                    className={`
                      p-2 text-center font-bold rounded-lg m-0.5
                      ${ri === ci ? "ring-1 ring-violet-500/40" : ""}
                    `}
                    style={{ backgroundColor: cellColor(val, maxVal) }}
                    title={`Actual: ${displayLabels[ri]}, Predicted: ${displayLabels[ci]}, Count: ${val}`}
                  >
                    {val}
                  </motion.td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <div className="h-3 w-16 rounded bg-gradient-to-r from-violet-500/10 to-violet-500/80" />
        <span>Low → High count</span>
        <span className="ml-2">◈ Diagonal = correct predictions</span>
      </div>
    </div>
  );
};
