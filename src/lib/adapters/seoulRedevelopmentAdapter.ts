import type { StandardRedevelopmentZone } from '@/src/types/apiLab';
import { asGeometry, asRecord, findArrayByPaths, getNumber, getString } from '@/src/lib/adapters/adapterUtils';

const getRows = (raw: unknown): unknown[] =>
  findArrayByPaths(raw, [
    ['response', 'body', 'items', 'item'],
    ['result', 'rows'],
    ['DATA'],
    ['rows'],
  ]);

export function adaptSeoulRedevelopmentZones(raw: unknown): StandardRedevelopmentZone[] {
  return getRows(raw).map((item, index) => {
    const record = asRecord(item);

    return {
      id: getString(record, ['id', 'BIZ_ID', '사업번호']) ?? `seoul-redevelopment-${index}`,
      name: getString(record, ['name', 'BIZ_NM', '사업명', '구역명']) ?? '이름 미상 정비사업',
      projectType: getString(record, ['projectType', 'BIZ_SE', '사업유형']),
      district: getString(record, ['district', 'SGG_NM', '자치구']),
      address: getString(record, ['address', 'ADDR', '위치']),
      currentStage: getString(record, ['currentStage', 'PRGRS_STTS', '진행단계']),
      zoneAreaSqm: getNumber(record, ['zoneAreaSqm', 'AREA', '구역면적']),
      geometry: asGeometry(record.geometry),
      source: 'seoul-open-data',
      raw: item,
    };
  });
}
