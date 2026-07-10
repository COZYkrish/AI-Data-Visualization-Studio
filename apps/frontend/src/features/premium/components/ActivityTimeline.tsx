/**
 * ActivityTimeline — Chronological activity feed with filters
 */
import * as React from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FolderKanban,
  BarChart2,
  FileText,
  BrainCircuit,
  TrendingUp,
  Settings,
  Palette,
  User,
  Keyboard,
  Sparkles,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ActivityLog } from "@studio/types";
import { useActivities } from "../hooks/useActivities";
import { useActivityStore } from "../../../store/premium.store";

const ACTION_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  dataset_uploaded: {
    icon: Upload,
    color: "text-sky-500",
    label: "Dataset Uploaded",
  },
  dataset_deleted: {
    icon: Upload,
    color: "text-rose-500",
    label: "Dataset Deleted",
  },
  project_created: {
    icon: FolderKanban,
    color: "text-violet-500",
    label: "Project Created",
  },
  project_updated: {
    icon: FolderKanban,
    color: "text-indigo-500",
    label: "Project Updated",
  },
  project_deleted: {
    icon: FolderKanban,
    color: "text-rose-500",
    label: "Project Deleted",
  },
  project_duplicated: {
    icon: FolderKanban,
    color: "text-purple-500",
    label: "Project Duplicated",
  },
  dashboard_edited: {
    icon: BarChart2,
    color: "text-emerald-500",
    label: "Dashboard Edited",
  },
  chart_exported: {
    icon: BarChart2,
    color: "text-teal-500",
    label: "Chart Exported",
  },
  report_generated: {
    icon: FileText,
    color: "text-blue-500",
    label: "Report Generated",
  },
  export_requested: {
    icon: FileText,
    color: "text-cyan-500",
    label: "Export Started",
  },
  model_trained: {
    icon: BrainCircuit,
    color: "text-pink-500",
    label: "Model Trained",
  },
  forecast_generated: {
    icon: TrendingUp,
    color: "text-orange-500",
    label: "Forecast Generated",
  },
  settings_changed: {
    icon: Settings,
    color: "text-slate-500",
    label: "Settings Changed",
  },
  theme_changed: {
    icon: Palette,
    color: "text-amber-500",
    label: "Theme Changed",
  },
  profile_updated: {
    icon: User,
    color: "text-green-500",
    label: "Profile Updated",
  },
  shortcut_modified: {
    icon: Keyboard,
    color: "text-violet-500",
    label: "Shortcut Modified",
  },
  nlq_query: { icon: Sparkles, color: "text-violet-500", label: "NLQ Query" },
  suggestion_applied: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    label: "Suggestion Applied",
  },
  suggestion_dismissed: {
    icon: XCircle,
    color: "text-muted-foreground",
    label: "Suggestion Dismissed",
  },
  notification_read: {
    icon: CheckCircle2,
    color: "text-blue-400",
    label: "Notification Read",
  },
};

const ActivityEntry: React.FC<{ log: ActivityLog; isLast: boolean }> = ({
  log,
  isLast,
}) => {
  const cfg = ACTION_CONFIG[log.action] ?? {
    icon: Activity,
    color: "text-muted-foreground",
    label: log.action,
  };
  const Icon = cfg.icon;

  return (
    <div className="relative flex gap-3">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-3.5 top-7 bottom-0 w-px bg-border" />
      )}

      {/* Icon */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card">
        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-foreground">{cfg.label}</p>
            {log.description && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {log.description}
              </p>
            )}
            {log.entity_name && (
              <span className="inline-block mt-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {log.entity_name}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
          </div>
        </div>

        {/* Status */}
        {log.status !== "success" && (
          <span
            className={`mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
              log.status === "failed"
                ? "bg-rose-500/10 text-rose-500"
                : "bg-amber-500/10 text-amber-500"
            }`}
          >
            {log.status}
          </span>
        )}
      </div>
    </div>
  );
};

interface ActivityTimelineProps {
  limit?: number;
  filterAction?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  limit = 20,
  filterAction,
}) => {
  const { activities } = useActivityStore();
  useActivities({ action: filterAction, limit });

  const displayed = React.useMemo(() => {
    let items = activities;
    if (filterAction) items = items.filter((a) => a.action === filterAction);
    return items.slice(0, limit);
  }, [activities, filterAction, limit]);

  if (displayed.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Activity className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            No activity yet
          </p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            Actions you take will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {displayed.map((log, idx) => (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.04 }}
        >
          <ActivityEntry log={log} isLast={idx === displayed.length - 1} />
        </motion.div>
      ))}
    </div>
  );
};
