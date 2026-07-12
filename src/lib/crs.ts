import type { MultiPolygonGeometry, PolygonGeometry } from '@/src/types/geometry';

export type DisplayCrs = 'EPSG:4326';
export type KnownCrs = 'EPSG:4326' | 'EPSG:3857' | 'EPSG:5174' | 'EPSG:5178' | 'EPSG:5179' | 'EPSG:5181' | 'EPSG:5186';
export type CrsStatus = 'ready' | 'assumed' | 'requires-transform' | 'unknown';

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
