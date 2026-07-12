import type { BuildableAreaResult, MassingModel, MassingType } from '@/src/types/architecture';

export const createMassingModel = (result: BuildableAreaResult, massingType: MassingType): MassingModel => {
  const floorPlateSqm = Math.max(1, result.estimatedFloorPlateSqm);
  const ratioByType: Record<MassingType, number> = {
    slab: 2.4,
    tower: 1,
    courtyard: 1.45,
    stepped: 1.8,
  };
  const ratio = ratioByType[massingType];
  const widthM = Math.sqrt(floorPlateSqm * ratio);
  const depthM = floorPlateSqm / widthM;

  return {
    massingType,
    widthM,
    depthM,
    heightM: result.estimatedHeightM,
    floors: result.estimatedFloors,
    floorPlateSqm,
  };
};
