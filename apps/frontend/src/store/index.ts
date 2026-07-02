import { create } from "zustand";
import { User, Theme, Notification } from "@studio/types";
import { STORAGE_KEYS } from "../constants";

// --- Theme Store ---
interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem(STORAGE_KEYS.THEME) as Theme) || "system",
  setTheme: (theme: Theme) => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    set({ theme });
  },
}));

// --- User Store (Auth Scaffolding) ---
interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => {
  const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
  const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    isAuthenticated: !!storedToken,
    setUser: (user) => {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
      set({ user });
    },
    setToken: (token) => {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        set({ token, isAuthenticated: true });
      } else {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        set({ token: null, isAuthenticated: false });
      }
    },
    logout: () => {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});

// --- App Store ---
interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}));

// --- Notification Store ---
interface NotificationState {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "read">,
  ) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      read: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    })),
  clearAll: () => set({ notifications: [] }),
}));
