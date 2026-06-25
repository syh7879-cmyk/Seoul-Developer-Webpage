import type { ParcelFeature } from '@/src/types/parcel';

export interface FeasibilityInputs {
  floorAreaRatio: number;
  averageHouseArea: number;
  expectedSalePrice: number;
  constructionCostPerSqm: number;
  otherCostRatio: number;
}

export interface ProjectRecord {
  projectId: string;
  projectName: string;
  createdAt: string;
  selectedParcelIds: string[];
  feasibilityInputs: FeasibilityInputs;
  feasibilityResults: Record<string, number | string | Record<string, number>>;
  virtualMergeSummary: string;
}

const STORAGE_KEY = 'regularization-lab-projects';

export const loadProjects = (): ProjectRecord[] => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const saveProject = (project: ProjectRecord) => {
  if (typeof window === 'undefined') return;
  const projects = loadProjects();
  const nextProjects = [project, ...projects.filter((item) => item.projectId !== project.projectId)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));
};

export const deleteProject = (projectId: string) => {
  if (typeof window === 'undefined') return;
  const projects = loadProjects();
  const nextProjects = projects.filter((item) => item.projectId !== projectId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));
};

export const createProjectRecord = (
  projectName: string,
  selectedParcels: ParcelFeature[],
  feasibilityInputs: FeasibilityInputs,
  feasibilityResults: Record<string, number | string | Record<string, number>>,
  virtualMergeSummary: string,
): ProjectRecord => ({
  projectId: `project-${Date.now()}`,
  projectName,
  createdAt: new Date().toISOString(),
  selectedParcelIds: selectedParcels.map((parcel) => parcel.id),
  feasibilityInputs,
  feasibilityResults,
  virtualMergeSummary,
});
