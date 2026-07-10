/**
 * NotificationCenter — Slide-out panel with full notification list
 */
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  X,
  CheckCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { PersistentNotification } from "@studio/types";
import {
  useMarkNotificationRead,
  useMarkAllRead,
  useDismissNotification,
} from "../hooks/useNotifications";
import { useNotificationPanelStore } from "../../../store/premium.store";

const TYPE_CONFIG = {
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
  success: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  error: { icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
};

const NotificationItem: React.FC<{ notif: PersistentNotification }> = ({
  notif,
}) => {
  const markRead = useMarkNotificationRead();
  const dismiss = useDismissNotification();
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex gap-3 rounded-xl p-3 transition-colors ${
        notif.read ? "opacity-60" : "bg-accent/30"
      } hover:bg-accent/50`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}
      >
        <Icon className={`h-4 w-4 ${cfg.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${notif.read ? "text-muted-foreground" : "text-foreground"}`}
        >
          {notif.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
          {notif.message}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(notif.created_at), {
              addSuffix: true,
            })}
          </span>
          {notif.action_label && notif.action_url && (
            <a
              href={notif.action_url}
              className="flex items-center gap-1 text-[10px] text-primary hover:underline"
            >
              {notif.action_label} <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notif.read && (
          <button
            onClick={() => markRead.mutate(notif.id)}
            className="rounded p-1 text-muted-foreground hover:text-primary"
            title="Mark as read"
            aria-label="Mark notification as read"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={() => dismiss.mutate(notif.id)}
          className="rounded p-1 text-muted-foreground hover:text-destructive"
          title="Dismiss"
          aria-label="Dismiss notification"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
      )}
    </motion.div>
  );
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, unreadCount } = useNotificationPanelStore();
  const markAllRead = useMarkAllRead();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-border bg-card shadow-2xl"
            role="complementary"
            aria-label="Notification center"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    className="rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Mark all notifications as read"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="rounded p-1 text-muted-foreground hover:bg-accent"
                  aria-label="Close notification center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-1">
              <AnimatePresence mode="popLayout">
                {notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-3 py-12 text-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Bell className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        All caught up!
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        No new notifications
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  notifications.map((notif) => (
                    <NotificationItem key={notif.id} notif={notif} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
