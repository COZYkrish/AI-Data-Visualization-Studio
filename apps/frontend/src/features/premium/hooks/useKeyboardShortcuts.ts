/**
 * useKeyboardShortcuts — hook that manages and fires keyboard shortcut handlers
 */
import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { premiumApi } from "../services/premiumApi";
import { useShortcutStore } from "../../../store/premium.store";

export const SHORTCUTS_QUERY_KEY = ["shortcuts"] as const;

export function useShortcuts() {
  const { setShortcuts } = useShortcutStore();

  return useQuery({
    queryKey: SHORTCUTS_QUERY_KEY,
    queryFn: async () => {
      const res = await premiumApi.getShortcuts();
      const data = res.data?.data ?? [];
      // Compute effective_keys for convenience
      const enriched = data.map((sc) => ({
        ...sc,
        effective_keys: sc.custom_keys ?? sc.default_keys,
      }));
      setShortcuts(enriched);
      return enriched;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpdateShortcut() {
  const queryClient = useQueryClient();
  const { updateShortcut } = useShortcutStore();

  return useMutation({
    mutationFn: ({
      actionId,
      customKeys,
    }: {
      actionId: string;
      customKeys: string[] | null;
    }) => premiumApi.updateShortcut(actionId, { custom_keys: customKeys }),
    onMutate: ({ actionId, customKeys }) =>
      updateShortcut(actionId, customKeys),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SHORTCUTS_QUERY_KEY }),
  });
}

// Global shortcut listener hook — call once in DashboardLayout
export function useKeyboardShortcutListener(
  handlers: Record<string, () => void>,
) {
  const { shortcuts } = useShortcutStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = e.key.toLowerCase();

      for (const sc of shortcuts) {
        if (!sc.enabled) continue;
        const keys = sc.custom_keys ?? sc.default_keys;
        const handler = handlers[sc.action_id];
        if (!handler) continue;

        // Evaluate key combo
        const hasMod = keys.includes("mod");
        const hasShift = keys.includes("shift");
        const mainKey = keys.find((k) => k !== "mod" && k !== "shift") ?? "";

        if (
          hasMod === mod &&
          hasShift === shift &&
          (mainKey === key || mainKey === e.key)
        ) {
          e.preventDefault();
          handler();
          return;
        }

        // G+key sequences (e.g. ["g", "d"])
        if (keys.length === 2 && keys[0] === "g" && !hasMod) {
          // handled by CommandPalette navigation — skip here
        }
      }
    },
    [shortcuts, handlers],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
