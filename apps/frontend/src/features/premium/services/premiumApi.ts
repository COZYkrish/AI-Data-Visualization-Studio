/**
 * Premium API Service — Phase 9
 * Axios wrappers for all premium endpoints with timeout, retry, and cancellation.
 */
import { apiClient } from "../../../api/client";
import { API_ROUTES } from "../../../constants";
import type {
  UserPreference,
  PersistentNotification,
  ActivityLog,
  NLQResponse,
  DashboardSuggestion,
  KeyboardShortcut,
  APIResponse,
} from "@studio/types";

// ─── Preferences ────────────────────────────────────────────────────────────

export const premiumApi = {
  // --- Preferences ---
  getPreferences: () =>
    apiClient.get<APIResponse<UserPreference>>(API_ROUTES.PREMIUM.PREFERENCES),

  updatePreferences: (data: Partial<UserPreference>) =>
    apiClient.patch<APIResponse<UserPreference>>(
      API_ROUTES.PREMIUM.PREFERENCES,
      data,
    ),

  // --- Notifications ---
  getNotifications: (params?: {
    include_dismissed?: boolean;
    limit?: number;
    offset?: number;
  }) =>
    apiClient.get<
      APIResponse<PersistentNotification[]> & {
        metadata: { unread_count: number };
      }
    >(API_ROUTES.PREMIUM.NOTIFICATIONS, { params }),

  updateNotification: (
    id: string,
    data: { read?: boolean; dismissed?: boolean },
  ) =>
    apiClient.patch<APIResponse<PersistentNotification>>(
      API_ROUTES.PREMIUM.NOTIFICATION(id),
      data,
    ),

  markAllRead: () =>
    apiClient.post<APIResponse<{ marked: number }>>(
      API_ROUTES.PREMIUM.NOTIFICATIONS_MARK_ALL_READ,
    ),

  deleteNotification: (id: string) =>
    apiClient.delete<APIResponse<{ deleted: boolean }>>(
      API_ROUTES.PREMIUM.NOTIFICATION(id),
    ),

  // --- Activity ---
  getActivity: (params?: {
    action?: string;
    entity_type?: string;
    limit?: number;
    offset?: number;
  }) =>
    apiClient.get<APIResponse<ActivityLog[]>>(API_ROUTES.PREMIUM.ACTIVITY, {
      params,
    }),

  recordActivity: (data: {
    action: string;
    entity_type?: string;
    entity_id?: string;
    entity_name?: string;
    status?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }) =>
    apiClient.post<APIResponse<ActivityLog>>(API_ROUTES.PREMIUM.ACTIVITY, data),

  // --- NLQ ---
  nlqQuery: (data: {
    query: string;
    dataset_id?: string;
    context?: Record<string, unknown>;
  }) => apiClient.post<APIResponse<NLQResponse>>(API_ROUTES.PREMIUM.NLQ, data),

  // --- Suggestions ---
  getSuggestions: (params?: {
    dataset_id?: string;
    include_dismissed?: boolean;
    limit?: number;
  }) =>
    apiClient.get<APIResponse<DashboardSuggestion[]>>(
      API_ROUTES.PREMIUM.SUGGESTIONS,
      { params },
    ),

  generateSuggestions: (dataset_id: string) =>
    apiClient.post<APIResponse<DashboardSuggestion[]>>(
      API_ROUTES.PREMIUM.SUGGESTIONS_GENERATE,
      null,
      { params: { dataset_id } },
    ),

  dismissSuggestion: (id: string) =>
    apiClient.patch<APIResponse<DashboardSuggestion>>(
      API_ROUTES.PREMIUM.SUGGESTION_DISMISS(id),
    ),

  applySuggestion: (id: string) =>
    apiClient.patch<APIResponse<DashboardSuggestion>>(
      API_ROUTES.PREMIUM.SUGGESTION_APPLY(id),
    ),

  // --- Shortcuts ---
  getShortcuts: () =>
    apiClient.get<APIResponse<KeyboardShortcut[]>>(
      API_ROUTES.PREMIUM.SHORTCUTS,
    ),

  updateShortcut: (
    actionId: string,
    data: { custom_keys?: string[] | null; enabled?: boolean },
  ) =>
    apiClient.patch<APIResponse<KeyboardShortcut>>(
      API_ROUTES.PREMIUM.SHORTCUT(actionId),
      data,
    ),

  resetShortcut: (actionId: string) =>
    apiClient.post<APIResponse<KeyboardShortcut>>(
      API_ROUTES.PREMIUM.SHORTCUT_RESET(actionId),
    ),
};
