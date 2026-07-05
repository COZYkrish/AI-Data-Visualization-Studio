/**
 * FilterPanel — Reusable filter engine for the dashboard
 * Supports: text, numeric, date, category, boolean, multi-select filters
 */
import * as React from "react";
import { X, Plus, Filter, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardFilters } from "../hooks";
import type {
  FilterCondition,
  FilterOperator,
  DatasetStatistics,
} from "../types";

interface Props {
  statistics?: DatasetStatistics | null;
}

const OPERATORS_BY_TYPE: Record<
  string,
  { value: FilterOperator; label: string }[]
> = {
  numeric: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not equals" },
    { value: "greater_than", label: "Greater than" },
    { value: "less_than", label: "Less than" },
    { value: "between", label: "Between" },
    { value: "is_null", label: "Is empty" },
    { value: "is_not_null", label: "Is not empty" },
  ],
  categorical: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not equals" },
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Not contains" },
    { value: "in", label: "Is one of" },
    { value: "is_null", label: "Is empty" },
    { value: "is_not_null", label: "Is not empty" },
  ],
  datetime: [
    { value: "greater_than", label: "After" },
    { value: "less_than", label: "Before" },
    { value: "between", label: "Between" },
    { value: "is_null", label: "Is empty" },
  ],
  default: [
    { value: "equals", label: "Equals" },
    { value: "contains", label: "Contains" },
    { value: "is_null", label: "Is empty" },
    { value: "is_not_null", label: "Is not empty" },
  ],
};

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export const FilterPanel: React.FC<Props> = ({ statistics }) => {
  const { activeFilters, addFilter, removeFilter, clearFilters } =
    useDashboardFilters();
  const [isOpen, setIsOpen] = React.useState(false);
  const [newFilter, setNewFilter] = React.useState<Partial<FilterCondition>>(
    {},
  );

  const columns = statistics?.columns ?? [];
  const dataTypes = statistics?.data_types ?? {};

  const getOperators = (col: string) => {
    const t = dataTypes[col] ?? "default";
    return OPERATORS_BY_TYPE[t] ?? OPERATORS_BY_TYPE.default;
  };

  const handleAddFilter = () => {
    if (!newFilter.column || !newFilter.operator) return;
    addFilter({
      ...newFilter,
      id: generateId(),
    } as FilterCondition);
    setNewFilter({});
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Filters</span>
          {activeFilters.length > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeFilters.length}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-4 space-y-4">
              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Active Filters
                    </p>
                    <button
                      onClick={clearFilters}
                      className="text-xs text-destructive hover:underline"
                      aria-label="Clear all filters"
                    >
                      Clear all
                    </button>
                  </div>
                  {activeFilters.map((f: FilterCondition) => (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-sm"
                    >
                      <span className="font-medium text-primary truncate flex-1">
                        {f.column}{" "}
                        <span className="text-muted-foreground font-normal">
                          {f.operator}
                        </span>{" "}
                        {Array.isArray(f.value)
                          ? f.value.join(", ")
                          : String(f.value ?? "")}
                      </span>
                      <button
                        onClick={() => removeFilter(f.id)}
                        className="ml-auto shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={`Remove filter on ${f.column}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Add Filter Form */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Add Filter
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {/* Column */}
                  <select
                    value={newFilter.column ?? ""}
                    onChange={(e) =>
                      setNewFilter({
                        column: e.target.value,
                        operator: undefined,
                        value: undefined,
                      })
                    }
                    className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    aria-label="Filter column"
                  >
                    <option value="">Select column…</option>
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  {/* Operator */}
                  <select
                    value={newFilter.operator ?? ""}
                    onChange={(e) =>
                      setNewFilter((f) => ({
                        ...f,
                        operator: e.target.value as FilterOperator,
                        value: undefined,
                      }))
                    }
                    disabled={!newFilter.column}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                    aria-label="Filter operator"
                  >
                    <option value="">Operator…</option>
                    {newFilter.column &&
                      getOperators(newFilter.column).map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                  </select>

                  {/* Value */}
                  {newFilter.operator &&
                    !["is_null", "is_not_null"].includes(
                      newFilter.operator,
                    ) && (
                      <input
                        type={
                          dataTypes[newFilter.column ?? ""] === "numeric"
                            ? "number"
                            : "text"
                        }
                        value={
                          newFilter.value != null ? String(newFilter.value) : ""
                        }
                        onChange={(e) =>
                          setNewFilter((prev: Partial<FilterCondition>) => ({
                            ...prev,
                            value: e.target.value,
                          }))
                        }
                        placeholder="Value…"
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        aria-label="Filter value"
                      />
                    )}
                </div>

                <button
                  onClick={handleAddFilter}
                  disabled={!newFilter.column || !newFilter.operator}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Add filter"
                >
                  <Plus className="h-4 w-4" />
                  Add Filter
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
