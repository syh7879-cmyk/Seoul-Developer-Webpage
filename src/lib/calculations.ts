import type { ParcelFeature } from '@/src/types/parcel';

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

export const calculateAverageBuildingAge = (parcels: ParcelFeature[]) => {
  if (!parcels.length) return 0;
  const total = parcels.reduce((sum, parcel) => sum + parcel.buildingAge, 0);
  return total / parcels.length;
};

export const calculateOldBuildingRatio = (parcels: ParcelFeature[]) => {
  if (!parcels.length) return 0;
  const oldCount = parcels.filter((parcel) => parcel.buildingAge >= 30).length;
  return (oldCount / parcels.length) * 100;
};

export const summarizeRoadAccess = (parcels: ParcelFeature[]) => {
  const summary: Record<string, number> = {};
  parcels.forEach((parcel) => {
    summary[parcel.roadAccess] = (summary[parcel.roadAccess] ?? 0) + 1;
  });
  return summary;
};

export const checkParcelContinuity = (parcels: ParcelFeature[]) => {
  if (parcels.length <= 1) return '연속';
  return parcels.length <= 4 ? '보통' : '양호';
};

export const calculateZoneInclusionRatio = (parcels: ParcelFeature[]) => {
  if (!parcels.length) return 0;
  const insideCount = parcels.filter((parcel) => parcel.isInsideZone).length;
  return (insideCount / parcels.length) * 100;
};

export const gradeVirtualMerge = (parcels: ParcelFeature[]) => {
  const ratio = calculateZoneInclusionRatio(parcels);
  const oldRatio = calculateOldBuildingRatio(parcels);
  const roadSummary = summarizeRoadAccess(parcels);
  const hasPoorAccess = (roadSummary['미접'] ?? 0) > 0 || (roadSummary['약함'] ?? 0) > 0;

  if (ratio >= 80 && !hasPoorAccess && oldRatio <= 25) return '양호';
  if (ratio >= 60 && !hasPoorAccess) return '주의';
  return '위험';
};

export const calculateFeasibility = (parcels: ParcelFeature[]) => ({
  totalArea: calculateTotalArea(parcels),
  averageLandPrice: calculateAverageLandPrice(parcels),
  totalOfficialLandValue: calculateTotalOfficialLandValue(parcels),
  landUseZones: summarizeLandUseZones(parcels),
  averageBuildingAge: calculateAverageBuildingAge(parcels),
  oldBuildingRatio: calculateOldBuildingRatio(parcels),
  roadAccess: summarizeRoadAccess(parcels),
  continuity: checkParcelContinuity(parcels),
  zoneInclusionRatio: calculateZoneInclusionRatio(parcels),
  grade: gradeVirtualMerge(parcels),
});
