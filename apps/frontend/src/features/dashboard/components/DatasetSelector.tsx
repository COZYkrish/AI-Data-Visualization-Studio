/**
 * DatasetSelector — Dropdown to switch the active dataset
 */
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../api/client";
import { APIResponse } from "@studio/types";
import { useDashboardStore } from "../../../store/dashboard.store";
import { ChevronDown, Database, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DatasetItem {
  id: string;
  original_filename: string;
  upload_status: string;
  row_count?: number;
  column_count?: number;
}

interface PaginatedResponse {
  items: DatasetItem[];
  total: number;
}

export const DatasetSelector: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const selectedDatasetId = useDashboardStore((s) => s.selectedDatasetId);
  const setSelectedDataset = useDashboardStore((s) => s.setSelectedDataset);

  const { data } = useQuery({
    queryKey: ["datasets-list"],
    queryFn: async () => {
      const res =
        await apiClient.get<APIResponse<PaginatedResponse>>(
          "/datasets?limit=50",
        );
      return res.data.data?.items ?? [];
    },
    staleTime: 60_000,
  });

  const datasets = data ?? [];
  const ready = datasets.filter((d) => d.upload_status === "ready");
  const selected = ready.find((d) => d.id === selectedDatasetId);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium shadow-sm hover:border-primary/50 hover:bg-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select dataset"
      >
        <Database className="h-4 w-4 text-primary shrink-0" />
        <span className="max-w-[180px] truncate text-foreground">
          {selected?.original_filename ?? "Select Dataset…"}
        </span>
        {selected && (
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">
            {selected.row_count?.toLocaleString()} rows
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-[calc(100%+6px)] z-50 w-80 rounded-2xl border border-border bg-card shadow-xl overflow-hidden"
            role="listbox"
            aria-label="Available datasets"
          >
            <div className="p-2">
              {ready.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No ready datasets. Upload one first.
                </p>
              ) : (
                ready.map((d) => (
                  <button
                    key={d.id}
                    role="option"
                    aria-selected={d.id === selectedDatasetId}
                    onClick={() => {
                      setSelectedDataset(d.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      d.id === selectedDatasetId
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent text-foreground"
                    }`}
                  >
                    <Database className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">
                        {d.original_filename}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {d.row_count?.toLocaleString() ?? "—"} rows ·{" "}
                        {d.column_count ?? "—"} cols
                      </p>
                    </div>
                    {d.id === selectedDatasetId && (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
