import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ChartPayload } from "../../types";

interface Props {
  payload: ChartPayload;
  height: number;
  colors: string[];
}

export const LineChartComponent: React.FC<Props> = ({
  payload,
  height,
  colors,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart
      data={payload.data}
      margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
    >
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="var(--color-border)"
        opacity={0.4}
      />
      <XAxis
        dataKey={payload.x_key ?? "date"}
        tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
        interval="preserveStartEnd"
        angle={-25}
        textAnchor="end"
        label={{
          value: payload.x_label,
          position: "insideBottom",
          offset: -30,
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
      />
      <Legend wrapperStyle={{ fontSize: "11px" }} />
      <Line
        type="monotone"
        dataKey={payload.y_key ?? "value"}
        stroke={colors[0]}
        strokeWidth={2.5}
        dot={false}
        activeDot={{ r: 4, strokeWidth: 0 }}
      />
    </LineChart>
  </ResponsiveContainer>
);
