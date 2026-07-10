/**
 * KeyboardShortcutDialog — Full shortcut reference and customization
 */
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Keyboard, X, RotateCcw } from "lucide-react";
import { useShortcuts, useUpdateShortcut } from "../hooks/useKeyboardShortcuts";
import { useShortcutStore } from "../../../store/premium.store";
import type { KeyboardShortcut } from "@studio/types";

const formatKeys = (keys: string[]): string =>
  keys
    .map((k) => {
      if (k === "mod") return "⌘/Ctrl";
      if (k === "shift") return "⇧";
      if (k === "alt") return "⌥";
      return k.toUpperCase();
    })
    .join(" + ");

const KeyBadge: React.FC<{ label: string }> = ({ label }) => (
  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground shadow-sm">
    {label}
  </kbd>
);

const ShortcutRow: React.FC<{ shortcut: KeyboardShortcut }> = ({
  shortcut,
}) => {
  const updateShortcut = useUpdateShortcut();
  const effectiveKeys = shortcut.custom_keys ?? shortcut.default_keys;
  const isCustomized = !!shortcut.custom_keys;

  const handleReset = () => {
    updateShortcut.mutate({ actionId: shortcut.action_id, customKeys: null });
  };

  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-accent/50 transition-colors">
      <span className="text-sm text-foreground">{shortcut.label}</span>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {formatKeys(effectiveKeys)
            .split(" + ")
            .map((key, i) => (
              <KeyBadge key={i} label={key} />
            ))}
        </div>
        {isCustomized && (
          <button
            onClick={handleReset}
            className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
            title="Reset to default"
            aria-label={`Reset ${shortcut.label} to default`}
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
};

interface KeyboardShortcutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutDialog: React.FC<KeyboardShortcutDialogProps> = ({
  isOpen,
  onClose,
}) => {
  useShortcuts(); // ensures shortcuts are loaded
  const { shortcuts } = useShortcutStore();

  const grouped = React.useMemo(() => {
    const groups: Record<string, KeyboardShortcut[]> = {};
    shortcuts.forEach((sc) => {
      if (!groups[sc.category]) groups[sc.category] = [];
      groups[sc.category].push(sc);
    });
    return groups;
  }, [shortcuts]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-2xl"
            role="dialog"
            aria-label="Keyboard shortcuts"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground">
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded p-1 text-muted-foreground hover:bg-accent"
                aria-label="Close shortcuts dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Groups */}
            <div className="max-h-96 overflow-y-auto p-4 space-y-5 custom-scrollbar">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {category}
                  </p>
                  <div className="space-y-0.5">
                    {items.map((sc) => (
                      <ShortcutRow key={sc.id} shortcut={sc} />
                    ))}
                  </div>
                </div>
              ))}

              {shortcuts.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                  <Keyboard className="h-8 w-8 opacity-30" />
                  <p className="text-sm">Loading shortcuts…</p>
                </div>
              )}
            </div>

            <div className="border-t border-border px-5 py-3">
              <p className="text-[11px] text-muted-foreground">
                Hover over a customized shortcut and click the reset icon to
                restore its default.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
