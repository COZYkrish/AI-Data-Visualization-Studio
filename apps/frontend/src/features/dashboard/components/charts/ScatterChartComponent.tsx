import * as React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import type { ChartPayload } from "../../types";

interface Props {
  payload: ChartPayload;
  height: number;
  colors: string[];
}

export const ScatterChartComponent: React.FC<Props> = ({
  payload,
  height,
  colors,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="var(--color-border)"
        opacity={0.4}
      />
      <XAxis
        dataKey={payload.x_key}
        name={payload.x_label}
        type="number"
        tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        label={{
          value: payload.x_label,
          position: "insideBottom",
          offset: -10,
          fontSize: 11,
        }}
      />
      <YAxis
        dataKey={payload.y_key}
        name={payload.y_label}
        type="number"
        tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        label={{
          value: payload.y_label,
          angle: -90,
          position: "insideLeft",
          fontSize: 11,
        }}
      />
      <ZAxis range={[30, 30]} />
      <Tooltip
        cursor={{ strokeDasharray: "3 3" }}
        contentStyle={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "0.5rem",
          fontSize: "12px",
        }}
      />
      <Scatter data={payload.data} fill={colors[0]} fillOpacity={0.7} />
    </ScatterChart>
  </ResponsiveContainer>
);
