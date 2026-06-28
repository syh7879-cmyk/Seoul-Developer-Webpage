import type { StandardLandUse } from '@/src/types/apiLab';
import { asRecord, findArrayByPaths, getString } from '@/src/lib/adapters/adapterUtils';

export function adaptLandUse(raw: unknown): StandardLandUse[] {
  const rows = findArrayByPaths(raw, [
    ['response', 'body', 'items', 'item'],
    ['items'],
    ['rows'],
  ]);

  return rows.map((item) => {
    const record = asRecord(item);
    return {
      pnu: getString(record, ['pnu', 'PNU', 'pnuCode']),
      landUseZone: getString(record, ['landUseZone', '용도지역', 'prposAreaDstrcNm']),
      districtUnitPlan: getString(record, ['districtUnitPlan', '지구단위계획', 'dstrcUnitPlan']),
      raw: item,
    };
  });
}
