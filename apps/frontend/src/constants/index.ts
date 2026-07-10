export const API_ROUTES = {
  HEALTH: "/health",
  READY: "/ready",
  LIVE: "/live",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
    RESEND_VERIFICATION: "/auth/resend-verification",
  },
  PROFILE: {
    BASE: "/profile",
    AVATAR: "/profile/avatar",
    SESSIONS: "/profile/sessions",
  },
  DATASETS: {
    BASE: "/datasets",
    UPLOAD: "/datasets/upload",
  },
  PROJECTS: {
    BASE: "/projects",
  },
  DASHBOARD: {
    BASE: "/dashboard",
    KPIS: "/dashboard/kpis",
    CHARTS: "/dashboard/charts",
    QUERY: "/dashboard/query",
    RECOMMENDATIONS: "/dashboard/recommendations",
    EXPORT: "/dashboard/export-chart",
    STATISTICS: (id: string) => `/dashboard/datasets/${id}/statistics`,
  },
  PREMIUM: {
    PREFERENCES: "/preferences",
    NOTIFICATIONS: "/notifications",
    NOTIFICATION: (id: string) => `/notifications/${id}`,
    NOTIFICATIONS_MARK_ALL_READ: "/notifications/mark-all-read",
    ACTIVITY: "/activity",
    NLQ: "/nlq/query",
    SUGGESTIONS: "/suggestions",
    SUGGESTIONS_GENERATE: "/suggestions/generate",
    SUGGESTION_DISMISS: (id: string) => `/suggestions/${id}/dismiss`,
    SUGGESTION_APPLY: (id: string) => `/suggestions/${id}/apply`,
    SHORTCUTS: "/shortcuts",
    SHORTCUT: (actionId: string) => `/shortcuts/${actionId}`,
    SHORTCUT_RESET: (actionId: string) => `/shortcuts/${actionId}/reset`,
  },
};

export const STORAGE_KEYS = {
  THEME: "studio-ui-theme",
  TOKEN: "studio-auth-token", // Now only used as fallback/memory indicator
  REFRESH_TOKEN: "studio_refresh", // Used to reference cookie name
  USER: "studio-auth-user",
};

export const THEME_CONSTANTS = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;
