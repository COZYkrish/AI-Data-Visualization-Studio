/**
 * ML Zustand Store — Phase 7
 *
 * Tracks the complete ML workspace state:
 *   - Current wizard step and selections
 *   - Training state and progress
 *   - Active model and evaluation data
 *   - Prediction and forecast results
 *   - Saved models list
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  EvaluationResult,
  ForecastData,
  MLAlgorithm,
  MLModel,
  ModelRecommendation,
  PredictionResult,
  WizardState,
  WizardStep,
} from "../features/machine-learning/types";

// ── Store Shape ─────────────────────────────────────────────────────────────

export interface MLStoreState {
  // Wizard navigation
  wizardState: WizardState;

  // Active model (just trained or selected from history)
  activeModel: MLModel | null;

  // Training state
  isTraining: boolean;
  trainingError: string | null;

  // Results
  evaluationResults: EvaluationResult[];
  predictionResult: PredictionResult | null;
  forecastResult: ForecastData | null;

  // Saved models
  savedModels: MLModel[];

  // Recommendations
  recommendations: ModelRecommendation[];

  // ── Actions ───────────────────────────────────────────────────────────────
  setWizardStep: (step: WizardStep) => void;
  setDatasetId: (id: string | null) => void;
  setTargetColumn: (col: string | null) => void;
  setFeatureColumns: (cols: string[]) => void;
  setAlgorithm: (algo: MLAlgorithm | null) => void;
  setModelName: (name: string) => void;
  setHyperparameter: (key: string, value: unknown) => void;
  setTestSize: (size: number) => void;
  setIsForecast: (v: boolean) => void;
  setDateColumn: (col: string | null) => void;
  setValueColumn: (col: string | null) => void;
  setForecastHorizon: (h: number) => void;

  setActiveModel: (model: MLModel | null) => void;
  setIsTraining: (v: boolean) => void;
  setTrainingError: (err: string | null) => void;
  setEvaluationResults: (results: EvaluationResult[]) => void;
  setPredictionResult: (result: PredictionResult | null) => void;
  setForecastResult: (result: ForecastData | null) => void;
  setSavedModels: (models: MLModel[]) => void;
  setRecommendations: (recs: ModelRecommendation[]) => void;

  resetWizard: () => void;
  reset: () => void;
}

// ── Default Wizard State ────────────────────────────────────────────────────

const defaultWizard: WizardState = {
  step: "dataset",
  datasetId: null,
  targetColumn: null,
  featureColumns: [],
  algorithm: null,
  hyperparameters: {},
  modelName: "",
  testSize: 0.2,
  randomState: 42,
  isForecast: false,
  dateColumn: null,
  valueColumn: null,
  forecastHorizon: 30,
};

// ── Store ───────────────────────────────────────────────────────────────────

export const useMLStore = create<MLStoreState>()(
  persist(
    (set) => ({
      wizardState: defaultWizard,
      activeModel: null,
      isTraining: false,
      trainingError: null,
      evaluationResults: [],
      predictionResult: null,
      forecastResult: null,
      savedModels: [],
      recommendations: [],

      // Wizard field setters
      setWizardStep: (step) =>
        set((s) => ({ wizardState: { ...s.wizardState, step } })),
      setDatasetId: (id) =>
        set((s) => ({ wizardState: { ...s.wizardState, datasetId: id } })),
      setTargetColumn: (col) =>
        set((s) => ({ wizardState: { ...s.wizardState, targetColumn: col } })),
      setFeatureColumns: (cols) =>
        set((s) => ({
          wizardState: { ...s.wizardState, featureColumns: cols },
        })),
      setAlgorithm: (algo) =>
        set((s) => ({ wizardState: { ...s.wizardState, algorithm: algo } })),
      setModelName: (name) =>
        set((s) => ({ wizardState: { ...s.wizardState, modelName: name } })),
      setHyperparameter: (key, value) =>
        set((s) => ({
          wizardState: {
            ...s.wizardState,
            hyperparameters: { ...s.wizardState.hyperparameters, [key]: value },
          },
        })),
      setTestSize: (size) =>
        set((s) => ({ wizardState: { ...s.wizardState, testSize: size } })),
      setIsForecast: (v) =>
        set((s) => ({ wizardState: { ...s.wizardState, isForecast: v } })),
      setDateColumn: (col) =>
        set((s) => ({ wizardState: { ...s.wizardState, dateColumn: col } })),
      setValueColumn: (col) =>
        set((s) => ({ wizardState: { ...s.wizardState, valueColumn: col } })),
      setForecastHorizon: (h) =>
        set((s) => ({ wizardState: { ...s.wizardState, forecastHorizon: h } })),

      // Global state setters
      setActiveModel: (model) => set({ activeModel: model }),
      setIsTraining: (v) => set({ isTraining: v }),
      setTrainingError: (err) => set({ trainingError: err }),
      setEvaluationResults: (results) => set({ evaluationResults: results }),
      setPredictionResult: (result) => set({ predictionResult: result }),
      setForecastResult: (result) => set({ forecastResult: result }),
      setSavedModels: (models) => set({ savedModels: models }),
      setRecommendations: (recs) => set({ recommendations: recs }),

      resetWizard: () =>
        set({
          wizardState: defaultWizard,
          trainingError: null,
          isTraining: false,
        }),

      reset: () =>
        set({
          wizardState: defaultWizard,
          activeModel: null,
          isTraining: false,
          trainingError: null,
          evaluationResults: [],
          predictionResult: null,
          forecastResult: null,
          recommendations: [],
        }),
    }),
    {
      name: "studio-ml",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        wizardState: s.wizardState,
        activeModel: s.activeModel,
      }),
    },
  ),
);
