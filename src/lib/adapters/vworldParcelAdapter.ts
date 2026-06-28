import type { StandardParcel } from '@/src/types/apiLab';
import { asGeometry, asRecord, findArrayByPaths, getNumber, getString } from '@/src/lib/adapters/adapterUtils';

const getFeatures = (raw: unknown): unknown[] =>
  findArrayByPaths(raw, [
    ['response', 'result', 'featureCollection', 'features'],
    ['result', 'featureCollection', 'features'],
    ['features'],
  ]);

export function adaptVworldParcels(raw: unknown): StandardParcel[] {
  return getFeatures(raw).map((feature, index) => {
    const featureRecord = asRecord(feature);
    const properties = asRecord(featureRecord.properties);
    const geometry = asGeometry(featureRecord.geometry);
    const pnu = getString(properties, ['pnu', 'PNU', 'jibunCd', 'a1']);
    const lotNumber = getString(properties, ['jibun', 'JIBUN', 'addr', 'lotNumber']);

    return {
      id: pnu ?? getString(properties, ['id', 'ID']) ?? `vworld-parcel-${index}`,
      pnu,
      lotNumber,
      address: getString(properties, ['addr', 'address', 'full_addr']),
      areaSqm: getNumber(properties, ['area', 'AREA', 'p_area', 'shape_area']),
      geometry,
      source: 'vworld',
      raw: feature,
    };
  });
}
