import * as React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartPayload } from "../../types";

interface Props {
  payload: ChartPayload;
  height: number;
  colors: string[];
}

export const BubbleChartComponent: React.FC<Props> = ({
  payload,
  height,
  colors,
}) => {
  const sizeKey = payload.size_key ?? payload.y_key ?? "value";
  const data = payload.data as any[];
  const sizeVals = data.map((d) => Number(d[sizeKey]) || 0).filter(Boolean);
  const minS = Math.min(...sizeVals);
  const maxS = Math.max(...sizeVals);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
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
            offset: -15,
            fontSize: 11,
          }}
        />
        <YAxis
          dataKey={payload.y_key}
          name={payload.y_label}
          type="number"
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <ZAxis
          dataKey={sizeKey}
          range={[40, 400]}
          domain={[minS, maxS]}
          name={sizeKey}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
            fontSize: "12px",
          }}
        />
        <Scatter data={data} fill={colors[0]} fillOpacity={0.6} />
      </ScatterChart>
    </ResponsiveContainer>
  );
};
