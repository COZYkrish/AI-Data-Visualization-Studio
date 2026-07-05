import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ChartPayload } from "../../types";

interface Props {
  payload: ChartPayload;
  height: number;
  colors: string[];
}

export const HistogramComponent: React.FC<Props> = ({
  payload,
  height,
  colors,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart
      data={payload.data}
      margin={{ top: 10, right: 20, left: 0, bottom: 50 }}
      barCategoryGap={1}
    >
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="var(--color-border)"
        opacity={0.4}
      />
      <XAxis
        dataKey={payload.x_key ?? "label"}
        tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
        angle={-40}
        textAnchor="end"
        interval={2}
      />
      <YAxis
        tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        label={{
          value: "Frequency",
          angle: -90,
          position: "insideLeft",
          fontSize: 11,
        }}
      />
      <Tooltip
        contentStyle={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "0.5rem",
          fontSize: "12px",
        }}
      />
      <Bar dataKey={payload.y_key ?? "count"} maxBarSize={80}>
        {payload.data.map((_, i) => (
          <Cell key={i} fill={colors[0]} fillOpacity={0.8 - (i % 3) * 0.1} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);
