import type { MultiPolygonGeometry, PolygonGeometry } from '@/src/types/geometry';

export type DisplayCrs = 'EPSG:4326';
export type KnownCrs = 'EPSG:4326' | 'EPSG:3857' | 'EPSG:5174' | 'EPSG:5178' | 'EPSG:5179' | 'EPSG:5181' | 'EPSG:5186';
export type CrsStatus = 'ready' | 'assumed' | 'requires-transform' | 'unknown';

export type CrsIntegrationStep = {
  title: string;
  description: string;
};

export type CrsDisplayDecision = {
  canDisplay: boolean;
  reason: string;
};

export const DISPLAY_CRS: DisplayCrs = 'EPSG:4326';

const knownCrsValues: KnownCrs[] = ['EPSG:4326', 'EPSG:3857', 'EPSG:5174', 'EPSG:5178', 'EPSG:5179', 'EPSG:5181', 'EPSG:5186'];

export const normalizeCrs = (value?: string | null): KnownCrs | undefined => {
  if (!value) return undefined;

  const normalized = value.trim().toUpperCase().replace('URN:OGC:DEF:CRS:', '').replace('::', ':');
  const epsgMatch = normalized.match(/EPSG[:/](\d+)/);
  const epsgValue = epsgMatch ? `EPSG:${epsgMatch[1]}` : normalized;

  return knownCrsValues.find((crs) => crs === epsgValue);
};

export const getCrsStatus = (sourceCrs?: string): CrsStatus => {
  const normalized = normalizeCrs(sourceCrs);
  if (!sourceCrs) return 'unknown';
  if (normalized === DISPLAY_CRS) return 'ready';
  if (normalized) return 'requires-transform';
  return 'unknown';
};

export const createCrsMetadata = (sourceCrs?: string, fallbackSourceCrs?: KnownCrs) => {
  const normalizedSourceCrs = normalizeCrs(sourceCrs) ?? fallbackSourceCrs;
  const status = sourceCrs ? getCrsStatus(sourceCrs) : fallbackSourceCrs === DISPLAY_CRS ? 'assumed' : getCrsStatus(fallbackSourceCrs);

  return {
    sourceCrs: normalizedSourceCrs,
    displayCrs: DISPLAY_CRS,
    crsStatus: status,
  };
};

export const canDisplayGeometryOnMap = (status: CrsStatus): boolean => status === 'ready' || status === 'assumed';

export const getCrsDisplayDecision = (sourceCrs?: string, fallbackSourceCrs?: KnownCrs): CrsDisplayDecision => {
  const metadata = createCrsMetadata(sourceCrs, fallbackSourceCrs);

  if (canDisplayGeometryOnMap(metadata.crsStatus)) {
    return {
      canDisplay: true,
      reason: metadata.crsStatus === 'ready' ? '표시 좌표계와 동일해 지도에 바로 표시할 수 있습니다.' : '원본 좌표계를 EPSG:4326으로 가정해 표시합니다.',
    };
  }

  if (metadata.crsStatus === 'requires-transform') {
    return {
      canDisplay: false,
      reason: `${metadata.sourceCrs} 원본 좌표는 ${DISPLAY_CRS}로 변환한 뒤 지도에 표시해야 합니다.`,
    };
  }

  return {
    canDisplay: false,
    reason: '원본 좌표계를 확인할 수 없어 지도 표시 전 좌표계 확인이 필요합니다.',
  };
};

export const getCrsIntegrationSteps = (): CrsIntegrationStep[] => [
  {
    title: '원본 좌표계 보존',
    description: '지적도, 지형도, 건축물, 도로 등 API별 원본 좌표계를 sourceCrs로 저장합니다.',
  },
  {
    title: '표시 좌표계 통일',
    description: `MapLibre 표시 기준은 ${DISPLAY_CRS}로 고정하고, 화면 레이어는 변환 완료 geometry만 사용합니다.`,
  },
  {
    title: '변환 필요 상태 분리',
    description: 'EPSG:5179, EPSG:5181, EPSG:5186 등 국내 투영좌표계는 crsStatus로 변환 필요 여부를 표시합니다.',
  },
  {
    title: '검증된 변환기로 교체',
    description: '실제 API 연동 단계에서 proj4 또는 서버 GIS 파이프라인으로 좌표 변환을 수행하도록 normalizeGeometryForDisplay를 교체합니다.',
  },
];

export const normalizeGeometryForDisplay = <T extends PolygonGeometry | MultiPolygonGeometry | undefined>(
  geometry: T,
  sourceCrs?: string,
): T => {
  const status = getCrsStatus(sourceCrs);

  // TODO: EPSG:5179, EPSG:5181, EPSG:5186 등 국내 투영좌표계 변환은 proj4 같은 검증된 라이브러리로 연결합니다.
  // API Lab 단계에서는 displayCrs 메타데이터를 먼저 고정하고, EPSG:4326 geometry만 지도에 안전하게 표시합니다.
  if (status === 'requires-transform') return geometry;

  return geometry;
};
