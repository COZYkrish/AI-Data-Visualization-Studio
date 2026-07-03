import * as React from "react";
import { motion } from "framer-motion";
import {
  Upload,
  CheckCircle2,
  XCircle,
  Zap,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import { SectionWrapper } from "./shared/SectionWrapper";
import {
  GeometricTriangle,
  GeometricPill,
  GeometricDotGrid,
  GeometricCircle,
  GeometricStar,
} from "./shared/GeometricDecorations";

// ─── Sticker badge ────────────────────────────────────────────────────────────
const Sticker: React.FC<{
  label: string;
  color: string;
  bg: string;
  delay?: number;
}> = ({ label, color, bg, delay = 0 }) => (
  <motion.span
    className="sticker-badge font-outfit"
    style={{
      color,
      borderColor: color,
      backgroundColor: bg,
      boxShadow: `3px 3px 0px ${color}`,
    }}
    initial={{ scale: 0, rotate: -12 }}
    whileInView={{ scale: 1, rotate: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{
      type: "spring",
      stiffness: 400,
      damping: 15,
      delay,
    }}
    whileHover={{ rotate: -3, scale: 1.05 }}
  >
    {label}
  </motion.span>
);

// ─── Pipeline step ─────────────────────────────────────────────────────────────
const PipelineStep: React.FC<{
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  color: string;
  delay: number;
  done?: boolean;
}> = ({ icon, label, sublabel, color, delay, done = false }) => (
  <motion.div
    className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-white/60 backdrop-blur-sm"
    style={{ boxShadow: `2px 2px 0px ${color}60` }}
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}15` }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-bold font-outfit text-foreground">
        {label}
      </div>
      <div className="text-xs text-muted-foreground truncate">{sublabel}</div>
    </div>
    {done && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.3, type: "spring", stiffness: 500 }}
      >
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color }} />
      </motion.div>
    )}
  </motion.div>
);

// ─── Animated row table preview ───────────────────────────────────────────────
const DataRow: React.FC<{
  values: string[];
  isDuplicate?: boolean;
  delay: number;
}> = ({ values, isDuplicate = false, delay }) => (
  <motion.div
    className={`grid grid-cols-3 gap-2 py-1.5 px-2 rounded-lg text-xs font-mono ${
      isDuplicate
        ? "bg-landing-pink/10 border border-landing-pink/30"
        : "bg-white/60 border border-white/40"
    }`}
    initial={{ opacity: 0, x: 15 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.4 }}
  >
    {values.map((v, i) => (
      <span
        key={i}
        className={`truncate ${
          isDuplicate
            ? "line-through text-landing-pink/70"
            : "text-foreground/70"
        }`}
      >
        {v}
      </span>
    ))}
    {isDuplicate && (
      <div className="col-span-3 flex items-center gap-1 text-landing-pink text-[10px] font-jakarta">
        <XCircle className="w-3 h-3" /> Duplicate removed
      </div>
    )}
  </motion.div>
);

// ─── Animated progress ring ───────────────────────────────────────────────────
const ProgressRing: React.FC<{ progress: number; color: string }> = ({
  progress,
  color,
}) => {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference * (1 - progress / 100);

  return (
    <svg
      width="88"
      height="88"
      viewBox="0 0 88 88"
      className="-rotate-90"
      aria-hidden="true"
    >
      <circle
        cx="44"
        cy="44"
        r="36"
        stroke="#E8E8E0"
        strokeWidth="6"
        fill="none"
      />
      <motion.circle
        cx="44"
        cy="44"
        r="36"
        stroke={color}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        whileInView={{ strokeDashoffset: offset }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }}
      />
    </svg>
  );
};

// ─── Upload Scene ─────────────────────────────────────────────────────────────
export const UploadScene: React.FC = () => {
  return (
    <section
      className="relative py-24 md:py-32 landing-bg-warm overflow-hidden"
      id="upload"
      aria-label="Upload and data cleaning section"
    >
      {/* Geometric decorations */}
      <div className="absolute top-16 right-8 pointer-events-none opacity-70">
        <GeometricTriangle
          size={70}
          color="#F43F5E"
          opacity={0.5}
          float
          floatIndex={1}
        />
      </div>
      <div className="absolute bottom-20 left-16 pointer-events-none">
        <GeometricPill
          width={100}
          height={36}
          color="#10B981"
          opacity={0.4}
          float
          floatIndex={3}
        />
      </div>
      <div className="absolute top-1/2 left-4 pointer-events-none opacity-40">
        <GeometricDotGrid cols={5} rows={6} color="#7C3AED" opacity={0.2} />
      </div>
      <div className="absolute bottom-16 right-1/3 pointer-events-none">
        <GeometricStar
          size={28}
          color="#FBBF24"
          opacity={0.6}
          float
          floatIndex={4}
        />
      </div>
      <div className="absolute top-24 left-1/3 pointer-events-none">
        <GeometricCircle
          size={80}
          color="#06B6D4"
          opacity={0.12}
          float
          floatIndex={2}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <SectionWrapper className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-landing-emerald/10 border border-landing-emerald/30 text-sm font-medium text-landing-emerald mb-5 font-jakarta">
            <Zap className="w-3.5 h-3.5" /> Zero-config upload
          </div>
          <h2 className="font-outfit text-4xl md:text-5xl font-black tracking-tight mb-5">
            Drop It. We Handle{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #10B981, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Everything.
            </span>
          </h2>
          <p className="text-foreground/60 text-lg max-w-2xl mx-auto font-jakarta leading-relaxed">
            Drag in any file — messy, incomplete, full of duplicates. Our AI
            pipeline automatically parses, validates, and cleans your data
            before you even click a single button.
          </p>
        </SectionWrapper>

        {/* Sticker badges */}
        <SectionWrapper
          className="flex flex-wrap justify-center gap-3 mb-16"
          delay={0.15}
        >
          <Sticker label="📄 CSV" color="#10B981" bg="#10B98115" delay={0} />
          <Sticker
            label="📊 XLSX"
            color="#7C3AED"
            bg="#7C3AED15"
            delay={0.06}
          />
          <Sticker
            label="{ } JSON"
            color="#F43F5E"
            bg="#F43F5E15"
            delay={0.12}
          />
          <Sticker
            label="⚡ Auto-Clean"
            color="#FBBF24"
            bg="#FBBF2415"
            delay={0.18}
          />
          <Sticker
            label="✅ Validated"
            color="#06B6D4"
            bg="#06B6D415"
            delay={0.24}
          />
          <Sticker
            label="🔒 Encrypted"
            color="#F97316"
            bg="#F9731615"
            delay={0.3}
          />
        </SectionWrapper>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left — Upload card mockup */}
          <SectionWrapper direction="left">
            <motion.div
              className="relative rounded-3xl bg-white border-2 border-dashed border-landing-violet/40 p-10 flex flex-col items-center justify-center gap-6 min-h-[340px] overflow-hidden"
              style={{ boxShadow: "6px 6px 0px #7C3AED" }}
              whileHover={{ boxShadow: "8px 8px 0px #7C3AED" }}
              transition={{ duration: 0.2 }}
            >
              {/* Animated dashed border */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                <svg
                  className="absolute inset-0 w-full h-full"
                  style={{ filter: "drop-shadow(0 0 4px #7C3AED50)" }}
                  aria-hidden="true"
                >
                  <rect
                    x="2"
                    y="2"
                    width="calc(100% - 4px)"
                    height="calc(100% - 4px)"
                    rx="22"
                    ry="22"
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="1.5"
                    strokeDasharray="12 6"
                    strokeOpacity="0.4"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="18"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </rect>
                </svg>
              </div>

              {/* Upload icon */}
              <motion.div
                className="w-20 h-20 rounded-2xl bg-landing-violet/10 flex items-center justify-center border-2 border-landing-violet/20"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Upload className="w-9 h-9 text-landing-violet" />
              </motion.div>

              <div className="text-center">
                <p className="font-outfit font-bold text-lg text-foreground mb-1">
                  Drag & drop your dataset
                </p>
                <p className="text-sm text-foreground/50 font-jakarta">
                  CSV, XLSX, JSON — up to 500 MB free
                </p>
              </div>

              <div className="flex items-center gap-3 w-full max-w-xs">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground font-medium">
                  or
                </span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              <motion.button
                className="px-6 py-2.5 rounded-xl bg-landing-violet text-white font-outfit font-semibold text-sm shadow-hard-violet hover:shadow-none transition-all duration-200"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                Browse Files
              </motion.button>

              {/* Background decorative numbers */}
              <div className="absolute -bottom-4 -right-4 text-[120px] font-black font-outfit text-landing-violet/5 select-none">
                CSV
              </div>
            </motion.div>
          </SectionWrapper>

          {/* Right — Pipeline + data preview */}
          <SectionWrapper direction="right" delay={0.1}>
            <div className="flex flex-col gap-5">
              {/* Pipeline steps */}
              <div className="flex flex-col gap-2.5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-outfit mb-1">
                  Processing pipeline
                </p>
                <PipelineStep
                  icon={
                    <FileCheck
                      className="w-5 h-5"
                      style={{ color: "#10B981" }}
                    />
                  }
                  label="File Parsed"
                  sublabel="12,480 rows · 8 columns detected"
                  color="#10B981"
                  delay={0.1}
                  done
                />
                <div className="pl-5 py-0.5">
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 rotate-90" />
                </div>
                <PipelineStep
                  icon={
                    <Zap className="w-5 h-5" style={{ color: "#7C3AED" }} />
                  }
                  label="Types Inferred"
                  sublabel="date, string, float, integer"
                  color="#7C3AED"
                  delay={0.25}
                  done
                />
                <div className="pl-5 py-0.5">
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 rotate-90" />
                </div>
                <PipelineStep
                  icon={
                    <XCircle className="w-5 h-5" style={{ color: "#F43F5E" }} />
                  }
                  label="Duplicates Removed"
                  sublabel="247 rows cleaned"
                  color="#F43F5E"
                  delay={0.4}
                  done
                />
                <div className="pl-5 py-0.5">
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 rotate-90" />
                </div>
                <PipelineStep
                  icon={
                    <CheckCircle2
                      className="w-5 h-5"
                      style={{ color: "#06B6D4" }}
                    />
                  }
                  label="Dataset Ready"
                  sublabel="12,233 clean rows ready to analyze"
                  color="#06B6D4"
                  delay={0.55}
                  done
                />
              </div>

              {/* Data preview rows */}
              <div className="rounded-2xl bg-landing-bg border border-landing-border p-4 flex flex-col gap-1.5">
                <div className="grid grid-cols-3 gap-2 py-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-outfit">
                  <span>Customer</span>
                  <span>Revenue</span>
                  <span>Region</span>
                </div>
                <DataRow
                  values={["Acme Corp", "$48,200", "North"]}
                  delay={0.5}
                />
                <DataRow
                  values={["Globex Inc", "$31,500", "East"]}
                  delay={0.6}
                  isDuplicate
                />
                <DataRow values={["Initech", "$22,800", "West"]} delay={0.7} />
                <DataRow
                  values={["Globex Inc", "$31,500", "East"]}
                  delay={0.75}
                  isDuplicate
                />
                <DataRow
                  values={["Umbrella Co", "$67,100", "South"]}
                  delay={0.8}
                />
              </div>

              {/* Progress ring */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 border border-white/60 backdrop-blur-sm">
                <ProgressRing progress={98} color="#10B981" />
                <div>
                  <div className="font-outfit font-black text-2xl text-foreground">
                    98%
                  </div>
                  <div className="text-sm font-medium text-foreground/70">
                    Data quality score
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Excellent — ready for analysis
                  </div>
                </div>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </div>
    </section>
  );
};
