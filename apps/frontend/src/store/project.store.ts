import { create } from "zustand";
import { Project, ProjectSnapshot } from "@studio/types";

interface ProjectState {
  currentProject: Project | null;
  savedProjects: Project[];
  recentProjects: Project[];
  favoriteProjects: Project[];
  snapshots: ProjectSnapshot[];
  isLoading: boolean;
  error: string | null;

  setCurrentProject: (project: Project | null) => void;
  setSavedProjects: (projects: Project[]) => void;
  setRecentProjects: (projects: Project[]) => void;
  setFavoriteProjects: (projects: Project[]) => void;
  setSnapshots: (snapshots: ProjectSnapshot[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  savedProjects: [],
  recentProjects: [],
  favoriteProjects: [],
  snapshots: [],
  isLoading: false,
  error: null,

  setCurrentProject: (project) => set({ currentProject: project }),
  setSavedProjects: (projects) => set({ savedProjects: projects }),
  setRecentProjects: (projects) => set({ recentProjects: projects }),
  setFavoriteProjects: (projects) => set({ favoriteProjects: projects }),
  setSnapshots: (snapshots) => set({ snapshots }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
