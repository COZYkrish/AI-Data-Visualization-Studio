/**
 * useNotifications — TanStack Query hook for premium notifications
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { premiumApi } from "../services/premiumApi";
import { useNotificationPanelStore } from "../../../store/premium.store";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export function useNotifications(includeDismissed = false) {
  const { setNotifications, setUnreadCount } = useNotificationPanelStore();

  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, { includeDismissed }],
    queryFn: async () => {
      const res = await premiumApi.getNotifications({
        include_dismissed: includeDismissed,
        limit: 50,
      });
      const data = res.data?.data ?? [];
      setNotifications(data);
      const unread = (res.data as any)?.metadata?.unread_count ?? 0;
      setUnreadCount(unread);
      return data;
    },
    refetchInterval: 30_000, // Poll every 30s until WebSocket is implemented
    staleTime: 10_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { markRead } = useNotificationPanelStore();

  return useMutation({
    mutationFn: (id: string) =>
      premiumApi.updateNotification(id, { read: true }),
    onMutate: (id) => markRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  const { markAllRead } = useNotificationPanelStore();

  return useMutation({
    mutationFn: () => premiumApi.markAllRead(),
    onMutate: () => markAllRead(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}

export function useDismissNotification() {
  const queryClient = useQueryClient();
  const { dismiss } = useNotificationPanelStore();

  return useMutation({
    mutationFn: (id: string) =>
      premiumApi.updateNotification(id, { dismissed: true }),
    onMutate: (id) => dismiss(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}
