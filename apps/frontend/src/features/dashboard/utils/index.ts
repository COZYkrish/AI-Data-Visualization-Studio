/**
 * Dashboard Feature Utilities — Phase 5
 */

/**
 * Formats bytes to a human-readable string (KB, MB, GB).
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

/**
 * Formats a number with locale-aware thousands separators.
 */
export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString();
}

/**
 * Truncates a string to a max length with ellipsis.
 */
export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/**
 * Returns a deterministic color from the palette for a given index.
 */
export function paletteColor(index: number): string {
  const colors = [
    "#8b5cf6",
    "#6366f1",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#84cc16",
  ];
  return colors[index % colors.length];
}
