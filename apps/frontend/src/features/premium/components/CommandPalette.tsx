/**
 * CommandPalette — Raycast/Linear-inspired command palette
 * Keyboard shortcut: Cmd/Ctrl+K
 */
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Database,
  BrainCircuit,
  BarChart2,
  FolderKanban,
  FileText,
  Settings,
  Upload,
  Bell,
  Moon,
  Sun,
  Search,
  ArrowRight,
  Star,
  Keyboard,
  Lightbulb,
  Activity,
} from "lucide-react";
import { useCommandPaletteStore } from "../../../store/premium.store";
import { useThemeStore } from "../../../store";

type PaletteItem = {
  id: string;
  label: string;
  description?: string;
  category: string;
  icon: React.ElementType;
  shortcut?: string[];
  action: () => void;
  keywords?: string[];
};

interface CommandPaletteProps {
  onThemeToggle?: () => void;
  onOpenNotifications?: () => void;
  onOpenShortcuts?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  onThemeToggle,
  onOpenNotifications,
  onOpenShortcuts,
}) => {
  const navigate = useNavigate();
  const { isOpen, query, close, setQuery } = useCommandPaletteStore();
  const { theme } = useThemeStore();
  const [selected, setSelected] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const items: PaletteItem[] = React.useMemo(
    () => [
      // Navigation
      {
        id: "nav-dashboard",
        label: "Go to Dashboard",
        category: "Navigation",
        icon: LayoutDashboard,
        keywords: ["home", "main"],
        action: () => navigate("/dashboard"),
      },
      {
        id: "nav-datasets",
        label: "Go to Datasets",
        category: "Navigation",
        icon: Database,
        keywords: ["data", "files"],
        action: () => navigate("/dashboard/datasets"),
      },
      {
        id: "nav-ml",
        label: "Go to ML Workspace",
        category: "Navigation",
        icon: BrainCircuit,
        keywords: ["machine learning", "ai", "model"],
        action: () => navigate("/dashboard/ml"),
      },
      {
        id: "nav-analytics",
        label: "Go to Analytics",
        category: "Navigation",
        icon: BarChart2,
        keywords: ["charts", "visualize"],
        action: () => navigate("/dashboard/analytics"),
      },
      {
        id: "nav-projects",
        label: "Go to Projects",
        category: "Navigation",
        icon: FolderKanban,
        keywords: ["workspace", "folders"],
        action: () => navigate("/dashboard/projects"),
      },
      {
        id: "nav-reports",
        label: "Go to Reports",
        category: "Navigation",
        icon: FileText,
        keywords: ["export", "pdf"],
        action: () => navigate("/dashboard/reports"),
      },
      {
        id: "nav-settings",
        label: "Go to Settings",
        category: "Navigation",
        icon: Settings,
        keywords: ["preferences", "profile"],
        action: () => navigate("/dashboard/settings"),
      },
      {
        id: "nav-saved",
        label: "View Saved Dashboards",
        category: "Navigation",
        icon: Star,
        keywords: ["favorites", "bookmarks"],
        action: () => navigate("/dashboard/saved"),
      },
      // Actions
      {
        id: "act-upload",
        label: "Upload Dataset",
        category: "Actions",
        icon: Upload,
        shortcut: ["⌘", "U"],
        keywords: ["import", "file", "csv"],
        action: () => navigate("/dashboard/datasets/upload"),
      },
      {
        id: "act-notifications",
        label: "Open Notifications",
        category: "Actions",
        icon: Bell,
        shortcut: ["⌘", "⇧", "N"],
        action: () => {
          onOpenNotifications?.();
          close();
        },
      },
      {
        id: "act-shortcuts",
        label: "View Keyboard Shortcuts",
        category: "Actions",
        icon: Keyboard,
        shortcut: ["?"],
        action: () => {
          onOpenShortcuts?.();
          close();
        },
      },
      {
        id: "act-theme",
        label: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
        category: "Actions",
        icon: theme === "dark" ? Sun : Moon,
        shortcut: ["⌘", "⇧", "T"],
        keywords: ["appearance", "theme", "dark", "light"],
        action: () => {
          onThemeToggle?.();
          close();
        },
      },
      {
        id: "act-activity",
        label: "View Activity Log",
        category: "Actions",
        icon: Activity,
        keywords: ["history", "log", "audit"],
        action: () => navigate("/dashboard/settings"),
      },
      {
        id: "act-suggestions",
        label: "View Suggestions",
        category: "Actions",
        icon: Lightbulb,
        keywords: ["recommendations", "ai", "hints"],
        action: () => navigate("/dashboard"),
      },
    ],
    [
      navigate,
      theme,
      onThemeToggle,
      onOpenNotifications,
      onOpenShortcuts,
      close,
    ],
  );

  const filtered = React.useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords?.some((kw) => kw.includes(q)),
    );
  }, [items, query]);

  const grouped = React.useMemo(() => {
    const groups: Record<string, PaletteItem[]> = {};
    filtered.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filtered]);

  const flatFiltered = React.useMemo(
    () => Object.values(grouped).flat(),
    [grouped],
  );

  React.useEffect(() => {
    if (isOpen) {
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  React.useEffect(() => {
    setSelected(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, flatFiltered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      flatFiltered[selected]?.action();
      close();
    } else if (e.key === "Escape") {
      close();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2 rounded-2xl border border-border bg-card shadow-2xl"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands, navigate, take action…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                aria-label="Command palette search"
                role="combobox"
                aria-expanded="true"
                aria-haspopup="listbox"
              />
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="max-h-80 overflow-y-auto py-2 custom-scrollbar"
              role="listbox"
              aria-label="Command palette results"
            >
              {flatFiltered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                  <Search className="h-8 w-8 opacity-30" />
                  <p className="text-sm">No results for "{query}"</p>
                </div>
              ) : (
                Object.entries(grouped).map(([category, groupItems]) => (
                  <div key={category}>
                    <div className="px-4 py-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {category}
                      </span>
                    </div>
                    {groupItems.map((item) => {
                      const globalIdx = flatFiltered.indexOf(item);
                      const isSelected = globalIdx === selected;
                      return (
                        <button
                          key={item.id}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            item.action();
                            close();
                          }}
                          onMouseEnter={() => setSelected(globalIdx)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-accent"
                          }`}
                        >
                          <item.icon className="h-4 w-4 shrink-0 opacity-70" />
                          <span className="flex-1 text-sm">{item.label}</span>
                          {item.shortcut && (
                            <div className="flex items-center gap-0.5">
                              {item.shortcut.map((key, i) => (
                                <kbd
                                  key={i}
                                  className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] text-muted-foreground"
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          )}
                          {isSelected && (
                            <ArrowRight className="h-3 w-3 opacity-50" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-4 py-2">
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>
                  <kbd className="rounded bg-muted px-1">↑↓</kbd> Navigate
                </span>
                <span>
                  <kbd className="rounded bg-muted px-1">↵</kbd> Select
                </span>
                <span>
                  <kbd className="rounded bg-muted px-1">ESC</kbd> Close
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {flatFiltered.length} result
                {flatFiltered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
