import type { ParcelFeature } from '@/src/types/parcel';
import type { ZoneFeature } from '@/src/types/zone';
import type { MultiPolygonGeometry } from '@/src/types/geometry';

const parseParcelNumber = (id: string) => {
  const match = id.match(/(\d+)$/);
  return match ? Number(match[1]) : Number.NaN;
};

const getParcelCenter = (parcel: ParcelFeature) => {
  const ring = parcel.geometry.coordinates[0] as number[][];
  const coordinates = ring.slice(0, -1);
  const lng = coordinates.reduce((sum, [value]) => sum + value, 0) / coordinates.length;
  const lat = coordinates.reduce((sum, [, value]) => sum + value, 0) / coordinates.length;

  return { lng, lat };
};

const getDistance = (a: ParcelFeature, b: ParcelFeature) => {
  const centerA = getParcelCenter(a);
  const centerB = getParcelCenter(b);
  return Math.hypot(centerA.lng - centerB.lng, centerA.lat - centerB.lat);
};

export const checkParcelContinuity = (parcels: ParcelFeature[]): boolean => {
  if (parcels.length <= 1) return true;

  const remaining = new Set(parcels.map((parcel) => parcel.id));
  const queue = [parcels[0]];
  remaining.delete(parcels[0].id);

  while (queue.length) {
    const current = queue.shift();
    if (!current) continue;

    parcels.forEach((candidate) => {
      if (!remaining.has(candidate.id)) return;

      const currentNumber = parseParcelNumber(current.id);
      const candidateNumber = parseParcelNumber(candidate.id);
      const idLooksAdjacent = Number.isFinite(currentNumber) && Number.isFinite(candidateNumber) && Math.abs(currentNumber - candidateNumber) <= 4;
      const centersLookAdjacent = getDistance(current, candidate) <= 0.0016;

      if (idLooksAdjacent && centersLookAdjacent) {
        remaining.delete(candidate.id);
        queue.push(candidate);
      }
    });
  }

  return remaining.size === 0;
};

export const calculateZoneInclusionRatio = (parcels: ParcelFeature[], _selectedZone?: ZoneFeature | null): number => {
  if (!parcels.length) return 0;

  const insideCount = parcels.filter((parcel) => parcel.isInsideZone).length;
  return (insideCount / parcels.length) * 100;
};

export const mergeParcelGeometries = (parcels: ParcelFeature[]): MultiPolygonGeometry | null => {
  if (!parcels.length) return null;

  return {
    type: 'MultiPolygon',
    coordinates: parcels.map((parcel) => parcel.geometry.coordinates as number[][][]),
  };
};
