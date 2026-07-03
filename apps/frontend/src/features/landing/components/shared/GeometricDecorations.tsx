import * as React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

// ─── Floating animation preset ──────────────────────────────────────────────
const floatVariants: Variants = {
  animate: (custom: number) => ({
    y: [0, -10 - custom * 3, 0],
    rotate: [0, custom % 2 === 0 ? 3 : -3, 0],
    transition: {
      duration: 5 + custom * 0.7,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  }),
};

// ─── Large Circle ────────────────────────────────────────────────────────────
interface CircleProps {
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
  filled?: boolean;
  float?: boolean;
  floatIndex?: number;
}

export const GeometricCircle: React.FC<CircleProps> = ({
  size = 120,
  color = "#7C3AED",
  opacity = 0.15,
  className = "",
  filled = false,
  float = false,
  floatIndex = 0,
}) => {
  const base = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {filled ? (
        <circle cx="50" cy="50" r="48" fill={color} fillOpacity={opacity} />
      ) : (
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke={color}
          strokeWidth="3"
          strokeOpacity={opacity}
          strokeDasharray="8 4"
        />
      )}
    </svg>
  );

  if (float) {
    return (
      <motion.div
        custom={floatIndex}
        variants={floatVariants}
        animate="animate"
        className="pointer-events-none"
      >
        {base}
      </motion.div>
    );
  }
  return base;
};

// ─── Triangle ────────────────────────────────────────────────────────────────
interface TriangleProps {
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
  float?: boolean;
  floatIndex?: number;
}

export const GeometricTriangle: React.FC<TriangleProps> = ({
  size = 80,
  color = "#F43F5E",
  opacity = 0.6,
  className = "",
  float = false,
  floatIndex = 1,
}) => {
  const base = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <polygon
        points="50,8 95,90 5,90"
        fill={color}
        fillOpacity={opacity}
        stroke={color}
        strokeWidth="2"
        strokeOpacity={opacity}
        strokeLinejoin="round"
      />
    </svg>
  );

  if (float) {
    return (
      <motion.div
        custom={floatIndex}
        variants={floatVariants}
        animate="animate"
        className="pointer-events-none"
      >
        {base}
      </motion.div>
    );
  }
  return base;
};

// ─── Star / Sparkle ──────────────────────────────────────────────────────────
interface StarProps {
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
  float?: boolean;
  floatIndex?: number;
}

export const GeometricStar: React.FC<StarProps> = ({
  size = 40,
  color = "#FBBF24",
  opacity = 0.8,
  className = "",
  float = true,
  floatIndex = 2,
}) => {
  const base = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      fillOpacity={opacity}
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
    </svg>
  );

  if (float) {
    return (
      <motion.div
        custom={floatIndex}
        variants={floatVariants}
        animate="animate"
        className="pointer-events-none"
      >
        {base}
      </motion.div>
    );
  }
  return base;
};

// ─── Squiggle / Wave Line ────────────────────────────────────────────────────
interface SquiggleProps {
  width?: number;
  color?: string;
  opacity?: number;
  className?: string;
}

export const GeometricSquiggle: React.FC<SquiggleProps> = ({
  width = 160,
  color = "#7C3AED",
  opacity = 0.3,
  className = "",
}) => (
  <svg
    width={width}
    height={24}
    viewBox={`0 0 ${width} 24`}
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path
      d={`M0 12 C${width * 0.1} 4, ${width * 0.2} 20, ${width * 0.3} 12 S${width * 0.5} 4, ${width * 0.6} 12 S${width * 0.8} 20, ${width} 12`}
      stroke={color}
      strokeWidth="2.5"
      strokeOpacity={opacity}
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// ─── Dot Grid ────────────────────────────────────────────────────────────────
interface DotGridProps {
  cols?: number;
  rows?: number;
  color?: string;
  opacity?: number;
  gap?: number;
  className?: string;
}

export const GeometricDotGrid: React.FC<DotGridProps> = ({
  cols = 8,
  rows = 5,
  color = "#7C3AED",
  opacity = 0.2,
  gap = 20,
  className = "",
}) => {
  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(
        <circle
          key={`${r}-${c}`}
          cx={c * gap + 4}
          cy={r * gap + 4}
          r="2"
          fill={color}
          fillOpacity={opacity}
        />,
      );
    }
  }
  return (
    <svg
      width={cols * gap + 4}
      height={rows * gap + 4}
      viewBox={`0 0 ${cols * gap + 4} ${rows * gap + 4}`}
      className={className}
      aria-hidden="true"
    >
      {dots}
    </svg>
  );
};

// ─── Pill / Rounded Rectangle ─────────────────────────────────────────────────
interface PillProps {
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
  className?: string;
  float?: boolean;
  floatIndex?: number;
}

export const GeometricPill: React.FC<PillProps> = ({
  width = 80,
  height = 30,
  color = "#10B981",
  opacity = 0.4,
  className = "",
  float = false,
  floatIndex = 3,
}) => {
  const base = (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width={width - 4}
        height={height - 4}
        rx={(height - 4) / 2}
        fill={color}
        fillOpacity={opacity}
      />
    </svg>
  );

  if (float) {
    return (
      <motion.div
        custom={floatIndex}
        variants={floatVariants}
        animate="animate"
        className="pointer-events-none"
      >
        {base}
      </motion.div>
    );
  }
  return base;
};

// ─── Cross / Plus ─────────────────────────────────────────────────────────────
interface CrossProps {
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
  float?: boolean;
  floatIndex?: number;
}

export const GeometricCross: React.FC<CrossProps> = ({
  size = 30,
  color = "#06B6D4",
  opacity = 0.6,
  className = "",
  float = false,
  floatIndex = 4,
}) => {
  const base = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="12"
        y="0"
        width="6"
        height="30"
        rx="3"
        fill={color}
        fillOpacity={opacity}
      />
      <rect
        x="0"
        y="12"
        width="30"
        height="6"
        rx="3"
        fill={color}
        fillOpacity={opacity}
      />
    </svg>
  );

  if (float) {
    return (
      <motion.div
        custom={floatIndex}
        variants={floatVariants}
        animate="animate"
        className="pointer-events-none"
      >
        {base}
      </motion.div>
    );
  }
  return base;
};
