/**
 * PremiumSettings — Premium tabs: Preferences, Accessibility, Shortcuts, Theme
 */
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Eye,
  Keyboard,
  Sliders,
  Globe,
  Bell,
  AlignJustify,
  Clock,
} from "lucide-react";
import { ThemeCustomizer } from "../components/ThemeCustomizer";
import { AccessibilityPanel } from "../components/AccessibilityPanel";
import { KeyboardShortcutDialog } from "../components/KeyboardShortcutDialog";
import { ActivityTimeline } from "../components/ActivityTimeline";
import { usePreferences } from "../hooks/usePreferences";
import { useUpdatePreferences } from "../hooks/usePreferences";
import { usePreferenceStore } from "../../../store/premium.store";

const TAB_CONFIG = [
  { id: "theme", label: "Theme", icon: Palette },
  { id: "accessibility", label: "Accessibility", icon: Eye },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  { id: "preferences", label: "Preferences", icon: Sliders },
  { id: "activity", label: "Activity", icon: Clock },
];

const DATE_FORMATS = [
  { value: "MMM d, yyyy", label: "Jan 1, 2025" },
  { value: "dd/MM/yyyy", label: "01/01/2025" },
  { value: "MM/dd/yyyy", label: "01/01/2025 (US)" },
  { value: "yyyy-MM-dd", label: "2025-01-01 (ISO)" },
];

const NUMBER_FORMATS = [
  { value: "1,234.56", label: "1,234.56 (EN)" },
  { value: "1.234,56", label: "1.234,56 (EU)" },
  { value: "1 234.56", label: "1 234.56 (Space)" },
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export const PremiumSettings: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("theme");
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const { preferences } = usePreferenceStore();
  const updatePref = useUpdatePreferences();
  usePreferences();

  const notifKeys = [
    { key: "analysis_completed", label: "Analysis Completed" },
    { key: "model_trained", label: "Model Trained" },
    { key: "forecast_completed", label: "Forecast Completed" },
    { key: "report_generated", label: "Report Generated" },
    { key: "export_finished", label: "Export Finished" },
    { key: "errors", label: "Errors" },
    { key: "warnings", label: "Warnings" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Premium Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Personalize your experience, accessibility, and workspace preferences.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted/50 p-1">
        {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all ${
              activeTab === id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-selected={activeTab === id}
            role="tab"
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === "theme" && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-5 font-semibold text-foreground">
                Theme & Appearance
              </h3>
              <ThemeCustomizer currentAccent={preferences.accent_color} />

              {/* Compact / Comfortable */}
              <div className="mt-6 space-y-3 border-t border-border pt-5">
                <h4 className="text-sm font-semibold text-foreground">
                  Density
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: false,
                      label: "Comfortable",
                      desc: "More spacing, easier to scan",
                    },
                    {
                      id: true,
                      label: "Compact",
                      desc: "Less whitespace, more content",
                    },
                  ].map(({ id, label, desc }) => (
                    <button
                      key={String(id)}
                      onClick={() => updatePref.mutate({ compact_mode: id })}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        preferences.compact_mode === id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "accessibility" && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-5 font-semibold text-foreground">
                Accessibility
              </h3>
              <AccessibilityPanel />
            </div>
          )}

          {activeTab === "shortcuts" && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-2 font-semibold text-foreground">
                Keyboard Shortcuts
              </h3>
              <p className="mb-5 text-sm text-muted-foreground">
                View and customize keyboard shortcuts for faster navigation.
              </p>
              <button
                onClick={() => setShortcutsOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Keyboard className="h-4 w-4" />
                Open Shortcut Reference
              </button>
              <KeyboardShortcutDialog
                isOpen={shortcutsOpen}
                onClose={() => setShortcutsOpen(false)}
              />
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-4">
              {/* Locale */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" /> Locale &
                  Formats
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Timezone */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Timezone
                    </label>
                    <select
                      value={preferences.timezone ?? "UTC"}
                      onChange={(e) =>
                        updatePref.mutate({ timezone: e.target.value })
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Date Format */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Date Format
                    </label>
                    <select
                      value={preferences.date_format ?? "MMM d, yyyy"}
                      onChange={(e) =>
                        updatePref.mutate({ date_format: e.target.value })
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {DATE_FORMATS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Number Format */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Number Format
                    </label>
                    <select
                      value={preferences.number_format ?? "1,234.56"}
                      onChange={(e) =>
                        updatePref.mutate({ number_format: e.target.value })
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {NUMBER_FORMATS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />{" "}
                  Notification Preferences
                </h3>
                {notifKeys.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{label}</span>
                    <button
                      role="switch"
                      aria-checked={
                        preferences.notification_preferences?.[key] ?? true
                      }
                      onClick={() =>
                        updatePref.mutate({
                          notification_preferences: {
                            ...preferences.notification_preferences,
                            [key]: !(
                              preferences.notification_preferences?.[key] ??
                              true
                            ),
                          },
                        })
                      }
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        (preferences.notification_preferences?.[key] ?? true)
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          (preferences.notification_preferences?.[key] ?? true)
                            ? "translate-x-4"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-5 font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Activity Log
              </h3>
              <ActivityTimeline limit={30} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
