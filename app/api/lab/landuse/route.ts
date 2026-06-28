import { adaptLandUse } from '@/src/lib/adapters/landUseAdapter';
import { jsonResponse, missingKeyResponse } from '@/app/api/lab/_utils/response';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) return missingKeyResponse('landuse', 'DATA_GO_KR_API_KEY');

  const { searchParams } = new URL(request.url);
  const pnu = searchParams.get('pnu');

  // TODO: 토지이용계획정보의 실제 endpoint, serviceKey 인코딩 방식, PNU 파라미터명을 운영 키로 검증해야 합니다.
  return jsonResponse({
    ok: false,
    source: 'landuse',
    raw: { query: { pnu }, adapterPreview: adaptLandUse({ items: [] }) },
    data: [],
    error: '토지이용계획정보 API route 구조만 준비되었습니다. 실제 endpoint와 파라미터 확인이 필요합니다.',
  });
}
