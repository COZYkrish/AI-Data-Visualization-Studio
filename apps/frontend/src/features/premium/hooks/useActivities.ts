/**
 * useActivities — TanStack Query hook for activity log
 */
import { useQuery } from "@tanstack/react-query";
import { premiumApi } from "../services/premiumApi";
import { useActivityStore } from "../../../store/premium.store";

export const ACTIVITY_QUERY_KEY = ["activity"] as const;

export function useActivities(params?: {
  action?: string;
  entity_type?: string;
  limit?: number;
}) {
  const { setActivities } = useActivityStore();

  return useQuery({
    queryKey: [...ACTIVITY_QUERY_KEY, params],
    queryFn: async () => {
      const res = await premiumApi.getActivity(params);
      const data = res.data?.data ?? [];
      setActivities(data);
      return data;
    },
    staleTime: 60_000,
  });
}
