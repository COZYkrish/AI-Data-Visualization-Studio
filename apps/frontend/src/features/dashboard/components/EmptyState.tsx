import * as React from "react";
import { Link } from "react-router-dom";
import { BarChart2, Upload } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<Props> = ({
  title = "No dataset selected",
  description = "Choose a dataset from the selector above or upload a new one to start exploring.",
  action,
}) => (
  <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 py-16 px-8 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
      <BarChart2 className="h-8 w-8 text-primary" />
    </div>
    <div>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
    </div>
    {action ?? (
      <Link
        to="/dashboard/datasets/upload"
        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Upload className="h-4 w-4" />
        Upload Dataset
      </Link>
    )}
  </div>
);
