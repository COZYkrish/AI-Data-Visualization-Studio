/**
 * AccessibilityPanel — WCAG 2.2 AA accessibility settings
 */
import * as React from "react";
import { Eye, Zap, Type, Focus, Palette } from "lucide-react";
import { useAccessibilityStore } from "../../../store/premium.store";
import { useUpdatePreferences } from "../hooks/usePreferences";
import type { AccessibilityConfig } from "@studio/types";

const ToggleRow: React.FC<{
  label: string;
  description: string;
  icon: React.ElementType;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, description, icon: Icon, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-3 hover:bg-accent/30 transition-colors">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

const SELECT_OPTIONS = [
  { value: "none", label: "None" },
  { value: "deuteranopia", label: "Deuteranopia (green-blind)" },
  { value: "protanopia", label: "Protanopia (red-blind)" },
  { value: "tritanopia", label: "Tritanopia (blue-blind)" },
];

export const AccessibilityPanel: React.FC = () => {
  const { config, setConfig } = useAccessibilityStore();
  const updatePref = useUpdatePreferences();

  const update = (
    key: keyof AccessibilityConfig,
    value: boolean | string | null,
  ) => {
    setConfig({ [key]: value });
    updatePref.mutate({ [key]: value } as any);

    // Apply immediately to document
    if (key === "reducedMotion") {
      document.documentElement.classList.toggle(
        "reduce-motion",
        value as boolean,
      );
    }
    if (key === "highContrast") {
      document.documentElement.classList.toggle(
        "high-contrast",
        value as boolean,
      );
    }
    if (key === "largeFont") {
      document.documentElement.classList.toggle("large-font", value as boolean);
    }
    if (key === "focusVisible") {
      document.documentElement.classList.toggle(
        "focus-visible-always",
        value as boolean,
      );
    }
  };

  return (
    <div className="space-y-3" role="group" aria-label="Accessibility settings">
      <ToggleRow
        label="Reduced Motion"
        description="Minimizes animations and transitions throughout the app"
        icon={Zap}
        checked={config.reducedMotion}
        onChange={(v) => update("reducedMotion", v)}
      />
      <ToggleRow
        label="High Contrast"
        description="Increases color contrast for better readability"
        icon={Eye}
        checked={config.highContrast}
        onChange={(v) => update("highContrast", v)}
      />
      <ToggleRow
        label="Large Font Mode"
        description="Increases base font size across the application"
        icon={Type}
        checked={config.largeFont}
        onChange={(v) => update("largeFont", v)}
      />
      <ToggleRow
        label="Always Show Focus Ring"
        description="Shows keyboard focus indicators regardless of input method"
        icon={Focus}
        checked={config.focusVisible}
        onChange={(v) => update("focusVisible", v)}
      />

      {/* Color Blind Mode */}
      <div className="rounded-xl border border-border p-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Palette className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Color Blind Mode
            </p>
            <p className="text-xs text-muted-foreground">
              Adjusts chart colors for color vision deficiencies
            </p>
          </div>
        </div>
        <select
          value={config.colorBlindMode ?? "none"}
          onChange={(e) =>
            update(
              "colorBlindMode",
              e.target.value === "none" ? null : e.target.value,
            )
          }
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Select color blind mode"
        >
          {SELECT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-[11px] text-muted-foreground px-1">
        These settings are applied immediately and persisted to your account.
        They comply with{" "}
        <a
          href="https://www.w3.org/TR/WCAG22/"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          WCAG 2.2 AA
        </a>{" "}
        guidelines.
      </p>
    </div>
  );
};
