import * as React from "react";
import { motion, useInView } from "framer-motion";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  id?: string;
  once?: boolean;
}

const directionMap = {
  up: { y: 50, x: 0 },
  left: { y: 0, x: -50 },
  right: { y: 0, x: 50 },
  none: { y: 0, x: 0 },
};

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  id,
  once = true,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-80px 0px" });

  const initial = { opacity: 0, ...directionMap[direction] };
  const animate = isInView ? { opacity: 1, y: 0, x: 0 } : initial;

  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      initial={initial}
      animate={animate}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
};

// ─── Stagger container for child animations ──────────────────────────────────
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  id?: string;
}> = ({ children, className = "", staggerDelay = 0.1, id }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "left" | "right";
}> = ({ children, className = "", direction = "up" }) => {
  const initial = { opacity: 0, ...directionMap[direction] };
  return (
    <motion.div
      className={className}
      variants={{
        hidden: initial,
        visible: {
          opacity: 1,
          y: 0,
          x: 0,
          transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
        },
      }}
    >
      {children}
    </motion.div>
  );
};
