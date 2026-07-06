import { create } from "zustand";

interface AnalyticsState {
  activeTab:
    | "overview"
    | "correlations"
    | "distributions"
    | "trends"
    | "outliers"
    | "insights";
  selectedInsightId: string | null;
  selectedColumn: string | null;

  setActiveTab: (
    tab:
      | "overview"
      | "correlations"
      | "distributions"
      | "trends"
      | "outliers"
      | "insights",
  ) => void;
  setSelectedInsightId: (id: string | null) => void;
  setSelectedColumn: (column: string | null) => void;
  reset: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  activeTab: "overview",
  selectedInsightId: null,
  selectedColumn: null,

  setActiveTab: (tab) =>
    set({ activeTab: tab, selectedInsightId: null, selectedColumn: null }),
  setSelectedInsightId: (id) => set({ selectedInsightId: id }),
  setSelectedColumn: (column) => set({ selectedColumn: column }),

  reset: () =>
    set({
      activeTab: "overview",
      selectedInsightId: null,
      selectedColumn: null,
    }),
}));
