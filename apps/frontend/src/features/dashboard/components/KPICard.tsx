/**
 * KPICard — Animated KPI metric card for the dashboard
 */
import * as React from "react";
import { motion } from "framer-motion";
import {
  Hash,
  Tag,
  Calendar,
  AlertTriangle,
  Copy,
  Cpu,
  Shield,
  Rows,
  Columns,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { KPICard as KPICardType } from "../types";

const ICON_MAP: Record<string, React.ElementType> = {
  rows: Rows,
  columns: Columns,
  hash: Hash,
  tag: Tag,
  calendar: Calendar,
  alert: AlertTriangle,
  copy: Copy,
  cpu: Cpu,
  shield: Shield,
};

const COLOR_MAP: Record<string, string> = {
  blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
  violet:
    "from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-400",
  emerald:
    "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
  amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
  cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400",
  red: "from-red-500/20 to-red-600/10 border-red-500/30 text-red-400",
  orange:
    "from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400",
  slate: "from-slate-500/20 to-slate-600/10 border-slate-500/30 text-slate-400",
  green: "from-green-500/20 to-green-600/10 border-green-500/30 text-green-400",
};

interface Props {
  kpi: KPICardType;
  index: number;
}

export const KPICard: React.FC<Props> = ({ kpi, index }) => {
  const IconComponent = ICON_MAP[kpi.icon ?? "hash"] ?? Hash;
  const colorClass = COLOR_MAP[kpi.color ?? "violet"] ?? COLOR_MAP.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colorClass} p-5 shadow-sm hover:shadow-md transition-shadow duration-200`}
      role="article"
      aria-label={kpi.label}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70 truncate">
            {kpi.label}
          </p>
          <div className="mt-2 flex items-end gap-1.5">
            <span className="text-3xl font-extrabold tabular-nums leading-none text-foreground">
              {typeof kpi.value === "number"
                ? kpi.value.toLocaleString()
                : kpi.value}
            </span>
            {kpi.unit && (
              <span className="text-xs font-medium opacity-60 pb-0.5">
                {kpi.unit}
              </span>
            )}
          </div>
          {kpi.meta && <p className="mt-1.5 text-xs opacity-60">{kpi.meta}</p>}
        </div>
        <div
          className={`ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colorClass}`}
        >
          <IconComponent className="h-5 w-5" />
        </div>
      </div>
      {/* Decorative geometric accent */}
      <div className="pointer-events-none absolute -right-4 -bottom-4 h-16 w-16 rounded-full opacity-10 bg-current" />
    </motion.div>
  );
};
