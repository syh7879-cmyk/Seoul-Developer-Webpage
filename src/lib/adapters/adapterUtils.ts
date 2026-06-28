import type { MultiPolygonGeometry, PolygonGeometry } from '@/src/types/geometry';

export const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

export const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

export const getString = (record: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }

  return undefined;
};

export const getNumber = (record: Record<string, unknown>, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const normalized = Number(value.replace(/,/g, ''));
      if (Number.isFinite(normalized)) return normalized;
    }
  }

  return undefined;
};

export const getNested = (value: unknown, path: string[]): unknown =>
  path.reduce((current, key) => asRecord(current)[key], value);

export const findArrayByPaths = (raw: unknown, paths: string[][]): unknown[] => {
  for (const path of paths) {
    const value = getNested(raw, path);
    if (Array.isArray(value)) return value;
  }

  return [];
};

export const asGeometry = (value: unknown): PolygonGeometry | MultiPolygonGeometry | undefined => {
  const geometry = asRecord(value);
  if ((geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') && Array.isArray(geometry.coordinates)) {
    return geometry as unknown as PolygonGeometry | MultiPolygonGeometry;
  }

  return undefined;
};
