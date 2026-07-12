import type { RegulationInputs } from '@/src/types/architecture';

export const defaultRegulationInputs: RegulationInputs = {
  landUseZone: '제2종일반주거지역',
  buildingCoverageRatio: 60,
  floorAreaRatio: 200,
  maxFloors: 15,
  maxHeightM: 45,
  setbackM: 3,
  openSpaceRatio: 10,
  source: 'manual',
};

export const sanitizeRegulationInputs = (inputs: RegulationInputs): RegulationInputs => ({
  ...inputs,
  buildingCoverageRatio: Math.max(0, inputs.buildingCoverageRatio),
  floorAreaRatio: Math.max(0, inputs.floorAreaRatio),
  maxFloors: Math.max(1, Math.floor(inputs.maxFloors)),
  maxHeightM: Math.max(0, inputs.maxHeightM),
  setbackM: Math.max(0, inputs.setbackM),
  openSpaceRatio: Math.max(0, inputs.openSpaceRatio),
});
