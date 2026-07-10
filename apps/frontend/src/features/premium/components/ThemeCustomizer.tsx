/**
 * ThemeCustomizer — Theme switcher + accent color picker
 */
import * as React from "react";
import { motion } from "framer-motion";
import { Check, Monitor, Sun, Moon, Contrast } from "lucide-react";
import { useThemeStore } from "../../../store";
import { useUpdatePreferences } from "../hooks/usePreferences";
import type { Theme } from "@studio/types";

const THEMES: { id: Theme; label: string; icon: React.ElementType }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
  { id: "high-contrast", label: "High Contrast", icon: Contrast },
];

export const ACCENT_COLORS = [
  { id: "violet", label: "Violet", hex: "#7C3AED", tw: "bg-violet-600" },
  { id: "indigo", label: "Indigo", hex: "#4F46E5", tw: "bg-indigo-600" },
  { id: "sky", label: "Sky", hex: "#0284C7", tw: "bg-sky-600" },
  { id: "emerald", label: "Emerald", hex: "#059669", tw: "bg-emerald-600" },
  { id: "rose", label: "Rose", hex: "#E11D48", tw: "bg-rose-600" },
  { id: "amber", label: "Amber", hex: "#D97706", tw: "bg-amber-600" },
  { id: "orange", label: "Orange", hex: "#EA580C", tw: "bg-orange-600" },
  { id: "slate", label: "Slate", hex: "#475569", tw: "bg-slate-600" },
];

interface ThemeCustomizerProps {
  currentAccent?: string;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  currentAccent = "violet",
}) => {
  const { theme, setTheme } = useThemeStore();
  const updatePref = useUpdatePreferences();

  const handleThemeChange = (t: Theme) => {
    setTheme(t);
    updatePref.mutate({ theme: t });
  };

  const handleAccentChange = (accent: string) => {
    updatePref.mutate({ accent_color: accent });
    // Apply CSS variable for immediate effect
    const color = ACCENT_COLORS.find((a) => a.id === accent);
    if (color) {
      document.documentElement.style.setProperty("--accent-primary", color.hex);
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Theme</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {THEMES.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleThemeChange(id)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ${
                theme === id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-border/80 hover:bg-accent"
              }`}
              aria-pressed={theme === id}
              aria-label={`Set theme to ${label}`}
            >
              <Icon className="h-5 w-5" />
              {label}
              {theme === id && (
                <motion.span
                  layoutId="theme-check"
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-primary"
                >
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Accent Color
        </h3>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map(({ id, label, tw }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAccentChange(id)}
              className={`relative h-8 w-8 rounded-full ${tw} ring-offset-2 ring-offset-background transition-all ${
                currentAccent === id
                  ? "ring-2 ring-foreground"
                  : "hover:ring-1 hover:ring-muted-foreground"
              }`}
              aria-label={`Set accent color to ${label}`}
              aria-pressed={currentAccent === id}
              title={label}
            >
              {currentAccent === id && (
                <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white" />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
