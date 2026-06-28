import { adaptBuildingRegisters } from '@/src/lib/adapters/buildingRegisterAdapter';
import { jsonResponse, missingKeyResponse } from '@/app/api/lab/_utils/response';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) return missingKeyResponse('buildings', 'DATA_GO_KR_API_KEY');

  const { searchParams } = new URL(request.url);
  const pnu = searchParams.get('pnu');
  const sigunguCd = searchParams.get('sigunguCd');
  const bjdongCd = searchParams.get('bjdongCd');

  // TODO: 건축물대장 API는 sigunguCd, bjdongCd, bun, ji 등 분리 파라미터가 필요할 수 있습니다.
  return jsonResponse({
    ok: false,
    source: 'buildings',
    raw: { query: { pnu, sigunguCd, bjdongCd }, adapterPreview: adaptBuildingRegisters({ items: [] }) },
    data: [],
    error: '건축물대장정보 API route 구조만 준비되었습니다. 실제 endpoint와 지번 분해 파라미터 확인이 필요합니다.',
  });
}
