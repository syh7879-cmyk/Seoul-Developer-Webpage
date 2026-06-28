import type { ParcelFeature } from '@/src/types/parcel';
import type { ZoneFeature } from '@/src/types/zone';
import type { FeasibilityInputs, FeasibilityResults } from '@/src/types/feasibility';
import type { ProjectVirtualMergeSummary } from '@/src/types/project';
import { calculateZoneInclusionRatio, checkParcelContinuity } from '@/src/lib/geo';

export type VirtualMergeGrade = '양호' | '주의' | '위험' | '행정검토 필요';

export interface ZoneInclusionSummary {
  insideCount: number;
  outsideCount: number;
  ratio: number;
  hasOutsideParcel: boolean;
}

export interface VirtualMergeSummary {
  parcelCount: number;
  selectedParcels: ParcelFeature[];
  totalArea: number;
  averageLandPrice: number;
  totalOfficialLandValue: number;
  landUseZones: Record<string, number>;
  mixedLandUseZones: boolean;
  averageBuildingAge: number;
  oldBuildingRatio: number;
  roadAccess: Record<string, number>;
  roadAccessWarning: boolean;
  hasNoRoadAccess: boolean;
  zoneInclusion: ZoneInclusionSummary;
  isContinuous: boolean;
  grade: VirtualMergeGrade;
}

export const defaultFeasibilityInputs: FeasibilityInputs = {
  appliedFar: 200,
  averageUnitAreaSqm: 84,
  expectedSalePricePerSqm: 15000000,
  constructionCostPerSqm: 3000000,
  otherCostRatio: 20,
};

const normalizePositiveNumber = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);

export const calculateTotalArea = (parcels: ParcelFeature[]) =>
  parcels.reduce((sum, parcel) => sum + parcel.areaSqm, 0);

export const calculateAverageLandPrice = (parcels: ParcelFeature[]) => {
  if (!parcels.length) return 0;
  const total = parcels.reduce((sum, parcel) => sum + parcel.officialLandPricePerSqm, 0);
  return total / parcels.length;
};

export const calculateTotalOfficialLandValue = (parcels: ParcelFeature[]) =>
  parcels.reduce((sum, parcel) => sum + parcel.areaSqm * parcel.officialLandPricePerSqm, 0);

export const summarizeLandUseZones = (parcels: ParcelFeature[]) => {
  const summary: Record<string, number> = {};
  parcels.forEach((parcel) => {
    summary[parcel.landUseZone] = (summary[parcel.landUseZone] ?? 0) + 1;
  });
  return summary;
};

export const hasMixedLandUseZones = (parcels: ParcelFeature[]) =>
  Object.keys(summarizeLandUseZones(parcels)).length > 1;

export const calculateAverageBuildingAge = (parcels: ParcelFeature[]) => {
  if (!parcels.length) return 0;
  const total = parcels.reduce((sum, parcel) => sum + parcel.buildingAge, 0);
  return total / parcels.length;
};

export const calculateOldBuildingRatio = (parcels: ParcelFeature[], thresholdYears = 30) => {
  if (!parcels.length) return 0;
  const oldCount = parcels.filter((parcel) => parcel.buildingAge >= thresholdYears).length;
  return (oldCount / parcels.length) * 100;
};

export const summarizeRoadAccess = (parcels: ParcelFeature[]) => {
  const summary: Record<string, number> = {};
  parcels.forEach((parcel) => {
    summary[parcel.roadAccess] = (summary[parcel.roadAccess] ?? 0) + 1;
  });
  return summary;
};

export const hasRoadAccessWarning = (parcels: ParcelFeature[]) => {
  const roadSummary = summarizeRoadAccess(parcels);
  return (roadSummary['미접'] ?? 0) > 0 || (roadSummary['약함'] ?? 0) > 0;
};

export const calculateZoneInclusionSummary = (parcels: ParcelFeature[], selectedZone?: ZoneFeature | null): ZoneInclusionSummary => {
  const insideCount = parcels.filter((parcel) => parcel.isInsideZone).length;
  const outsideCount = parcels.length - insideCount;

  return {
    insideCount,
    outsideCount,
    ratio: calculateZoneInclusionRatio(parcels, selectedZone),
    hasOutsideParcel: outsideCount > 0,
  };
};

export const gradeVirtualMerge = (summary: Omit<VirtualMergeSummary, 'grade'>): VirtualMergeGrade => {
  if (!summary.parcelCount) return '행정검토 필요';
  if (summary.hasNoRoadAccess || summary.zoneInclusion.ratio < 50 || !summary.isContinuous) return '위험';
  if (summary.parcelCount < 2) return '행정검토 필요';
  if (summary.mixedLandUseZones || summary.roadAccessWarning || summary.zoneInclusion.hasOutsideParcel || summary.zoneInclusion.ratio < 80) return '주의';

  const oldBuildingCondition = summary.oldBuildingRatio >= 30;
  const simpleLandUseCondition = !summary.mixedLandUseZones;
  const roadCondition = !summary.roadAccessWarning;

  if (summary.zoneInclusion.ratio >= 80 && oldBuildingCondition && simpleLandUseCondition && roadCondition) return '양호';

  return '주의';
};

