import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Download,
  Share2,
  FolderOpen,
  Trophy,
  Zap,
} from "lucide-react";
import { SectionWrapper } from "./shared/SectionWrapper";
import { AnimatedCounter } from "./shared/AnimatedCounter";
import {
  GeometricCircle,
  GeometricStar,
  GeometricDotGrid,
  GeometricPill,
  GeometricSquiggle,
} from "./shared/GeometricDecorations";

// ─── Dashboard mosaic card ────────────────────────────────────────────────────
const MosaicCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  delay: number;
}> = ({ icon, title, desc, color, delay }) => (
  <motion.div
    className="relative rounded-2xl bg-white border-2 p-5 flex flex-col gap-3 overflow-hidden group"
    style={{ borderColor: `${color}30`, boxShadow: `4px 4px 0px ${color}` }}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
    whileHover={{ y: -4, boxShadow: `6px 6px 0px ${color}` }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center"
      style={{ background: `${color}15` }}
    >
      {icon}
    </div>
    <div>
      <div className="font-outfit font-bold text-base text-foreground mb-1">
        {title}
      </div>
      <div className="text-sm text-foreground/60 font-jakarta">{desc}</div>
    </div>
    <div
      className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
      style={{ background: color }}
    />
  </motion.div>
);

// ─── Achievement badge ────────────────────────────────────────────────────────
const AchievementBadge: React.FC<{
  label: string;
  value: number;
  suffix?: string;
  color: string;
  delay: number;
}> = ({ label, value, suffix, color, delay }) => (
  <motion.div
    className="flex flex-col items-center p-4 rounded-2xl bg-white border-2"
    style={{ borderColor: `${color}30`, boxShadow: `3px 3px 0px ${color}40` }}
    initial={{ scale: 0.8, opacity: 0 }}
    whileInView={{ scale: 1, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
  >
    <div className="font-outfit font-black text-3xl" style={{ color }}>
      <AnimatedCounter value={value} suffix={suffix} duration={1800} />
    </div>
    <div className="text-xs text-foreground/60 font-jakarta text-center mt-1">
      {label}
    </div>
  </motion.div>
);

// ─── Decisions Scene ──────────────────────────────────────────────────────────
export const DecisionsScene: React.FC = () => {
  const mosaicCards = [
    {
      icon: <FolderOpen className="w-6 h-6" style={{ color: "#7C3AED" }} />,
      title: "Project Library",
      desc: "All your analyses, organized and searchable.",
      color: "#7C3AED",
      delay: 0.1,
    },
    {
      icon: <Download className="w-6 h-6" style={{ color: "#10B981" }} />,
      title: "Export Anywhere",
      desc: "PDF reports, PNG charts, raw CSV data.",
      color: "#10B981",
      delay: 0.2,
    },
    {
      icon: <Share2 className="w-6 h-6" style={{ color: "#F43F5E" }} />,
      title: "Share Dashboards",
      desc: "Public links or protected team workspaces.",
      color: "#F43F5E",
      delay: 0.3,
    },
    {
      icon: <Trophy className="w-6 h-6" style={{ color: "#FBBF24" }} />,
      title: "AI Recommendations",
      desc: "Natural language summaries of every insight.",
      color: "#FBBF24",
      delay: 0.4,
    },
    {
      icon: <Zap className="w-6 h-6" style={{ color: "#06B6D4" }} />,
      title: "Real-time Updates",
      desc: "Connect live data sources for live dashboards.",
      color: "#06B6D4",
      delay: 0.5,
    },
    {
      icon: <ArrowRight className="w-6 h-6" style={{ color: "#F97316" }} />,
      title: "API Access",
      desc: "Embed insights into your existing workflows.",
      color: "#F97316",
      delay: 0.6,
    },
  ];

  return (
    <section
      className="relative py-24 md:py-32 landing-bg-warm overflow-hidden"
      id="decisions"
      aria-label="Turn data into decisions section"
    >
      {/* Geometric decorations */}
      <div className="absolute top-12 right-12 pointer-events-none">
        <GeometricCircle size={200} color="#7C3AED" opacity={0.08} filled />
      </div>
      <div className="absolute top-20 left-8 pointer-events-none">
        <GeometricStar
          size={44}
          color="#FBBF24"
          opacity={0.5}
          float
          floatIndex={0}
        />
      </div>
      <div className="absolute bottom-16 right-8 pointer-events-none">
        <GeometricStar
          size={28}
          color="#F43F5E"
          opacity={0.4}
          float
          floatIndex={2}
        />
      </div>
      <div className="absolute bottom-24 left-12 pointer-events-none opacity-60">
        <GeometricPill
          width={90}
          height={32}
          color="#10B981"
          opacity={0.35}
          float
          floatIndex={4}
        />
      </div>
      <div className="absolute top-1/2 right-4 pointer-events-none">
        <GeometricDotGrid cols={5} rows={6} color="#7C3AED" opacity={0.12} />
      </div>
      <div className="absolute bottom-12 left-1/3 pointer-events-none">
        <GeometricSquiggle width={120} color="#7C3AED" opacity={0.2} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <SectionWrapper className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-landing-violet/10 border border-landing-violet/30 text-sm font-medium text-landing-violet mb-5 font-jakarta">
            <Trophy className="w-3.5 h-3.5" /> Full Circle
          </div>
          <h2 className="font-outfit text-4xl md:text-5xl font-black tracking-tight mb-5">
            From Raw Data To{" "}
            <span className="text-gradient-vivid">Confident Decisions.</span>
          </h2>
          <p className="text-foreground/60 text-lg max-w-2xl mx-auto font-jakarta leading-relaxed">
            Everything you need to go from chaotic spreadsheets to polished,
            shareable insights — on a platform built for teams and data
            professionals alike.
          </p>
        </SectionWrapper>

        {/* Achievement stats */}
        <SectionWrapper
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          delay={0.1}
        >
          <AchievementBadge
            value={50000}
            suffix="+"
            label="Datasets Analyzed"
            color="#7C3AED"
            delay={0.1}
          />
          <AchievementBadge
            value={2400}
            suffix="+"
            label="Teams Onboarded"
            color="#10B981"
            delay={0.2}
          />
          <AchievementBadge
            value={99.9}
            suffix="%"
            label="Platform Uptime"
            color="#FBBF24"
            delay={0.3}
          />
          <AchievementBadge
            value={60}
            suffix="s"
            label="Avg. Time to Insight"
            color="#F43F5E"
            delay={0.4}
          />
        </SectionWrapper>

        {/* Mosaic grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {mosaicCards.map((card) => (
            <MosaicCard key={card.title} {...card} />
          ))}
        </div>

        {/* Final CTA banner */}
        <SectionWrapper delay={0.1}>
          <motion.div
            className="relative rounded-3xl p-10 md:p-14 text-center overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #7C3AED 0%, #6D28D9 40%, #4C1D95 100%)",
              boxShadow:
                "8px 8px 0px #4C1D95, 0 30px 80px rgba(124,58,237,0.4)",
            }}
          >
            {/* Decoration inside CTA */}
            <div className="absolute top-4 right-8 opacity-20 pointer-events-none">
              <GeometricStar size={50} color="#FBBF24" opacity={1} />
            </div>
            <div className="absolute bottom-4 left-8 opacity-20 pointer-events-none">
              <GeometricCircle size={100} color="#FFFFFF" opacity={0.3} />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-16 opacity-10 pointer-events-none hidden md:block">
              <GeometricDotGrid
                cols={8}
                rows={4}
                color="#ffffff"
                opacity={0.4}
                gap={18}
              />
            </div>

            <div className="relative z-10">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-sm font-medium text-white/80 mb-6 font-jakarta"
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                🚀 No credit card required
              </motion.div>
              <motion.h3
                className="font-outfit text-3xl md:text-4xl font-black text-white mb-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Ready to Read Your Data&apos;s Story?
              </motion.h3>
              <motion.p
                className="text-white/70 text-lg mb-8 max-w-xl mx-auto font-jakarta"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                Join 2,400+ teams turning raw spreadsheets into confident
                strategic decisions every day.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <Link to="/register" id="decisions-cta-primary">
                  <motion.button
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-landing-violet font-outfit font-black text-base shadow-lg group hover:bg-landing-yellow hover:text-foreground transition-all duration-200"
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Start Free →
                  </motion.button>
                </Link>
                <a href="#docs" id="decisions-cta-docs">
                  <motion.button
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-white/30 text-white font-medium text-base hover:border-white/60 hover:bg-white/10 transition-all duration-200"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    View Documentation
                  </motion.button>
                </a>
              </motion.div>
            </div>
          </motion.div>
        </SectionWrapper>
      </div>
    </section>
  );
};
