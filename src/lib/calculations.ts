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
  totalLandShareArea: number;
  averageLandShareRatio: number;
  averageLandPrice: number;
  totalOfficialLandValue: number;
  totalAskingPrice: number;
  averageAskingPrice: number;
  askingPriceToOfficialValueRatio: number;
  landUseZones: Record<string, number>;
  mixedLandUseZones: boolean;
  averageBuildingAge: number;
  oldBuildingRatio: number;
  buildingAgeGroups: Record<string, number>;
  roadAccess: Record<string, number>;
  roadAccessWarning: boolean;
  hasNoRoadAccess: boolean;
  zoneInclusion: ZoneInclusionSummary;
  isContinuous: boolean;
  grade: VirtualMergeGrade;
  reviewPoints: string[];
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

const getParcelLandShareSqm = (parcel: ParcelFeature) =>
  normalizePositiveNumber(parcel.landShareSqm ?? parcel.areaSqm);

const getParcelAskingPriceKRW = (parcel: ParcelFeature) => {
  const officialValue = parcel.areaSqm * parcel.officialLandPricePerSqm;
  return normalizePositiveNumber(parcel.askingPriceKRW ?? officialValue * 1.8);
};

export const calculateTotalLandShareArea = (parcels: ParcelFeature[]) =>
  parcels.reduce((sum, parcel) => sum + getParcelLandShareSqm(parcel), 0);

export const calculateAverageLandShareRatio = (parcels: ParcelFeature[]) => {
  const totalArea = calculateTotalArea(parcels);
  if (totalArea === 0) return 0;
  return (calculateTotalLandShareArea(parcels) / totalArea) * 100;
};

export const calculateAverageLandPrice = (parcels: ParcelFeature[]) => {
  if (!parcels.length) return 0;
  const total = parcels.reduce((sum, parcel) => sum + parcel.officialLandPricePerSqm, 0);
  return total / parcels.length;
};

export const calculateTotalOfficialLandValue = (parcels: ParcelFeature[]) =>
  parcels.reduce((sum, parcel) => sum + parcel.areaSqm * parcel.officialLandPricePerSqm, 0);

export const calculateTotalAskingPrice = (parcels: ParcelFeature[]) =>
  parcels.reduce((sum, parcel) => sum + getParcelAskingPriceKRW(parcel), 0);

export const calculateAverageAskingPrice = (parcels: ParcelFeature[]) => {
  if (!parcels.length) return 0;
  return calculateTotalAskingPrice(parcels) / parcels.length;
};

export const calculateAskingPriceToOfficialValueRatio = (parcels: ParcelFeature[]) => {
  const totalOfficialLandValue = calculateTotalOfficialLandValue(parcels);
  if (totalOfficialLandValue === 0) return 0;
  return (calculateTotalAskingPrice(parcels) / totalOfficialLandValue) * 100;
};

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

