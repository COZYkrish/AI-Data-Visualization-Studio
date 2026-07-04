import { create } from "zustand";
import { Dataset, DatasetSummary, DatasetPreview } from "../types";

interface DatasetState {
  currentUploads: File[];
  uploadQueue: File[];
  uploadProgress: Record<string, number>;
  processingState: Record<string, string>;
  validationErrors: Record<string, string>;
  selectedDataset: Dataset | null;

  // Actions
  addUpload: (file: File) => void;
  setUploadProgress: (filename: string, progress: number) => void;
  setProcessingState: (filename: string, state: string) => void;
  setValidationError: (filename: string, error: string) => void;
  removeUpload: (filename: string) => void;
  setSelectedDataset: (dataset: Dataset | null) => void;
  clearUploads: () => void;
}

export const useDatasetStore = create<DatasetState>((set) => ({
  currentUploads: [],
  uploadQueue: [],
  uploadProgress: {},
  processingState: {},
  validationErrors: {},
  selectedDataset: null,

  addUpload: (file) =>
    set((state) => ({
      currentUploads: [...state.currentUploads, file],
      uploadProgress: { ...state.uploadProgress, [file.name]: 0 },
      processingState: { ...state.processingState, [file.name]: "uploading" },
    })),

  setUploadProgress: (filename, progress) =>
    set((state) => ({
      uploadProgress: { ...state.uploadProgress, [filename]: progress },
    })),

  setProcessingState: (filename, processingState) =>
    set((state) => ({
      processingState: {
        ...state.processingState,
        [filename]: processingState,
      },
    })),

  setValidationError: (filename, error) =>
    set((state) => ({
      validationErrors: { ...state.validationErrors, [filename]: error },
    })),

  removeUpload: (filename) =>
    set((state) => {
      const newUploads = state.currentUploads.filter(
        (f) => f.name !== filename,
      );
      const newProgress = { ...state.uploadProgress };
      delete newProgress[filename];

      return {
        currentUploads: newUploads,
        uploadProgress: newProgress,
      };
    }),

  setSelectedDataset: (dataset) => set({ selectedDataset: dataset }),

  clearUploads: () =>
    set({
      currentUploads: [],
      uploadQueue: [],
      uploadProgress: {},
      processingState: {},
      validationErrors: {},
    }),
}));
