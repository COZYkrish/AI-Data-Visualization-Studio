import { create } from "zustand";
import { Report, ExportJob, ExportFormat } from "@studio/types";

interface ReportState {
  reports: Report[];
  selectedTemplate: string | null;
  exportJobs: Record<string, ExportJob>; // key is job ID
  isGenerating: boolean;
  exportProgress: number;

  setReports: (reports: Report[]) => void;
  setSelectedTemplate: (template: string | null) => void;
  setExportJob: (job: ExportJob) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setExportProgress: (progress: number) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  selectedTemplate: null,
  exportJobs: {},
  isGenerating: false,
  exportProgress: 0,

  setReports: (reports) => set({ reports }),
  setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),
  setExportJob: (job) =>
    set((state) => ({
      exportJobs: { ...state.exportJobs, [job.id]: job },
    })),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setExportProgress: (exportProgress) => set({ exportProgress }),
}));
