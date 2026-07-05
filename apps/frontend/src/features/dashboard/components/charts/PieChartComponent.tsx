import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ChartPayload } from "../../types";

interface Props {
  payload: ChartPayload;
  height: number;
  colors: string[];
}

const RADIAN = Math.PI / 180;
const renderLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  if (percent < 0.04) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const PieChartComponent: React.FC<Props> = ({
  payload,
  height,
  colors,
}) => {
  const isDonut = payload.chart_type === "donut";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={payload.data}
          dataKey={payload.value_key ?? "value"}
          nameKey={payload.name_key ?? "name"}
          cx="50%"
          cy="50%"
          innerRadius={isDonut ? "45%" : 0}
          outerRadius="70%"
          paddingAngle={isDonut ? 3 : 1}
          labelLine={false}
          label={renderLabel}
        >
          {payload.data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
            fontSize: "12px",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