export const summarizeBuildingAgeGroups = (parcels: ParcelFeature[]) => {
  const summary: Record<string, number> = {
    '20년 미만': 0,
    '20-29년': 0,
    '30년 이상': 0,
  };

  parcels.forEach((parcel) => {
    if (parcel.buildingAge >= 30) {
      summary['30년 이상'] += 1;
    } else if (parcel.buildingAge >= 20) {
      summary['20-29년'] += 1;
    } else {
      summary['20년 미만'] += 1;
    }
  });

  return summary;
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

export const gradeVirtualMerge = (summary: Omit<VirtualMergeSummary, 'grade' | 'reviewPoints'>): VirtualMergeGrade => {
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

export const summarizeVirtualMergeReviewPoints = (summary: Omit<VirtualMergeSummary, 'reviewPoints'>): string[] => {
  if (!summary.parcelCount) return ['필지를 선택하면 개발 검토용 가상 합필 시뮬레이션 검토 포인트가 표시됩니다.'];

  const points: string[] = [];

  if (summary.parcelCount < 2) {
    points.push('선택 필지가 1개입니다. 가상 합필 검토를 위해서는 2개 이상 필지 조합을 비교하는 것이 좋습니다.');
  } else {
    points.push(`${summary.parcelCount}개 필지를 묶어 합산 대지면적 ${Math.round(summary.totalArea).toLocaleString()}㎡ 기준으로 검토 중입니다.`);
  }

  if (summary.askingPriceToOfficialValueRatio >= 220) {
    points.push('공시가 대비 매물가격이 높은 편입니다. 실거래가, 권리가액, 감정평가 가능성을 별도로 확인하세요.');
  } else if (summary.askingPriceToOfficialValueRatio > 0) {
    points.push('매물가격과 공시지가의 차이를 확인했습니다. 실제 가격 판단은 실거래가와 감정평가 검토가 필요합니다.');
  }

  if (summary.averageLandShareRatio < 55) {
    points.push('대지지분율이 낮은 편입니다. 권리관계와 기존 건축물 구분소유 여부를 우선 확인하세요.');
  } else {
    points.push('대지지분율은 개발 검토용 비교 지표로 표시했습니다. 실제 권리 산정은 등기와 소유권 검토가 필요합니다.');
  }

  if (summary.oldBuildingRatio >= 50) {
    points.push('30년 이상 건축물 비율이 높아 노후도 측면의 검토 필요성이 큽니다.');
  } else if (summary.averageBuildingAge < 20) {
    points.push('평균 건축물 노후도가 낮은 편입니다. 정비사업 요건과 노후도 기준을 추가 확인하세요.');
  }

  if (summary.mixedLandUseZones) {
    points.push('용도지역이 혼재되어 있어 건축 가능 규모와 인허가 조건이 필지별로 달라질 수 있습니다.');
  }

  if (summary.roadAccessWarning) {
    points.push('접도 조건이 약한 필지가 포함되어 도로 폭, 접도 길이, 건축법상 대지 요건 검토가 필요합니다.');
  }

  if (summary.zoneInclusion.hasOutsideParcel) {
    points.push('정비구역 밖 필지가 포함되어 구역 편입 가능성이나 별도 개발 가능성을 구분해 검토해야 합니다.');
  }

  if (!summary.isContinuous) {
    points.push('비연속 필지가 포함되어 실제 합필이나 공동개발 검토 전에 지적 경계와 인접성을 확인해야 합니다.');
  }

  points.push('본 검토 포인트는 rule-based 요약이며 실제 합필 가능 여부는 지적, 등기, 소유권, 도시계획, 건축 인허가 검토 필요 사항입니다.');

  return points;
};

export const calculateVirtualMergeSummary = (parcels: ParcelFeature[], selectedZone?: ZoneFeature | null): VirtualMergeSummary => {
  const roadAccess = summarizeRoadAccess(parcels);
  const summaryWithoutGradeAndReviewPoints: Omit<VirtualMergeSummary, 'grade' | 'reviewPoints'> = {
    parcelCount: parcels.length,
    selectedParcels: parcels,
    totalArea: calculateTotalArea(parcels),
    totalLandShareArea: calculateTotalLandShareArea(parcels),
    averageLandShareRatio: calculateAverageLandShareRatio(parcels),
    averageLandPrice: calculateAverageLandPrice(parcels),
    totalOfficialLandValue: calculateTotalOfficialLandValue(parcels),
    totalAskingPrice: calculateTotalAskingPrice(parcels),
    averageAskingPrice: calculateAverageAskingPrice(parcels),
    askingPriceToOfficialValueRatio: calculateAskingPriceToOfficialValueRatio(parcels),
    landUseZones: summarizeLandUseZones(parcels),
    mixedLandUseZones: hasMixedLandUseZones(parcels),
    averageBuildingAge: calculateAverageBuildingAge(parcels),
    oldBuildingRatio: calculateOldBuildingRatio(parcels),
    buildingAgeGroups: summarizeBuildingAgeGroups(parcels),
    roadAccess,
    roadAccessWarning: hasRoadAccessWarning(parcels),
    hasNoRoadAccess: (roadAccess['미접'] ?? 0) > 0,
    zoneInclusion: calculateZoneInclusionSummary(parcels, selectedZone),
    isContinuous: checkParcelContinuity(parcels),
  };
  const summaryWithoutReviewPoints: Omit<VirtualMergeSummary, 'reviewPoints'> = {
    ...summaryWithoutGradeAndReviewPoints,
    grade: gradeVirtualMerge(summaryWithoutGradeAndReviewPoints),
  };

  return {
    ...summaryWithoutReviewPoints,
    reviewPoints: summarizeVirtualMergeReviewPoints(summaryWithoutReviewPoints),
  };
};

export const calculateFeasibility = (totalLandAreaSqm: number, inputs: FeasibilityInputs, landAcquisitionCostKRW = 0): FeasibilityResults => {
  const totalLandArea = normalizePositiveNumber(totalLandAreaSqm);
  const landAcquisitionCost = normalizePositiveNumber(landAcquisitionCostKRW);
  const appliedFar = normalizePositiveNumber(inputs.appliedFar);
  const averageUnitAreaSqm = normalizePositiveNumber(inputs.averageUnitAreaSqm);
  const expectedSalePricePerSqm = normalizePositiveNumber(inputs.expectedSalePricePerSqm);
  const constructionCostPerSqm = normalizePositiveNumber(inputs.constructionCostPerSqm);
  const otherCostRatio = normalizePositiveNumber(inputs.otherCostRatio);

  if (totalLandArea === 0) {
    return {
      totalLandAreaSqm: 0,
      landAcquisitionCostKRW: landAcquisitionCost,
      expectedGfaSqm: 0,
      expectedHouseholds: 0,
      expectedSalesRevenue: 0,
      expectedConstructionCost: 0,
      expectedOtherCost: 0,
      expectedTotalCost: 0,
      expectedTotalInvestmentCost: landAcquisitionCost,
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
  const expectedTotalInvestmentCost = landAcquisitionCost + expectedTotalCost;
  const expectedProfit = expectedSalesRevenue - expectedTotalInvestmentCost;
  const roi = expectedTotalInvestmentCost > 0 ? (expectedProfit / expectedTotalInvestmentCost) * 100 : 0;

  return {
    totalLandAreaSqm: totalLandArea,
    landAcquisitionCostKRW: landAcquisitionCost,
    expectedGfaSqm,
    expectedHouseholds,
    expectedSalesRevenue,
    expectedConstructionCost,
    expectedOtherCost,
    expectedTotalCost,
    expectedTotalInvestmentCost,
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
  totalLandShareAreaSqm: summary.totalLandShareArea,
  averageLandShareRatio: summary.averageLandShareRatio,
  averageLandPricePerSqm: summary.averageLandPrice,
  totalOfficialLandValue: summary.totalOfficialLandValue,
  totalAskingPrice: summary.totalAskingPrice,
  averageAskingPrice: summary.averageAskingPrice,
  askingPriceToOfficialValueRatio: summary.askingPriceToOfficialValueRatio,
  landUseSummary: summarizeRecord(summary.landUseZones),
  averageBuildingAge: summary.averageBuildingAge,
  oldBuildingRatio: summary.oldBuildingRatio,
  buildingAgeSummary: summarizeRecord(summary.buildingAgeGroups),
  roadAccessSummary: summarizeRecord(summary.roadAccess),
  zoneInclusionRatio: summary.zoneInclusion.ratio,
  continuityStatus: summary.isContinuous ? '연속' : '비연속 또는 검토 필요',
  virtualMergeGrade: summary.grade,
});
