import * as React from "react";
import { cn } from "@studio/ui";

interface Props {
  className?: string;
}

export const LoadingSkeleton: React.FC<Props> = ({ className }) => (
  <div
    className={cn("animate-pulse bg-muted/60 rounded-lg", className)}
    role="status"
    aria-label="Loading…"
  />
);
