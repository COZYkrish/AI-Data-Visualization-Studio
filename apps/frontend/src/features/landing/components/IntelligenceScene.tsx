import * as React from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, BarChart3, PieChart, Activity } from "lucide-react";
import {
  SectionWrapper,
  StaggerContainer,
  StaggerItem,
} from "./shared/SectionWrapper";
import { AnimatedCounter } from "./shared/AnimatedCounter";
import { GlassCard } from "./shared/GlassCard";
import {
  GeometricCircle,
  GeometricDotGrid,
  GeometricCross,
  GeometricStar,
} from "./shared/GeometricDecorations";

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  delta?: string;
  color: string;
}> = ({ value, suffix, prefix, label, delta, color }) => (
  <GlassCard dark className="p-4 flex flex-col gap-1">
    <div className="text-[11px] text-white/40 font-jakarta uppercase tracking-wider">
      {label}
    </div>
    <div className="font-outfit font-black text-2xl text-white">
      <AnimatedCounter
        value={value}
        suffix={suffix}
        prefix={prefix}
        duration={1800}
      />
    </div>
    {delta && (
      <div className="text-xs font-medium font-jakarta" style={{ color }}>
        ↑ {delta} vs last month
      </div>
    )}
  </GlassCard>
);

// ─── Animated bar chart ───────────────────────────────────────────────────────
const BARS = [
  { height: 60, color: "#7C3AED", label: "Jan" },
  { height: 85, color: "#7C3AED", label: "Feb" },
  { height: 45, color: "#7C3AED", label: "Mar" },
  { height: 95, color: "#A78BFA", label: "Apr" },
  { height: 72, color: "#7C3AED", label: "May" },
  { height: 110, color: "#F43F5E", label: "Jun" },
];

