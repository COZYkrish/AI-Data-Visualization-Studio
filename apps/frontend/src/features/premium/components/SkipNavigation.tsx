/**
 * SkipNavigation — Accessible skip-to-content link
 * WCAG 2.2 AA success criterion 2.4.1
 */
import * as React from "react";

export const SkipNavigation: React.FC = () => (
  <a
    href="#main-content"
    className="absolute -top-full left-4 z-[100] rounded-b-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-all focus:top-0 focus:outline-none"
  >
    Skip to main content
  </a>
);
