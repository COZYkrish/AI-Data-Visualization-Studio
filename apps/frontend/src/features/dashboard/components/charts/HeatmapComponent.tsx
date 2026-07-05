/**
 * HeatmapComponent — Correlation Heatmap using SVG
 * Renders a pairwise correlation matrix as a color-coded grid.
 */
import * as React from "react";
import type { ChartPayload } from "../../types";

interface Props {
  payload: ChartPayload;
  height: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function corrToColor(val: number | null): string {
  if (val === null || val === undefined || isNaN(val)) return "#374151";
  const abs = Math.abs(val);
  const r = val > 0 ? lerp(255, 99, abs) : lerp(255, 239, abs);
  const g = lerp(255, 102, abs);
  const b = val > 0 ? lerp(255, 71, abs) : lerp(255, 68, abs);
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

export const HeatmapComponent: React.FC<Props> = ({ payload, height }) => {
  const cols = payload.columns ?? [];
  const matrix = payload.matrix ?? [];

  if (!cols.length || !matrix.length)
    return (
      <div
        className="flex items-center justify-center text-muted-foreground text-sm"
        style={{ height }}
      >
        Insufficient numeric columns for heatmap
      </div>
    );

  const n = cols.length;
  const cellSize = Math.min(Math.floor((height - 60) / n), 60);
  const labelWidth = 90;
  const svgWidth = labelWidth + n * cellSize;
  const svgHeight = labelWidth + n * cellSize;

  return (
    <div className="overflow-auto" style={{ maxHeight: height }}>
      <svg width={svgWidth} height={svgHeight} aria-label="Correlation heatmap">
        {/* Column labels top */}
        {cols.map((col, ci) => (
          <text
            key={`col-${ci}`}
            x={labelWidth + ci * cellSize + cellSize / 2}
            y={labelWidth - 6}
            textAnchor="end"
            transform={`rotate(-45, ${labelWidth + ci * cellSize + cellSize / 2}, ${labelWidth - 6})`}
            fontSize={Math.min(10, cellSize * 0.3)}
            fill="var(--color-muted-foreground)"
          >
            {col.length > 10 ? col.slice(0, 10) + "…" : col}
          </text>
        ))}
        {/* Row labels left */}
        {cols.map((col, ri) => (
          <text
            key={`row-${ri}`}
            x={labelWidth - 6}
            y={labelWidth + ri * cellSize + cellSize / 2}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={Math.min(10, cellSize * 0.3)}
            fill="var(--color-muted-foreground)"
          >
            {col.length > 10 ? col.slice(0, 10) + "…" : col}
          </text>
        ))}
        {/* Cells */}
        {matrix.map((row, ri) =>
          row.map((val, ci) => {
            const x = labelWidth + ci * cellSize;
            const y = labelWidth + ri * cellSize;
            const color = corrToColor(val);
            const display =
              val !== null && !isNaN(val as number)
                ? (val as number).toFixed(2)
                : "";
            return (
              <g key={`${ri}-${ci}`}>
                <rect
                  x={x}
                  y={y}
                  width={cellSize - 1}
                  height={cellSize - 1}
                  fill={color}
                  rx={3}
                >
                  <title>
                    {cols[ri]} × {cols[ci]}: {display}
                  </title>
                </rect>
                {cellSize > 28 && (
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={Math.min(9, cellSize * 0.25)}
                    fill={Math.abs(val ?? 0) > 0.5 ? "white" : "#374151"}
                    fontWeight={600}
                  >
                    {display}
                  </text>
                )}
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
};
