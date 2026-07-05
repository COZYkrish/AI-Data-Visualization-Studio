import * as React from "react";
import {
  AreaChart,
  Area,
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

export const AreaChartComponent: React.FC<Props> = ({
  payload,
  height,
  colors,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart
      data={payload.data}
      margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3} />
          <stop offset="95%" stopColor={colors[0]} stopOpacity={0.03} />
        </linearGradient>
      </defs>
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
      <Area
        type="monotone"
        dataKey={payload.y_key ?? "value"}
        stroke={colors[0]}
        strokeWidth={2.5}
        fill="url(#areaGrad)"
        dot={false}
      />
    </AreaChart>
  </ResponsiveContainer>
);