export const calculateVirtualMergeSummary = (parcels: ParcelFeature[], selectedZone?: ZoneFeature | null): VirtualMergeSummary => {
  const roadAccess = summarizeRoadAccess(parcels);
  const summaryWithoutGrade: Omit<VirtualMergeSummary, 'grade'> = {
    parcelCount: parcels.length,
    selectedParcels: parcels,
    totalArea: calculateTotalArea(parcels),
    averageLandPrice: calculateAverageLandPrice(parcels),
    totalOfficialLandValue: calculateTotalOfficialLandValue(parcels),
    landUseZones: summarizeLandUseZones(parcels),
    mixedLandUseZones: hasMixedLandUseZones(parcels),
    averageBuildingAge: calculateAverageBuildingAge(parcels),
    oldBuildingRatio: calculateOldBuildingRatio(parcels),
    roadAccess,
    roadAccessWarning: hasRoadAccessWarning(parcels),
    hasNoRoadAccess: (roadAccess['미접'] ?? 0) > 0,
    zoneInclusion: calculateZoneInclusionSummary(parcels, selectedZone),
    isContinuous: checkParcelContinuity(parcels),
  };

  return {
    ...summaryWithoutGrade,
    grade: gradeVirtualMerge(summaryWithoutGrade),
  };
};

export const calculateFeasibility = (totalLandAreaSqm: number, inputs: FeasibilityInputs): FeasibilityResults => {
  const totalLandArea = normalizePositiveNumber(totalLandAreaSqm);
  const appliedFar = normalizePositiveNumber(inputs.appliedFar);
  const averageUnitAreaSqm = normalizePositiveNumber(inputs.averageUnitAreaSqm);
  const expectedSalePricePerSqm = normalizePositiveNumber(inputs.expectedSalePricePerSqm);
  const constructionCostPerSqm = normalizePositiveNumber(inputs.constructionCostPerSqm);
  const otherCostRatio = normalizePositiveNumber(inputs.otherCostRatio);

  if (totalLandArea === 0) {
    return {
      totalLandAreaSqm: 0,
      expectedGfaSqm: 0,
      expectedHouseholds: 0,
      expectedSalesRevenue: 0,
      expectedConstructionCost: 0,
      expectedOtherCost: 0,
      expectedTotalCost: 0,
      expectedProfit: 0,
      roi: 0,
    };
  }

  const expectedGfaSqm = totalLandArea * (appliedFar / 100);
  const expectedHouseholds = averageUnitAreaSqm > 0 ? expectedGfaSqm / averageUnitAreaSqm : 0;
  const expectedSalesRevenue = expectedGfaSqm * expectedSalePricePerSqm;
  const expectedConstructionCost = expectedGfaSqm * constructionCostPerSqm;
  const expectedOtherCost = expectedConstructionCost * (otherCostRatio / 100);
  const expectedTotalCost = expectedConstructionCost + expectedOtherCost;
  const expectedProfit = expectedSalesRevenue - expectedTotalCost;
  const roi = expectedTotalCost > 0 ? (expectedProfit / expectedTotalCost) * 100 : 0;

  return {
    totalLandAreaSqm: totalLandArea,
    expectedGfaSqm,
    expectedHouseholds,
    expectedSalesRevenue,
    expectedConstructionCost,
    expectedOtherCost,
    expectedTotalCost,
    expectedProfit,
    roi,
  };
};

const summarizeRecord = (summary: Record<string, number>) =>
  Object.entries(summary)
    .map(([key, value]) => `${key} ${value}필지`)
    .join(', ') || '없음';

export const toProjectVirtualMergeSummary = (summary: VirtualMergeSummary): ProjectVirtualMergeSummary => ({
  selectedParcelCount: summary.parcelCount,
  totalAreaSqm: summary.totalArea,
  averageLandPricePerSqm: summary.averageLandPrice,
  totalOfficialLandValue: summary.totalOfficialLandValue,
  landUseSummary: summarizeRecord(summary.landUseZones),
  averageBuildingAge: summary.averageBuildingAge,
  oldBuildingRatio: summary.oldBuildingRatio,
  roadAccessSummary: summarizeRecord(summary.roadAccess),
  zoneInclusionRatio: summary.zoneInclusion.ratio,
  continuityStatus: summary.isContinuous ? '연속' : '비연속 또는 검토 필요',
  virtualMergeGrade: summary.grade,
});
