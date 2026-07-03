import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, FileText, Table, Braces } from "lucide-react";
import { FloatingParticles } from "./shared/FloatingParticles";
import {
  GeometricCircle,
  GeometricStar,
  GeometricDotGrid,
  GeometricSquiggle,
  GeometricCross,
} from "./shared/GeometricDecorations";

// ─── Floating file card component ────────────────────────────────────────────
const FileCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  rows: string;
  color: string;
  delay: number;
  initialRotate: number;
  x: string;
  y: string;
}> = ({ icon, label, rows, color, delay, initialRotate, x, y }) => (
  <motion.div
    className="absolute glass-panel rounded-xl p-3 flex items-center gap-3 min-w-[160px] cursor-default select-none"
    style={{
      left: x,
      top: y,
      border: `2px solid ${color}40`,
      boxShadow: `3px 3px 0px ${color}`,
    }}
    initial={{ opacity: 0, scale: 0.7, rotate: initialRotate + 10 }}
    animate={{
      opacity: 1,
      scale: 1,
      rotate: initialRotate,
      y: [0, -10, 0],
    }}
    transition={{
      opacity: { duration: 0.5, delay },
      scale: { duration: 0.5, delay },
      rotate: { duration: 0.5, delay },
      y: { duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay },
    }}
  >
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}20` }}
    >
      {icon}
    </div>
    <div>
      <div className="text-xs font-bold font-outfit" style={{ color }}>
        {label}
      </div>
      <div className="text-[10px] text-muted-foreground">{rows}</div>
    </div>
  </motion.div>
);

// ─── Stats pill ──────────────────────────────────────────────────────────────
const StatPill: React.FC<{
  value: string;
  label: string;
  color: string;
  delay: number;
}> = ({ value, label, color, delay }) => (
  <motion.div
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
    style={{
      background: `${color}15`,
      border: `1.5px solid ${color}40`,
    }}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <span className="font-bold font-outfit text-base" style={{ color }}>
      {value}
    </span>
    <span className="text-foreground/60 text-xs">{label}</span>
  </motion.div>
);

// ─── Hero Scene ──────────────────────────────────────────────────────────────
export const HeroScene: React.FC = () => {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden landing-bg-warm dot-grid"
      id="hero"
      aria-label="Hero section"
    >
      {/* Floating particles */}
      <FloatingParticles count={35} />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-landing-violet/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-landing-pink/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Geometric decorations */}
      <div className="absolute top-24 left-12 opacity-60 pointer-events-none">
        <GeometricCircle
          size={180}
          color="#7C3AED"
          opacity={0.12}
          filled
          float
          floatIndex={0}
        />
      </div>
      <div className="absolute top-16 right-20 pointer-events-none">
        <GeometricStar
          size={36}
          color="#FBBF24"
          opacity={0.7}
          float
          floatIndex={2}
        />
      </div>
      <div className="absolute bottom-32 right-16 pointer-events-none">
        <GeometricStar
          size={22}
          color="#F43F5E"
          opacity={0.6}
          float
          floatIndex={3}
        />
      </div>
      <div className="absolute top-1/3 left-8 pointer-events-none">
        <GeometricDotGrid cols={6} rows={5} color="#7C3AED" opacity={0.18} />
      </div>
      <div className="absolute bottom-24 left-1/4 pointer-events-none">
        <GeometricSquiggle width={140} color="#F43F5E" opacity={0.25} />
      </div>
      <div className="absolute top-1/2 right-8 pointer-events-none hidden lg:block">
        <GeometricCross
          size={28}
          color="#10B981"
          opacity={0.5}
          float
          floatIndex={5}
        />
      </div>
      <div className="absolute bottom-40 right-1/4 pointer-events-none">
        <GeometricCircle
          size={60}
          color="#FBBF24"
          opacity={0.5}
          float
          floatIndex={1}
        />
      </div>

      {/* Floating file cards — hidden on small screens */}
      <div className="hidden lg:block">
        <FileCard
          icon={<FileText className="w-4 h-4" style={{ color: "#10B981" }} />}
          label="sales_data.csv"
          rows="12,480 rows"
          color="#10B981"
          delay={0.8}
          initialRotate={-8}
          x="3%"
          y="22%"
        />
        <FileCard
          icon={<Table className="w-4 h-4" style={{ color: "#7C3AED" }} />}
          label="financials.xlsx"
          rows="3,220 rows"
          color="#7C3AED"
          delay={1.1}
          initialRotate={6}
          x="4%"
          y="58%"
        />
        <FileCard
          icon={<Braces className="w-4 h-4" style={{ color: "#F43F5E" }} />}
          label="events.json"
          rows="89,400 rows"
          color="#F43F5E"
          delay={1.4}
          initialRotate={-4}
          x="73%"
          y="20%"
        />
        <FileCard
          icon={<FileText className="w-4 h-4" style={{ color: "#FBBF24" }} />}
          label="customers.csv"
          rows="5,110 rows"
          color="#FBBF24"
          delay={1.6}
          initialRotate={8}
          x="72%"
          y="62%"
        />
      </div>

      {/* Center content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-24 pb-16">
        {/* Launch badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-landing-violet/10 border border-landing-violet/30 text-sm font-medium text-landing-violet mb-8 font-jakarta"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="w-2 h-2 rounded-full bg-landing-violet animate-pulse-glow" />
          AI-Powered Data Intelligence Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-outfit text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.35,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
        >
          Your Data Has a <br className="hidden md:block" />
          <span className="text-gradient-vivid">Story.</span>
          <br />
          <span className="text-foreground/90">Let&apos;s Read It.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto mb-10 font-jakarta leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Upload any CSV, Excel, or JSON file. Watch as AI automatically cleans
          your data, discovers hidden patterns, and generates stunning
          interactive dashboards — in under 60 seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          <Link to="/register" id="hero-cta-primary">
            <motion.button
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-landing-violet text-white font-outfit font-bold text-base shadow-hard-lg-violet hover:shadow-none transition-all duration-200 group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              Upload Your Dataset Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </Link>
          <a href="#demo" id="hero-cta-demo">
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-foreground/15 text-foreground/70 font-medium text-base hover:border-foreground/30 hover:text-foreground transition-all duration-200 bg-white/50 backdrop-blur-sm"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <PlayCircle className="w-5 h-5 text-landing-pink" />
              Watch 2-min Demo
            </motion.button>
          </a>
        </motion.div>

        {/* Social proof stats */}
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <StatPill
            value="50K+"
            label="datasets analyzed"
            color="#7C3AED"
            delay={0.9}
          />
          <StatPill value="99.9%" label="uptime" color="#10B981" delay={1.0} />
          <StatPill
            value="< 60s"
            label="from upload to insight"
            color="#F43F5E"
            delay={1.1}
          />
          <StatPill
            value="SOC 2"
            label="compliant"
            color="#FBBF24"
            delay={1.2}
          />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground/30 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="font-medium tracking-widest uppercase text-[10px]">
          Scroll to explore
        </span>
        <motion.div
          className="w-5 h-8 rounded-full border-2 border-foreground/20 flex items-start justify-center pt-1.5"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-1 h-2 rounded-full bg-foreground/40" />
        </motion.div>
      </motion.div>
    </section>
  );
};
