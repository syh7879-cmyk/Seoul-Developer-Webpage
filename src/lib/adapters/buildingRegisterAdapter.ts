import type { StandardBuildingRegister } from '@/src/types/apiLab';
import { asRecord, findArrayByPaths, getNumber, getString } from '@/src/lib/adapters/adapterUtils';

export function adaptBuildingRegisters(raw: unknown): StandardBuildingRegister[] {
  const rows = findArrayByPaths(raw, [
    ['response', 'body', 'items', 'item'],
    ['items'],
    ['rows'],
  ]);

  return rows.map((item) => {
    const record = asRecord(item);
    return {
      pnu: getString(record, ['pnu', 'PNU']),
      address: getString(record, ['platPlc', 'address', '대지위치']),
      approvalDate: getString(record, ['useAprDay', 'approvalDate', '사용승인일']),
      mainUse: getString(record, ['mainPurpsCdNm', 'mainUse', '주용도']),
      floorCount: getNumber(record, ['grndFlrCnt', 'floorCount', '층수']),
      grossFloorAreaSqm: getNumber(record, ['totArea', 'grossFloorAreaSqm', '연면적']),
      raw: item,
    };
  });
}
