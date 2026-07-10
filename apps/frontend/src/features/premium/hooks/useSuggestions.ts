/**
 * useSuggestions — TanStack Query hook for AI-style dashboard suggestions
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { premiumApi } from "../services/premiumApi";
import { useSuggestionStore } from "../../../store/premium.store";

export const SUGGESTIONS_QUERY_KEY = ["suggestions"] as const;

export function useSuggestions(datasetId?: string) {
  const { setSuggestions } = useSuggestionStore();

  return useQuery({
    queryKey: [...SUGGESTIONS_QUERY_KEY, { datasetId }],
    queryFn: async () => {
      const res = await premiumApi.getSuggestions({
        dataset_id: datasetId,
        limit: 20,
      });
      const data = res.data?.data ?? [];
      setSuggestions(data);
      return data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: true,
  });
}

export function useGenerateSuggestions() {
  const queryClient = useQueryClient();
  const { setSuggestions } = useSuggestionStore();

  return useMutation({
    mutationFn: (datasetId: string) =>
      premiumApi.generateSuggestions(datasetId),
    onSuccess: (res) => {
      if (res.data?.data) setSuggestions(res.data.data);
      queryClient.invalidateQueries({ queryKey: SUGGESTIONS_QUERY_KEY });
    },
  });
}

export function useDismissSuggestion() {
  const { dismiss } = useSuggestionStore();

  return useMutation({
    mutationFn: (id: string) => premiumApi.dismissSuggestion(id),
    onMutate: (id) => dismiss(id),
  });
}

export function useApplySuggestion() {
  const { markApplied } = useSuggestionStore();

  return useMutation({
    mutationFn: (id: string) => premiumApi.applySuggestion(id),
    onMutate: (id) => markApplied(id),
  });
}
