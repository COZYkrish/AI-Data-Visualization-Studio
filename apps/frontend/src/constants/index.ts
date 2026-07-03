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
