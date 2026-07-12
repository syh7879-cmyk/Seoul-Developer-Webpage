import type { StandardParcel } from '@/src/types/apiLab';
import type { Position } from '@/src/types/geometry';
import { asArray, asRecord, getString } from '@/src/lib/adapters/adapterUtils';

const toTags = (value: unknown): Record<string, string> | undefined => {
  const record = asRecord(value);
  const entries = Object.entries(record)
    .filter(([, entryValue]) => typeof entryValue === 'string' || typeof entryValue === 'number')
    .map(([key, entryValue]) => [key, String(entryValue)]);

  return entries.length ? Object.fromEntries(entries) : undefined;
};

const toPolygonRing = (geometry: unknown): Position[] | undefined => {
  const points = asArray(geometry)
    .map((point) => {
      const record = asRecord(point);
      const lat = typeof record.lat === 'number' ? record.lat : Number(record.lat);
      const lon = typeof record.lon === 'number' ? record.lon : Number(record.lon);

      return Number.isFinite(lat) && Number.isFinite(lon) ? ([lon, lat] as Position) : null;
    })
    .filter(Boolean) as Position[];

  if (points.length < 3) return undefined;

  const first = points[0];
  const last = points[points.length - 1];
  const ring = first[0] === last[0] && first[1] === last[1] ? points : [...points, first];

  return ring.length >= 4 ? ring : undefined;
};

export function adaptOsmOverpassBuildings(raw: unknown): StandardParcel[] {
  const elements = asArray(asRecord(raw).elements);

  return elements.flatMap((element) => {
    const record = asRecord(element);
    const type = getString(record, ['type']);
    const id = getString(record, ['id']);
    const ring = toPolygonRing(record.geometry);

    if (type !== 'way' || !id || !ring) return [];

    const tags = toTags(record.tags);
    const buildingType = tags?.building;
    const name = tags?.name ?? (buildingType ? `OSM building: ${buildingType}` : 'OSM building');

    return [{
      id: `osm-way-${id}`,
      externalId: id,
      name,
      lotNumber: tags?.['addr:housenumber'],
      address: [tags?.['addr:street'], tags?.['addr:housenumber']].filter(Boolean).join(' ') || undefined,
      geometry: {
        type: 'Polygon',
        coordinates: [ring],
      },
      source: 'openstreetmap',
      tags,
      raw: element,
    }];
  });
}
