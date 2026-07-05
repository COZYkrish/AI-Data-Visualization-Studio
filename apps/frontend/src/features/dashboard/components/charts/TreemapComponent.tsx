import * as React from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import type { ChartPayload } from "../../types";

interface Props {
  payload: ChartPayload;
  height: number;
  colors: string[];
}

const CustomContent = ({
  x,
  y,
  width,
  height: h,
  name,
  value,
  index,
  colors,
}: any) => {
  if (width < 20 || h < 20) return null;
  const color = colors[index % colors.length];
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={h}
        fill={color}
        rx={4}
        stroke="var(--color-background)"
        strokeWidth={2}
        fillOpacity={0.85}
      />
      {width > 50 && h > 30 && (
        <text
          x={x + width / 2}
          y={y + h / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={Math.min(11, width / 6)}
          fontWeight={600}
        >
          {String(name).length > 12 ? String(name).slice(0, 12) + "…" : name}
        </text>
      )}
    </g>
  );
};

export const TreemapComponent: React.FC<Props> = ({
  payload,
  height,
  colors,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <Treemap
      data={payload.data as any[]}
      dataKey="value"
      nameKey="name"
      content={<CustomContent colors={colors} />}
    >
      <Tooltip
        contentStyle={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "0.5rem",
          fontSize: "12px",
        }}
        formatter={(val: any, name: any) => [val, name]}
      />
    </Treemap>
  </ResponsiveContainer>
);
