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
  Legend,
} from "recharts";
import type { ChartPayload } from "../../types";

interface Props {
  payload: ChartPayload;
  height: number;
  colors: string[];
}

export const BarChartComponent: React.FC<Props> = ({
  payload,
  height,
  colors,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart
      data={payload.data}
      margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
    >
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="var(--color-border)"
        opacity={0.4}
      />
      <XAxis
        dataKey={payload.x_key ?? "label"}
        tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        angle={-35}
        textAnchor="end"
        interval="preserveStartEnd"
        label={{
          value: payload.x_label,
          position: "insideBottom",
          offset: -50,
          fontSize: 11,
        }}
      />
      <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
      <Tooltip
        contentStyle={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "0.5rem",
          fontSize: "12px",
        }}
        labelStyle={{ fontWeight: 600 }}
      />
      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
      <Bar
        dataKey={payload.y_key ?? "value"}
        radius={[4, 4, 0, 0]}
        maxBarSize={60}
      >
        {payload.data.map((_, i) => (
          <Cell key={i} fill={colors[i % colors.length]} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);
