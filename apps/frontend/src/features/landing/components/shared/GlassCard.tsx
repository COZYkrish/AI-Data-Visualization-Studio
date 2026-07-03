import * as React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  hover?: boolean;
  hardShadowColor?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  dark = false,
  hover = true,
  hardShadowColor,
  onClick,
}) => {
  const base = dark
    ? "bg-white/5 backdrop-blur-xl border border-white/10"
    : "bg-white/70 backdrop-blur-xl border border-white/60";

  const shadowStyle = hardShadowColor
    ? { boxShadow: `4px 4px 0px ${hardShadowColor}` }
    : {};

  return (
    <motion.div
      className={`rounded-2xl ${base} ${className}`}
      style={shadowStyle}
      whileHover={
        hover
          ? {
              y: -4,
              boxShadow: hardShadowColor
                ? `6px 6px 0px ${hardShadowColor}`
                : "0 20px 60px rgba(0,0,0,0.12)",
            }
          : {}
      }
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
