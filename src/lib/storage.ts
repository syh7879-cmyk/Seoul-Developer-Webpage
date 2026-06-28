import type { SavedProject } from '@/src/types/project';

const STORAGE_KEY = 'redevelopment-virtual-merge-projects';

const isBrowser = () => typeof window !== 'undefined' && Boolean(window.localStorage);

export const createProjectId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getSavedProjects = (): SavedProject[] => {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveProject = (project: SavedProject): void => {
  if (!isBrowser()) return;

  const projects = getSavedProjects();
  const now = new Date().toISOString();
  const existing = projects.find((item) => item.projectId === project.projectId);
  const normalizedProject: SavedProject = {
    ...project,
    createdAt: existing?.createdAt ?? project.createdAt,
    updatedAt: now,
  };
  const nextProjects = [normalizedProject, ...projects.filter((item) => item.projectId !== project.projectId)];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));
};

export const loadProject = (projectId: string): SavedProject | null => {
  const projects = getSavedProjects();
  return projects.find((project) => project.projectId === projectId) ?? null;
};

export const deleteProject = (projectId: string): void => {
  if (!isBrowser()) return;

  const nextProjects = getSavedProjects().filter((project) => project.projectId !== projectId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));
};

export const clearAllProjects = (): void => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
};
