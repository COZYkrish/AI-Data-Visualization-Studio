/**
 * usePreferences — TanStack Query hook for user preferences
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { premiumApi } from "../services/premiumApi";
import { usePreferenceStore } from "../../../store/premium.store";
import type { UserPreference } from "@studio/types";

export const PREFERENCES_QUERY_KEY = ["preferences"] as const;

export function usePreferences() {
  const { setPreferences } = usePreferenceStore();

  return useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: async () => {
      const res = await premiumApi.getPreferences();
      const pref = res.data?.data;
      if (pref) setPreferences(pref);
      return pref;
    },
    staleTime: 5 * 60 * 1000, // 5 min
    retry: 2,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const { patchPreference } = usePreferenceStore();

  return useMutation({
    mutationFn: (data: Partial<UserPreference>) =>
      premiumApi.updatePreferences(data),
    onMutate: (data) => {
      // Optimistic update
      Object.entries(data).forEach(([key, value]) => {
        patchPreference(key as keyof UserPreference, value as never);
      });
    },
    onSuccess: (res) => {
      if (res.data?.data) {
        usePreferenceStore.getState().setPreferences(res.data.data);
      }
      queryClient.invalidateQueries({ queryKey: PREFERENCES_QUERY_KEY });
    },
  });
}
