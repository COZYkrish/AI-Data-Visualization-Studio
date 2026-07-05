/**
 * DatasetExplorer — Virtualized, interactive table for exploring dataset rows
 * Supports: search, sorting, pagination, column visibility, sticky header
 */
import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useDashboardStore } from "../../../store/dashboard.store";
import { useDashboardQuery } from "../hooks";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorState } from "./ErrorState";
import type { DashboardQueryRequest } from "../types";

interface Props {
  datasetId: string;
}

const PAGE_SIZES = [25, 50, 100, 200];

export const DatasetExplorer: React.FC<Props> = ({ datasetId }) => {
  const activeFilters = useDashboardStore((s) => s.activeFilters);
  const sortBy = useDashboardStore((s) => s.sortBy);
  const sortOrder = useDashboardStore((s) => s.sortOrder);
  const searchQuery = useDashboardStore((s) => s.searchQuery);
  const currentPage = useDashboardStore((s) => s.currentPage);
  const pageSize = useDashboardStore((s) => s.pageSize);
  const setSortBy = useDashboardStore((s) => s.setSortBy);
  const setSortOrder = useDashboardStore((s) => s.setSortOrder);
  const setSearchQuery = useDashboardStore((s) => s.setSearchQuery);
  const setCurrentPage = useDashboardStore((s) => s.setCurrentPage);
  const setPageSize = useDashboardStore((s) => s.setPageSize);

  const [debouncedSearch, setDebouncedSearch] = React.useState(searchQuery);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const queryParams: DashboardQueryRequest = {
    dataset_id: datasetId,
    filters: activeFilters.map(({ id: _, ...rest }) => rest),
    sort_by: sortBy ?? undefined,
    sort_order: sortOrder,
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, error } = useDashboardQuery(queryParams);

  const columns = data?.columns ?? [];
  const rows = data?.rows ?? [];
  const totalRows = data?.total_rows ?? 0;
  const totalPages = data?.total_pages ?? 1;

  // Column visibility
  const [hiddenCols] = React.useState<Set<string>>(new Set());
  const visibleCols = columns.filter((c: string) => !hiddenCols.has(c));

  // Virtualizer for the rows
  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 10,
  });

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    );
  };

  if (error) return <ErrorState message="Failed to load dataset rows" />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
      aria-label="Dataset explorer"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all columns…"
            className="w-full rounded-lg border border-border bg-background pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Search dataset"
          />
        </div>

        {/* Page size */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs focus:outline-none"
            aria-label="Rows per page"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        {data && (
          <span className="text-xs text-muted-foreground">
            {totalRows.toLocaleString()} rows · {visibleCols.length} cols ·{" "}
            {data.query_time_ms}ms
          </span>
        )}
      </div>

      {/* Table */}
      <div
        ref={parentRef}
        className="overflow-auto flex-1"
        style={{ maxHeight: 420 }}
        role="region"
        aria-label="Dataset table"
      >
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-8 rounded-lg" />
            ))}
          </div>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border">
                <th className="w-10 px-3 py-2.5 text-center font-semibold text-muted-foreground">
                  #
                </th>
                {visibleCols.map((col: string) => (
                  <th
                    key={col}
                    className="min-w-[120px] px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap"
                  >
                    <button
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                      onClick={() => handleSort(col)}
                      aria-label={`Sort by ${col}`}
                    >
                      <span className="truncate max-w-[140px]">{col}</span>
                      <SortIcon col={col} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((vRow) => {
                const row = rows[vRow.index];
                if (!row) return null;
                return (
                  <tr
                    key={vRow.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${vRow.size}px`,
                      transform: `translateY(${vRow.start}px)`,
                    }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2 text-center text-muted-foreground/60 select-none">
                      {(currentPage - 1) * pageSize + vRow.index + 1}
                    </td>
                    {visibleCols.map((col: string) => (
                      <td key={col} className="px-3 py-2 max-w-[200px]">
                        <span className="block truncate">
                          {row[col] == null ? (
                            <span className="text-muted-foreground/40 italic">
                              null
                            </span>
                          ) : (
                            String(row[col])
                          )}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </motion.div>
  );
};
