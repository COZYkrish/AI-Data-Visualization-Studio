import * as React from "react";
import { motion } from "framer-motion";
import { Cpu, GitBranch, Clock, AlertTriangle, Layers } from "lucide-react";
import {
  SectionWrapper,
  StaggerContainer,
  StaggerItem,
} from "./shared/SectionWrapper";
import {
  GeometricStar,
  GeometricCircle,
  GeometricCross,
  GeometricDotGrid,
} from "./shared/GeometricDecorations";

// ─── AI Model badge ────────────────────────────────────────────────────────────
const ModelBadge: React.FC<{
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  color: string;
  delay: number;
  x: string;
  y: string;
}> = ({ icon, label, sublabel, color, delay, x, y }) => (
  <motion.div
    className="absolute flex items-center gap-2.5 px-3 py-2 rounded-xl backdrop-blur-sm border"
    style={{
      left: x,
      top: y,
      background: `${color}10`,
      borderColor: `${color}30`,
      boxShadow: `3px 3px 0px ${color}60`,
    }}
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{
      delay,
      type: "spring",
      stiffness: 300,
      damping: 20,
    }}
    animate={{ y: [0, -6, 0] }}
  >
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}20` }}
    >
      {icon}
    </div>
    <div>
      <div className="text-xs font-bold font-outfit" style={{ color }}>
        {label}
      </div>
      <div className="text-[9px] text-white/40 font-jakarta">{sublabel}</div>
    </div>
  </motion.div>
);

// ─── Forecast SVG chart ────────────────────────────────────────────────────────
const ForecastChart: React.FC = () => {
  const historicalPath =
    "M 20 110 C 40 105, 55 90, 75 85 S 110 75, 130 70 S 165 58, 185 55 S 210 48, 230 45";
  const forecastPath = "M 230 45 C 245 42, 260 38, 275 34 S 305 25, 320 20";
  const confidencePath =
    "M 230 45 C 245 50, 260 48, 275 46 S 305 42, 320 40 L 320 5 C 305 9, 285 13, 270 16 S 250 22, 240 26 Z";

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 340 130"
        className="w-full"
        fill="none"
        aria-label="Forecast chart"
      >
        {/* Grid lines */}
        {[30, 55, 80, 105].map((y) => (
          <line
            key={y}
            x1="10"
            y1={y}
            x2="330"
            y2={y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Confidence band */}
        <motion.path
          d={confidencePath}
          fill="rgba(124,58,237,0.15)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2, duration: 0.5 }}
        />

        {/* Divider — "now" line */}
        <motion.line
          x1="230"
          y1="10"
          x2="230"
          y2="125"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        />
        <motion.text
          x="233"
          y="18"
          className="text-[9px]"
          fill="rgba(255,255,255,0.35)"
          fontSize="9"
          fontFamily="Outfit"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 }}
        >
          TODAY
        </motion.text>

        {/* Historical line */}
        <motion.path
          d={historicalPath}
          stroke="#A78BFA"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="600"
          initial={{ strokeDashoffset: 600 }}
          whileInView={{ strokeDashoffset: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.1 }}
        />

        {/* Forecast line — glowing violet */}
        <motion.path
          d={forecastPath}
          stroke="#7C3AED"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="200"
          style={{ filter: "drop-shadow(0 0 6px #7C3AED)" }}
          initial={{ strokeDashoffset: 200 }}
          whileInView={{ strokeDashoffset: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 1.2 }}
        />

        {/* Dots on historical */}
        {[
          [75, 85],
          [130, 70],
          [185, 55],
          [230, 45],
        ].map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r="4"
            fill="#A78BFA"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.4 + i * 0.2,
              type: "spring",
              stiffness: 600,
            }}
          />
        ))}

        {/* Forecast end dot — glowing */}
        <motion.circle
          cx="320"
          cy="20"
          r="5"
          fill="#7C3AED"
          style={{ filter: "drop-shadow(0 0 8px #7C3AED)" }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.8, type: "spring", stiffness: 400 }}
        />

        {/* Labels */}
        <motion.text
          x="320"
          y="14"
          fill="#A78BFA"
          fontSize="8"
          fontFamily="Outfit"
          fontWeight="700"
          textAnchor="end"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 2 }}
        >
          +34%
        </motion.text>
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-2 text-xs font-jakarta">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-landing-violet-light rounded" />
          <span className="text-white/40">Historical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-4 h-0.5 bg-landing-violet rounded"
            style={{ filter: "drop-shadow(0 0 4px #7C3AED)" }}
          />
          <span className="text-white/40">AI Forecast</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded bg-landing-violet/20" />
          <span className="text-white/40">Confidence Band</span>
        </div>
      </div>
    </div>
  );
};

// ─── Pulsing connection line ──────────────────────────────────────────────────
const ConnectionLine: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      aria-hidden="true"
    >
      <line
        x1="50%"
        y1="20%"
        x2="50%"
        y2="80%"
        stroke="#7C3AED"
        strokeWidth="1"
        strokeDasharray="4 3"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="14"
          dur="1s"
          repeatCount="indefinite"
        />
      </line>
    </svg>
  </div>
);

// ─── Predict Scene ─────────────────────────────────────────────────────────────
export const PredictScene: React.FC = () => {
  const features = [
    {
      icon: <GitBranch className="w-4 h-4" style={{ color: "#A78BFA" }} />,
      label: "Regression Models",
      desc: "Linear, Ridge, LASSO",
    },
    {
      icon: <Layers className="w-4 h-4" style={{ color: "#F43F5E" }} />,
      label: "Classification",
      desc: "Random Forest, XGBoost",
    },
    {
      icon: <Clock className="w-4 h-4" style={{ color: "#FBBF24" }} />,
      label: "Time Series",
      desc: "ARIMA, Prophet",
    },
    {
      icon: <AlertTriangle className="w-4 h-4" style={{ color: "#10B981" }} />,
      label: "Anomaly Detection",
      desc: "Isolation Forest",
    },
  ];

  return (
    <section
      className="relative py-24 md:py-32 overflow-hidden"
      id="predict"
      style={{ backgroundColor: "#0B0A12" }}
      aria-label="Predictive modeling section"
    >
      {/* Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-landing-violet/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-landing-yellow/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorations */}
      <div className="absolute top-20 left-8 pointer-events-none">
        <GeometricStar
          size={40}
          color="#FBBF24"
          opacity={0.4}
          float
          floatIndex={2}
        />
      </div>
      <div className="absolute top-24 right-16 pointer-events-none opacity-30">
        <GeometricCircle
          size={200}
          color="#7C3AED"
          opacity={0.1}
          float
          floatIndex={1}
        />
      </div>
      <div className="absolute bottom-20 right-12 pointer-events-none">
        <GeometricStar
          size={22}
          color="#F43F5E"
          opacity={0.5}
          float
          floatIndex={4}
        />
      </div>
      <div className="absolute bottom-16 left-20 pointer-events-none">
        <GeometricDotGrid cols={5} rows={4} color="#ffffff" opacity={0.04} />
      </div>
      <div className="absolute top-1/2 right-8 pointer-events-none">
        <GeometricCross
          size={24}
          color="#10B981"
          opacity={0.3}
          float
          floatIndex={3}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <SectionWrapper direction="left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-landing-violet/20 border border-landing-violet/30 text-sm font-medium text-landing-violet-light mb-6 font-jakarta">
              <Cpu className="w-3.5 h-3.5" /> Predictive AI Engine
            </div>
            <h2 className="font-outfit text-4xl md:text-5xl font-black tracking-tight mb-6 text-white leading-tight">
              Predict What{" "}
              <span className="text-gradient-vivid">Comes Next.</span>
            </h2>
            <p className="text-white/50 text-lg mb-8 font-jakarta leading-relaxed">
              Don't just understand your past data — forecast your future. Our
              ML engine automatically selects the best model for your dataset
              and delivers predictions with confidence intervals in seconds.
            </p>

            {/* Feature list */}
            <StaggerContainer
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              staggerDelay={0.1}
            >
              {features.map((f) => (
                <StaggerItem key={f.label}>
                  <motion.div
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 transition-colors cursor-default"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {f.icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold font-outfit text-white/90">
                        {f.label}
                      </div>
                      <div className="text-xs text-white/40 font-jakarta mt-0.5">
                        {f.desc}
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </SectionWrapper>

          {/* Right — Forecast chart + floating badges */}
          <SectionWrapper direction="right" delay={0.1}>
            <div
              className="relative rounded-3xl bg-white/5 border border-white/10 p-6"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(124,58,237,0.15), 0 30px 60px rgba(0,0,0,0.4)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Cpu className="w-4 h-4 text-landing-violet-light" />
                <span className="text-sm font-bold font-outfit text-white/70">
                  Revenue Forecast — Next 90 Days
                </span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-landing-emerald/20 text-landing-emerald font-outfit font-bold">
                  LIVE
                </span>
              </div>

              <ForecastChart />

              {/* Floating model badges */}
              <div className="relative h-28 mt-4">
                <ConnectionLine />
                <ModelBadge
                  icon={
                    <GitBranch className="w-3.5 h-3.5 text-landing-violet-light" />
                  }
                  label="XGBoost"
                  sublabel="Primary model · R² = 0.94"
                  color="#A78BFA"
                  delay={0.4}
                  x="2%"
                  y="10%"
                />
                <ModelBadge
                  icon={<Layers className="w-3.5 h-3.5 text-landing-pink" />}
                  label="Random Forest"
                  sublabel="Ensemble · R² = 0.91"
                  color="#F43F5E"
                  delay={0.55}
                  x="48%"
                  y="10%"
                />
                <ModelBadge
                  icon={
                    <AlertTriangle className="w-3.5 h-3.5 text-landing-yellow" />
                  }
                  label="3 Anomalies"
                  sublabel="Detected in Q2"
                  color="#FBBF24"
                  delay={0.7}
                  x="22%"
                  y="58%"
                />
              </div>
            </div>
          </SectionWrapper>
        </div>
      </div>
    </section>
  );
};
