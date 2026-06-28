import type { FeasibilityInputs, FeasibilityResults } from '@/src/types/feasibility';
import type { VirtualMergeGrade } from '@/src/lib/calculations';

export type ProjectVirtualMergeSummary = {
  selectedParcelCount: number;
  totalAreaSqm: number;
  averageLandPricePerSqm: number;
  totalOfficialLandValue: number;
  landUseSummary: string;
  averageBuildingAge: number;
  oldBuildingRatio: number;
  roadAccessSummary: string;
  zoneInclusionRatio: number;
  continuityStatus: string;
  virtualMergeGrade: VirtualMergeGrade;
};

export type SavedProject = {
  projectId: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
  selectedParcelIds: string[];
  selectedZoneId?: string;
  feasibilityInputs: FeasibilityInputs;
  feasibilityResults: FeasibilityResults;
  virtualMergeSummary: ProjectVirtualMergeSummary;
};
