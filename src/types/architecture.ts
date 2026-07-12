export type RegulationSource = 'manual' | 'api-candidate' | 'mixed';

export type MassingType = 'slab' | 'tower' | 'courtyard' | 'stepped';

export type RegulationInputs = {
  landUseZone: string;
  buildingCoverageRatio: number;
  floorAreaRatio: number;
  maxFloors: number;
  maxHeightM: number;
  setbackM: number;
  openSpaceRatio: number;
  source: RegulationSource;
};

export type ArchitectureSite = {
  id: string;
  name: string;
  address: string;
  totalLandAreaSqm: number;
  parcelCount: number;
  roadAccessSummary: string;
  contextSummary: string[];
};

export type BuildableAreaResult = {
  totalLandAreaSqm: number;
  maxBuildingAreaSqm: number;
  maxGrossFloorAreaSqm: number;
  estimatedFloorPlateSqm: number;
  estimatedFloors: number;
  estimatedHeightM: number;
  setbackM: number;
  openSpaceAreaSqm: number;
  coverageUsedRatio: number;
  farUsedRatio: number;
};

export type MassingModel = {
  massingType: MassingType;
  widthM: number;
  depthM: number;
  heightM: number;
  floors: number;
  floorPlateSqm: number;
};
