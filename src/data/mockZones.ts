import type { ZoneFeature } from '@/src/types/zone';

export const mockZones: ZoneFeature[] = [
  {
    id: 'zone-1',
    name: '장위동 재개발구역',
    projectType: '재개발',
    district: '성북구',
    address: '서울 성북구 장위동',
    currentStage: '정비계획',
    zoneAreaSqm: 48200,
    expectedHouseholds: 320,
    unionMembers: 180,
    estimatedGeneralSale: '보통',
    riskSummary: ['주변 지장물', '도로협의 필요'],
    nearbyZones: ['정릉동 재건축구역', '석관동 가로주택정비'],
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [127.053, 37.612],
          [127.060, 37.612],
          [127.060, 37.618],
          [127.053, 37.618],
          [127.053, 37.612],
        ],
      ],
    },
  },
  {
    id: 'zone-2',
    name: '정릉동 재건축구역',
    projectType: '재건축',
    district: '성북구',
    address: '서울 성북구 정릉동',
    currentStage: '사업시행인가',
    zoneAreaSqm: 35800,
    expectedHouseholds: 240,
    unionMembers: 140,
    estimatedGeneralSale: '양호',
    riskSummary: ['노후건축물 다수'],
    nearbyZones: ['장위동 재개발구역'],
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [127.011, 37.603],
          [127.019, 37.603],
          [127.019, 37.609],
          [127.011, 37.609],
          [127.011, 37.603],
        ],
      ],
    },
  },
  {
    id: 'zone-3',
    name: '석관동 가로주택정비',
    projectType: '가로주택정비',
    district: '성북구',
    address: '서울 성북구 석관동',
    currentStage: '조합설립인가',
    zoneAreaSqm: 21400,
    expectedHouseholds: 140,
    unionMembers: 95,
    estimatedGeneralSale: '보통',
    riskSummary: ['지형조건 고려'],
    nearbyZones: ['장위동 재개발구역'],
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [127.058, 37.600],
          [127.065, 37.600],
          [127.065, 37.606],
          [127.058, 37.606],
          [127.058, 37.600],
        ],
      ],
    },
  },
];
