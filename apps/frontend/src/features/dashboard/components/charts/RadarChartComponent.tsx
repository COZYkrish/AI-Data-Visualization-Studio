import * as React from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { ChartPayload } from "../../types";

interface Props {
  payload: ChartPayload;
  height: number;
  colors: string[];
}

export const RadarChartComponent: React.FC<Props> = ({
  payload,
  height,
  colors,
}) => {
  const cols = payload.columns ?? [];
  const data = (payload.data as any[]) ?? [];
  const groups = [...new Set(data.map((d: any) => d.group))];

  // Transform: each data point needs subject + values for each group
  const radarData = cols.map((col) => {
    const row: Record<string, any> = { subject: col };
    groups.forEach((g) => {
      const match = data.find((d: any) => d.group === g);
      row[String(g)] = match ? match[col] : 0;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
        />
        <PolarRadiusAxis tick={{ fontSize: 9 }} />
        {groups.map((g, i) => (
          <Radar
            key={String(g)}
            name={String(g)}
            dataKey={String(g)}
            stroke={colors[i % colors.length]}
            fill={colors[i % colors.length]}
            fillOpacity={0.18}
            strokeWidth={2}
          />
        ))}
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "11px" }} />
      </RadarChart>
    </ResponsiveContainer>
  );
};
