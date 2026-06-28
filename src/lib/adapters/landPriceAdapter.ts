import type { StandardLandPrice } from '@/src/types/apiLab';
import { asRecord, findArrayByPaths, getNumber, getString } from '@/src/lib/adapters/adapterUtils';

export function adaptLandPrices(raw: unknown): StandardLandPrice[] {
  const rows = findArrayByPaths(raw, [
    ['response', 'body', 'items', 'item'],
    ['items'],
    ['rows'],
  ]);

  return rows.map((item) => {
    const record = asRecord(item);
    return {
      pnu: getString(record, ['pnu', 'PNU']),
      baseYear: getString(record, ['stdrYear', 'baseYear', '기준연도']),
      officialLandPricePerSqm: getNumber(record, ['pblntfPclnd', 'officialLandPricePerSqm', '공시지가']),
      areaSqm: getNumber(record, ['area', 'areaSqm', '면적']),
      raw: item,
    };
  });
}
