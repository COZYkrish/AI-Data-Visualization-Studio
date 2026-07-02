export const API_ROUTES = {
  HEALTH: "/health",
  READY: "/ready",
  LIVE: "/live",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
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
  TOKEN: "studio-auth-token",
  USER: "studio-auth-user",
};

export const THEME_CONSTANTS = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;
