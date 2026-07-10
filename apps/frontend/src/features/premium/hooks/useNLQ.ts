/**
 * useNLQ — hook for Natural Language Query interactions
 */
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { premiumApi } from "../services/premiumApi";
import { useNLQStore } from "../../../store/premium.store";

export function useNLQ() {
  const {
    setQuery,
    setResult,
    setLoading,
    setError,
    reset,
    query,
    result,
    isLoading,
    error,
  } = useNLQStore();

  const mutation = useMutation({
    mutationFn: ({
      query,
      dataset_id,
    }: {
      query: string;
      dataset_id?: string;
    }) => premiumApi.nlqQuery({ query, dataset_id }),
    onMutate: ({ query }) => {
      setLoading(true);
      setError(null);
      setQuery(query);
    },
    onSuccess: (res) => {
      setResult(res.data?.data?.result ?? null);
      setLoading(false);
    },
    onError: (err: any) => {
      setError(err?.message ?? "Failed to parse query");
      setLoading(false);
    },
  });

  const submit = useCallback(
    (q: string, datasetId?: string) => {
      if (!q.trim()) return;
      mutation.mutate({ query: q, dataset_id: datasetId });
    },
    [mutation],
  );

  return { query, result, isLoading, error, submit, reset };
}
