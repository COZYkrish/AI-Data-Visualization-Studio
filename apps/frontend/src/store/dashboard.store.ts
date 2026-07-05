/**
 * Dashboard Zustand Store — Phase 5: Dashboard & Visualization Engine
 *
 * Tracks selected dataset, filters, chart settings, sorting, pagination,
 * layout, and favorite charts. Persisted to sessionStorage for the session.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  DashboardState,
  FilterCondition,
  ChartSettings,
} from "../features/dashboard/types";

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      // ── State ─────────────────────────────────────────────────────────────
      selectedDatasetId: null,
      activeFilters: [],
      chartSettings: null,
      isSidebarOpen: true,
      isFullscreen: false,
      favoriteCharts: [],
      sortBy: null,
      sortOrder: "asc",
      searchQuery: "",
      currentPage: 1,
      pageSize: 50,

      // ── Actions ───────────────────────────────────────────────────────────
      setSelectedDataset: (id) =>
        set({
          selectedDatasetId: id,
          activeFilters: [],
          sortBy: null,
          searchQuery: "",
          currentPage: 1,
          chartSettings: null,
        }),

      addFilter: (filter: FilterCondition) =>
        set((state) => ({
          activeFilters: [...state.activeFilters, filter],
          currentPage: 1,
        })),

      removeFilter: (id: string) =>
        set((state) => ({
          activeFilters: state.activeFilters.filter((f) => f.id !== id),
          currentPage: 1,
        })),

      clearFilters: () => set({ activeFilters: [], currentPage: 1 }),

      setChartSettings: (settings) => set({ chartSettings: settings }),

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setFullscreen: (v) => set({ isFullscreen: v }),

      addFavoriteChart: (chart: ChartSettings) =>
        set((state) => ({
          favoriteCharts: [chart, ...state.favoriteCharts.slice(0, 9)],
        })),

      removeFavoriteChart: (index: number) =>
        set((state) => ({
          favoriteCharts: state.favoriteCharts.filter((_, i) => i !== index),
        })),

      setSortBy: (col) => set({ sortBy: col, currentPage: 1 }),

      setSortOrder: (order) => set({ sortOrder: order, currentPage: 1 }),

      setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1 }),

      setCurrentPage: (p) => set({ currentPage: p }),

      setPageSize: (s) => set({ pageSize: s, currentPage: 1 }),

      resetDashboard: () =>
        set({
          selectedDatasetId: null,
          activeFilters: [],
          chartSettings: null,
          sortBy: null,
          sortOrder: "asc",
          searchQuery: "",
          currentPage: 1,
        }),
    }),
    {
      name: "studio-dashboard",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        selectedDatasetId: state.selectedDatasetId,
        favoriteCharts: state.favoriteCharts,
        pageSize: state.pageSize,
        isSidebarOpen: state.isSidebarOpen,
      }),
    },
  ),
);
