import type { StandardParcel } from '@/src/types/apiLab';
import { asGeometry, asRecord, findArrayByPaths, getNumber, getString } from '@/src/lib/adapters/adapterUtils';
import { createCrsMetadata, normalizeGeometryForDisplay } from '@/src/lib/crs';

const getFeatures = (raw: unknown): unknown[] =>
  findArrayByPaths(raw, [
    ['features'],
  ]);

export function adaptOsmNominatimPlaces(raw: unknown): StandardParcel[] {
  const crsMetadata = createCrsMetadata('EPSG:4326');

  return getFeatures(raw).map((feature, index) => {
    const featureRecord = asRecord(feature);
    const properties = asRecord(featureRecord.properties);
    const osmType = getString(properties, ['osm_type']);
    const osmId = getString(properties, ['osm_id']);
    const id = osmType && osmId ? `osm-${osmType}-${osmId}` : `osm-nominatim-${index}`;

    return {
      id,
      externalId: osmId,
      name: getString(properties, ['display_name', 'name']) ?? 'OSM Nominatim place',
      address: getString(properties, ['display_name']),
      areaSqm: getNumber(properties, ['areaSqm']),
      geometry: normalizeGeometryForDisplay(asGeometry(featureRecord.geometry), crsMetadata.sourceCrs),
      ...crsMetadata,
      source: 'openstreetmap',
      tags: {
        osmType: osmType ?? '',
        category: getString(properties, ['category']) ?? '',
        type: getString(properties, ['type']) ?? '',
      },
      raw: feature,
    };
  });
}
