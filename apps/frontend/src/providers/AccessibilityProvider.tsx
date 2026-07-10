/**
 * AccessibilityProvider — Applies CSS classes based on stored accessibility config.
 * Runs on mount to restore accessibility settings from localStorage.
 */
import * as React from "react";
import { useAccessibilityStore } from "../store/premium.store";

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { config } = useAccessibilityStore();

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("reduce-motion", config.reducedMotion);
    root.classList.toggle("high-contrast", config.highContrast);
    root.classList.toggle("large-font", config.largeFont);
    root.classList.toggle("focus-visible-always", config.focusVisible);
    if (config.colorBlindMode) {
      root.setAttribute("data-color-blind", config.colorBlindMode);
    } else {
      root.removeAttribute("data-color-blind");
    }
  }, [config]);

  return <>{children}</>;
};