const BarChartMock: React.FC = () => (
  <div className="flex items-end justify-between gap-2 h-28 px-1">
    {BARS.map((bar, i) => (
      <div key={bar.label} className="flex flex-col items-center gap-1 flex-1">
        <motion.div
          className="w-full rounded-t-md"
          style={{ backgroundColor: bar.color + "CC" }}
          initial={{ height: 0 }}
          whileInView={{ height: bar.height * 0.85 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.1 * i,
            duration: 0.8,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
        />
        <span className="text-[9px] text-white/30 font-outfit">
          {bar.label}
        </span>
      </div>
    ))}
  </div>
);

// ─── Animated line chart (SVG) ────────────────────────────────────────────────
const LINE_POINTS = "20,70 50,55 85,65 120,30 155,45 190,20 225,35";

const LineChartMock: React.FC = () => (
  <svg viewBox="0 0 245 90" className="w-full h-20" aria-hidden="true">
    <defs>
      <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
      </linearGradient>
    </defs>
    <motion.polyline
      points={LINE_POINTS}
      fill="none"
      stroke="#10B981"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="600"
      initial={{ strokeDashoffset: 600 }}
      whileInView={{ strokeDashoffset: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
    />
    <polygon
      points={`${LINE_POINTS} 225,90 20,90`}
      fill="url(#lineGrad)"
      opacity="0.5"
    />
    {LINE_POINTS.split(" ").map((pt, i) => {
      const [x, y] = pt.split(",");
      return (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="3.5"
          fill="#10B981"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 500 }}
        />
      );
    })}
  </svg>
);

// ─── Pie chart mock (SVG) ─────────────────────────────────────────────────────
const PieChartMock: React.FC = () => {
  const segments = [
    { percent: 42, color: "#7C3AED", label: "North" },
    { percent: 28, color: "#F43F5E", label: "East" },
    { percent: 18, color: "#FBBF24", label: "South" },
    { percent: 12, color: "#10B981", label: "West" },
  ];

  let offset = 0;
  const circumference = 2 * Math.PI * 30;

  return (
    <div className="flex items-center gap-4">
      <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
        {segments.map((seg, i) => {
          const dash = (seg.percent / 100) * circumference;
          const gap = circumference - dash;
          const rotation = (offset / 100) * 360 - 90;
          offset += seg.percent;
          return (
            <motion.circle
              key={i}
              cx="40"
              cy="40"
              r="30"
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${gap}`}
              transform={`rotate(${rotation} 40 40)`}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              whileInView={{ strokeDasharray: `${dash} ${gap}` }}
              viewport={{ once: true }}
              transition={{
                delay: 0.2 + i * 0.2,
                duration: 0.8,
                ease: "easeOut",
              }}
            />
          );
        })}
      </svg>
      <div className="flex flex-col gap-1">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="flex items-center gap-1.5 text-[10px] text-white/50"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: seg.color }}
            />
            {seg.label} ({seg.percent}%)
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Heatmap cell ──────────────────────────────────────────────────────────────
const HeatmapCell: React.FC<{ value: number; delay: number }> = ({
  value,
  delay,
}) => {
  const alpha = Math.abs(value).toFixed(2);
  const color =
    value > 0.5
      ? `rgba(124,58,237,${alpha})`
      : value < -0.3
        ? `rgba(244,63,94,${alpha})`
        : `rgba(107,114,128,${Math.abs(value) * 0.4 + 0.1})`;

  return (
    <motion.div
      className="w-7 h-7 rounded flex items-center justify-center text-[8px] font-mono text-white/70"
      style={{ background: color }}
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
      title={`${value}`}
    >
      {value.toFixed(1)}
    </motion.div>
  );
};

const HEATMAP = [
  [1.0, 0.72, -0.31, 0.55],
  [0.72, 1.0, 0.18, 0.62],
  [-0.31, 0.18, 1.0, -0.44],
  [0.55, 0.62, -0.44, 1.0],
];

const LABELS = ["Rev", "Units", "Cost", "Profit"];

// ─── Intelligence Scene ───────────────────────────────────────────────────────
export const IntelligenceScene: React.FC = () => {
  return (
    <section
      className="relative py-24 md:py-32 overflow-hidden"
      id="features"
      style={{ backgroundColor: "#0B0A12" }}
      aria-label="Intelligence and analytics section"
    >
      {/* Background glow blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-landing-violet/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-landing-pink/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Geometric decorations */}
      <div className="absolute top-20 right-12 pointer-events-none opacity-40">
        <GeometricCircle
          size={160}
          color="#7C3AED"
          opacity={0.15}
          float
          floatIndex={0}
        />
      </div>
      <div className="absolute bottom-20 left-8 pointer-events-none">
        <GeometricDotGrid cols={6} rows={5} color="#ffffff" opacity={0.05} />
      </div>
      <div className="absolute top-1/3 right-6 pointer-events-none">
        <GeometricCross
          size={26}
          color="#10B981"
          opacity={0.4}
          float
          floatIndex={3}
        />
      </div>
      <div className="absolute top-16 left-16 pointer-events-none">
        <GeometricStar
          size={24}
          color="#FBBF24"
          opacity={0.5}
          float
          floatIndex={5}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <SectionWrapper className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-landing-violet/20 border border-landing-violet/30 text-sm font-medium text-landing-violet-light mb-5 font-jakarta">
            <Brain className="w-3.5 h-3.5" /> Intelligence Awakens
          </div>
          <h2 className="font-outfit text-4xl md:text-5xl font-black tracking-tight mb-5 text-white">
            Data Transforms Into{" "}
            <span className="text-gradient-vivid">Intelligence.</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto font-jakarta leading-relaxed">
            The moment your data is clean, our AI engine kicks in — detecting
            patterns, correlations, and anomalies you'd take weeks to find
            manually.
          </p>
        </SectionWrapper>

        {/* Dashboard mockup */}
        <SectionWrapper delay={0.1}>
          <motion.div
            className="relative rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 overflow-hidden"
            style={{
              boxShadow:
                "0 0 0 1px rgba(124,58,237,0.2), 0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,58,237,0.1)",
            }}
          >
            {/* Dashboard header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-outfit font-bold text-white text-lg">
                  sales_data.csv — Analysis Report
                </div>
                <div className="text-xs text-white/40 font-jakarta mt-0.5">
                  12,233 rows · Last updated just now
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-landing-pink" />
                <div className="w-2.5 h-2.5 rounded-full bg-landing-yellow" />
                <div className="w-2.5 h-2.5 rounded-full bg-landing-emerald" />
              </div>
            </div>

            {/* KPI row */}
            <StaggerContainer
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
              staggerDelay={0.08}
            >
              <StaggerItem>
                <KpiCard
                  value={2.4}
                  suffix="M"
                  prefix="$"
                  label="Total Revenue"
                  delta="12.4%"
                  color="#10B981"
                />
              </StaggerItem>
              <StaggerItem>
                <KpiCard
                  value={12233}
                  label="Records Analyzed"
                  delta="847"
                  color="#A78BFA"
                />
              </StaggerItem>
              <StaggerItem>
                <KpiCard
                  value={98}
                  suffix="%"
                  label="Data Quality"
                  color="#FBBF24"
                />
              </StaggerItem>
              <StaggerItem>
                <KpiCard
                  value={47}
                  label="Anomalies Detected"
                  color="#F43F5E"
                />
              </StaggerItem>
            </StaggerContainer>

            {/* Charts row */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Bar chart */}
              <GlassCard dark className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-landing-violet-light" />
                  <span className="text-xs font-bold font-outfit text-white/70">
                    Monthly Revenue
                  </span>
                </div>
                <BarChartMock />
              </GlassCard>

              {/* Line chart */}
              <GlassCard dark className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-landing-emerald" />
                  <span className="text-xs font-bold font-outfit text-white/70">
                    Growth Trend
                  </span>
                </div>
                <LineChartMock />
              </GlassCard>

              {/* Pie chart */}
              <GlassCard dark className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <PieChart className="w-4 h-4 text-landing-yellow" />
                  <span className="text-xs font-bold font-outfit text-white/70">
                    Revenue by Region
                  </span>
                </div>
                <PieChartMock />
              </GlassCard>
            </div>

            {/* Correlation heatmap */}
            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-white/40" />
                <span className="text-xs font-bold font-outfit text-white/50">
                  Correlation Matrix
                </span>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 pt-7">
                  {LABELS.map((l) => (
                    <div
                      key={l}
                      className="h-7 flex items-center text-[9px] text-white/30 font-outfit w-8"
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-1 mb-1">
                    {LABELS.map((l) => (
                      <div
                        key={l}
                        className="w-7 text-center text-[9px] text-white/30 font-outfit"
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1">
                    {HEATMAP.map((row, ri) => (
                      <div key={ri} className="flex gap-1">
                        {row.map((val, ci) => (
                          <HeatmapCell
                            key={ci}
                            value={val}
                            delay={0.05 * (ri * 4 + ci)}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </SectionWrapper>
      </div>
    </section>
  );
};
