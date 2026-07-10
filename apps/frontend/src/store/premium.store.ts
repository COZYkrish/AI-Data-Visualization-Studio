/**
 * Premium Zustand Store — Phase 9
 * Tracks notifications, activities, suggestions, preferences, theme config,
 * shortcuts, command palette state, and NLQ state.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  UserPreference,
  PersistentNotification,
  ActivityLog,
  DashboardSuggestion,
  KeyboardShortcut,
  NLQResult,
  AccessibilityConfig,
  CommandPaletteItem,
} from "@studio/types";

// ─── Notification Store ───────────────────────────────────────────────────────

interface NotificationStoreState {
  notifications: PersistentNotification[];
  unreadCount: number;
  isOpen: boolean;
  setNotifications: (n: PersistentNotification[]) => void;
  setUnreadCount: (count: number) => void;
  markRead: (id: string) => void;
  dismiss: (id: string) => void;
  markAllRead: () => void;
  setOpen: (open: boolean) => void;
  addLocal: (n: PersistentNotification) => void;
}

export const useNotificationPanelStore = create<NotificationStoreState>(
  (set) => ({
    notifications: [],
    unreadCount: 0,
    isOpen: false,
    setNotifications: (notifications) =>
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.read && !n.dismissed)
          .length,
      }),
    setUnreadCount: (unreadCount) => set({ unreadCount }),
    markRead: (id) =>
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
        unreadCount: Math.max(0, s.unreadCount - 1),
      })),
    dismiss: (id) =>
      set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== id),
      })),
    markAllRead: () =>
      set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      })),
    setOpen: (isOpen) => set({ isOpen }),
    addLocal: (n) =>
      set((s) => ({
        notifications: [n, ...s.notifications],
        unreadCount: s.unreadCount + (n.read ? 0 : 1),
      })),
  }),
);

// ─── Activity Store ───────────────────────────────────────────────────────────

interface ActivityStoreState {
  activities: ActivityLog[];
  setActivities: (a: ActivityLog[]) => void;
  prependActivity: (a: ActivityLog) => void;
}

export const useActivityStore = create<ActivityStoreState>((set) => ({
  activities: [],
  setActivities: (activities) => set({ activities }),
  prependActivity: (a) =>
    set((s) => ({ activities: [a, ...s.activities.slice(0, 99)] })),
}));

// ─── Suggestion Store ─────────────────────────────────────────────────────────

interface SuggestionStoreState {
  suggestions: DashboardSuggestion[];
  isOpen: boolean;
  setSuggestions: (s: DashboardSuggestion[]) => void;
  dismiss: (id: string) => void;
  markApplied: (id: string) => void;
  setOpen: (open: boolean) => void;
}

export const useSuggestionStore = create<SuggestionStoreState>((set) => ({
  suggestions: [],
  isOpen: false,
  setSuggestions: (suggestions) => set({ suggestions }),
  dismiss: (id) =>
    set((s) => ({
      suggestions: s.suggestions.filter((sg) => sg.id !== id),
    })),
  markApplied: (id) =>
    set((s) => ({
      suggestions: s.suggestions.map((sg) =>
        sg.id === id ? { ...sg, applied: true } : sg,
      ),
    })),
  setOpen: (isOpen) => set({ isOpen }),
}));

// ─── Preferences Store ────────────────────────────────────────────────────────

const DEFAULT_PREFERENCES: Partial<UserPreference> = {
  theme: "system",
  accent_color: "violet",
  compact_mode: false,
  large_font: false,
  reduced_motion: false,
  high_contrast: false,
  focus_visible: true,
  timezone: "UTC",
  date_format: "MMM d, yyyy",
  number_format: "1,234.56",
  language: "en",
  notification_preferences: {
    analysis_completed: true,
    model_trained: true,
    forecast_completed: true,
    report_generated: true,
    export_finished: true,
    errors: true,
    warnings: true,
  },
};

interface PreferenceStoreState {
  preferences: Partial<UserPreference>;
  isLoaded: boolean;
  setPreferences: (p: Partial<UserPreference>) => void;
  patchPreference: <K extends keyof UserPreference>(
    key: K,
    value: UserPreference[K],
  ) => void;
  setLoaded: (loaded: boolean) => void;
}

export const usePreferenceStore = create<PreferenceStoreState>()(
  persist(
    (set) => ({
      preferences: DEFAULT_PREFERENCES,
      isLoaded: false,
      setPreferences: (preferences) => set({ preferences, isLoaded: true }),
      patchPreference: (key, value) =>
        set((s) => ({
          preferences: { ...s.preferences, [key]: value },
        })),
      setLoaded: (isLoaded) => set({ isLoaded }),
    }),
    {
      name: "studio-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ preferences: s.preferences }),
    },
  ),
);

// ─── Shortcut Store ───────────────────────────────────────────────────────────

interface ShortcutStoreState {
  shortcuts: KeyboardShortcut[];
  setShortcuts: (shortcuts: KeyboardShortcut[]) => void;
  updateShortcut: (actionId: string, customKeys: string[] | null) => void;
}

export const useShortcutStore = create<ShortcutStoreState>((set) => ({
  shortcuts: [],
  setShortcuts: (shortcuts) => set({ shortcuts }),
  updateShortcut: (actionId, customKeys) =>
    set((s) => ({
      shortcuts: s.shortcuts.map((sc) =>
        sc.action_id === actionId
          ? {
              ...sc,
              custom_keys: customKeys,
              effective_keys: customKeys ?? sc.default_keys,
            }
          : sc,
      ),
    })),
}));

// ─── Command Palette Store ────────────────────────────────────────────────────

interface CommandPaletteStoreState {
  isOpen: boolean;
  query: string;
  items: CommandPaletteItem[];
  open: () => void;
  close: () => void;
  setQuery: (q: string) => void;
  setItems: (items: CommandPaletteItem[]) => void;
}

export const useCommandPaletteStore = create<CommandPaletteStoreState>(
  (set) => ({
    isOpen: false,
    query: "",
    items: [],
    open: () => set({ isOpen: true, query: "" }),
    close: () => set({ isOpen: false, query: "" }),
    setQuery: (query) => set({ query }),
    setItems: (items) => set({ items }),
  }),
);

// ─── NLQ Store ────────────────────────────────────────────────────────────────

interface NLQStoreState {
  query: string;
  result: NLQResult | null;
  isLoading: boolean;
  error: string | null;
  setQuery: (q: string) => void;
  setResult: (r: NLQResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

export const useNLQStore = create<NLQStoreState>((set) => ({
  query: "",
  result: null,
  isLoading: false,
  error: null,
  setQuery: (query) => set({ query }),
  setResult: (result) => set({ result }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ query: "", result: null, isLoading: false, error: null }),
}));

// ─── Accessibility Store ──────────────────────────────────────────────────────

interface AccessibilityStoreState {
  config: AccessibilityConfig;
  setConfig: (config: Partial<AccessibilityConfig>) => void;
}

export const useAccessibilityStore = create<AccessibilityStoreState>()(
  persist(
    (set) => ({
      config: {
        reducedMotion: false,
        highContrast: false,
        largeFont: false,
        focusVisible: true,
        colorBlindMode: null,
      },
      setConfig: (config) =>
        set((s) => ({ config: { ...s.config, ...config } })),
    }),
    {
      name: "studio-accessibility",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
