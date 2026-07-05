/**
 * BoxPlotComponent — Five-number summary visualization
 * Recharts doesn't have a native BoxPlot; we render with custom SVG shapes.
 */
import * as React from "react";
import { ResponsiveContainer } from "recharts";
import type { ChartPayload } from "../../types";

interface Props {
  payload: ChartPayload;
  height: number;
  colors: string[];
}

export const BoxPlotComponent: React.FC<Props> = ({
  payload,
  height,
  colors,
}) => {
  const stats = payload.data[0] as any;
  if (!stats)
    return (
      <div
        className="flex items-center justify-center text-muted-foreground text-sm"
        style={{ height }}
      >
        No box plot data available
      </div>
    );

  const {
    min,
    q1,
    median,
    mean,
    q3,
    max,
    whisker_low,
    whisker_high,
    outliers = [],
  } = stats;
  const pad = 60;
  const svgH = height;
  const svgW = 300;
  const range = max - min || 1;
  const toY = (v: number) => pad + ((max - v) / range) * (svgH - 2 * pad);
  const boxX = 100,
    boxW = 100;
  const midX = boxX + boxW / 2;

  return (
    <div className="flex justify-center" style={{ height }}>
      <svg
        width={svgW}
        height={svgH}
        aria-label={`Box plot for ${payload.column}`}
      >
        {/* Whiskers */}
        <line
          x1={midX}
          y1={toY(whisker_high)}
          x2={midX}
          y2={toY(q3)}
          stroke={colors[0]}
          strokeWidth={2}
        />
        <line
          x1={midX}
          y1={toY(q1)}
          x2={midX}
          y2={toY(whisker_low)}
          stroke={colors[0]}
          strokeWidth={2}
        />
        <line
          x1={boxX + 20}
          y1={toY(whisker_high)}
          x2={boxX + boxW - 20}
          y2={toY(whisker_high)}
          stroke={colors[0]}
          strokeWidth={2}
        />
        <line
          x1={boxX + 20}
          y1={toY(whisker_low)}
          x2={boxX + boxW - 20}
          y2={toY(whisker_low)}
          stroke={colors[0]}
          strokeWidth={2}
        />
        {/* IQR Box */}
        <rect
          x={boxX}
          y={toY(q3)}
          width={boxW}
          height={toY(q1) - toY(q3)}
          fill={colors[0]}
          fillOpacity={0.15}
          stroke={colors[0]}
          strokeWidth={2}
          rx={4}
        />
        {/* Median */}
        <line
          x1={boxX}
          y1={toY(median)}
          x2={boxX + boxW}
          y2={toY(median)}
          stroke={colors[0]}
          strokeWidth={3}
        />
        {/* Mean dot */}
        <circle cx={midX} cy={toY(mean)} r={4} fill={colors[1]} />
        {/* Outliers */}
        {outliers.slice(0, 30).map((o: number, i: number) => (
          <circle
            key={i}
            cx={midX + (Math.random() - 0.5) * 20}
            cy={toY(o)}
            r={3}
            fill={colors[2]}
            fillOpacity={0.6}
          />
        ))}
        {/* Labels */}
        {[
          [whisker_high, "Max"],
          [q3, "Q3"],
          [median, "Median"],
          [q1, "Q1"],
          [whisker_low, "Min"],
        ].map(([val, label]) => (
          <g key={String(label)}>
            <text
              x={boxX - 8}
              y={toY(Number(val))}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={9}
              fill="var(--color-muted-foreground)"
            >
              {label}
            </text>
            <text
              x={boxX + boxW + 8}
              y={toY(Number(val))}
              dominantBaseline="middle"
              fontSize={9}
              fill="var(--color-foreground)"
              fontWeight={600}
            >
              {Number(val).toFixed(2)}
            </text>
          </g>
        ))}
        <text
          x={midX}
          y={svgH - 10}
          textAnchor="middle"
          fontSize={11}
          fill="var(--color-muted-foreground)"
        >
          {payload.column}
        </text>
      </svg>
    </div>
  );
};
