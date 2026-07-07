/**
 * ML Shared UI Components — Phase 7
 *
 * Exports: MLEmptyState, MLSkeleton, MLErrorState, MLToolbar
 */

import * as React from "react";
import { motion } from "framer-motion";
import { BrainCircuit, AlertTriangle, RefreshCw } from "lucide-react";

// ── MLEmptyState ────────────────────────────────────────────────────────────

interface MLEmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const MLEmptyState: React.FC<MLEmptyStateProps> = ({
  title = "No ML Models Yet",
  description = "Select a dataset and train your first model to get started.",
  action,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center gap-4"
    role="status"
    aria-label={title}
  >
    <div className="rounded-2xl bg-violet-500/10 border border-violet-500/20 p-6">
      <BrainCircuit className="h-12 w-12 text-violet-400" strokeWidth={1.5} />
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
    {action && <div className="mt-2">{action}</div>}
  </motion.div>
);

// ── MLSkeleton ──────────────────────────────────────────────────────────────

export const MLSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div
    className="space-y-3 animate-pulse"
    aria-busy="true"
    aria-label="Loading"
  >
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="h-20 rounded-xl bg-muted/50"
        style={{ opacity: 1 - i * 0.15 }}
      />
    ))}
  </div>
);

// ── MLErrorState ────────────────────────────────────────────────────────────

interface MLErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const MLErrorState: React.FC<MLErrorStateProps> = ({
  message = "Something went wrong while loading ML data.",
  onRetry,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-16 text-center gap-4"
    role="alert"
  >
    <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-5">
      <AlertTriangle className="h-10 w-10 text-red-400" />
    </div>
    <div className="space-y-1">
      <h3 className="text-base font-semibold text-foreground">Error</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    )}
  </motion.div>
);

// ── MLToolbar ───────────────────────────────────────────────────────────────

interface MLToolbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: React.ElementType;
}

export const MLToolbar: React.FC<MLToolbarProps> = ({
  title,
  subtitle,
  actions,
  icon: Icon = BrainCircuit,
}) => (
  <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/50">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
        <Icon className="h-5 w-5 text-violet-400" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-foreground leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);
