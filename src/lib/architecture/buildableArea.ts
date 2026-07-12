import type { BuildableAreaResult, RegulationInputs } from '@/src/types/architecture';
import { sanitizeRegulationInputs } from '@/src/lib/architecture/regulations';

export const calculateBuildableArea = (totalLandAreaSqm: number, inputs: RegulationInputs): BuildableAreaResult => {
  const safeArea = Math.max(0, totalLandAreaSqm);
  const safeInputs = sanitizeRegulationInputs(inputs);

  if (safeArea === 0) {
    return {
      totalLandAreaSqm: 0,
      maxBuildingAreaSqm: 0,
      maxGrossFloorAreaSqm: 0,
      estimatedFloorPlateSqm: 0,
      estimatedFloors: 0,
      estimatedHeightM: 0,
      setbackM: safeInputs.setbackM,
      openSpaceAreaSqm: 0,
      coverageUsedRatio: 0,
      farUsedRatio: 0,
    };
  }

  const maxBuildingAreaSqm = safeArea * (safeInputs.buildingCoverageRatio / 100);
  const maxGrossFloorAreaSqm = safeArea * (safeInputs.floorAreaRatio / 100);
  const floorPlateFromFar = safeInputs.maxFloors > 0 ? maxGrossFloorAreaSqm / safeInputs.maxFloors : maxBuildingAreaSqm;
  const estimatedFloorPlateSqm = Math.min(maxBuildingAreaSqm, floorPlateFromFar || maxBuildingAreaSqm);
  const rawFloors = estimatedFloorPlateSqm > 0 ? Math.ceil(maxGrossFloorAreaSqm / estimatedFloorPlateSqm) : 0;
  const estimatedFloors = Math.max(1, Math.min(safeInputs.maxFloors, rawFloors));
  const heightByFloors = estimatedFloors * 3;
  const estimatedHeightM = safeInputs.maxHeightM > 0 ? Math.min(safeInputs.maxHeightM, heightByFloors) : heightByFloors;
  const openSpaceAreaSqm = safeArea * (safeInputs.openSpaceRatio / 100);

  return {
    totalLandAreaSqm: safeArea,
    maxBuildingAreaSqm,
    maxGrossFloorAreaSqm,
    estimatedFloorPlateSqm,
    estimatedFloors,
    estimatedHeightM,
    setbackM: safeInputs.setbackM,
    openSpaceAreaSqm,
    coverageUsedRatio: maxBuildingAreaSqm > 0 ? (estimatedFloorPlateSqm / maxBuildingAreaSqm) * 100 : 0,
    farUsedRatio: maxGrossFloorAreaSqm > 0 ? (estimatedFloorPlateSqm * estimatedFloors / maxGrossFloorAreaSqm) * 100 : 0,
  };
};
