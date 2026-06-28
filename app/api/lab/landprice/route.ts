import { adaptLandPrices } from '@/src/lib/adapters/landPriceAdapter';
import { jsonResponse, missingKeyResponse } from '@/app/api/lab/_utils/response';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) return missingKeyResponse('landprice', 'DATA_GO_KR_API_KEY');

  const { searchParams } = new URL(request.url);
  const pnu = searchParams.get('pnu');
  const year = searchParams.get('year');

  // TODO: 개별공시지가 API의 실제 endpoint, 기준연도, PNU 또는 법정동/지번 파라미터를 검증해야 합니다.
  return jsonResponse({
    ok: false,
    source: 'landprice',
    raw: { query: { pnu, year }, adapterPreview: adaptLandPrices({ items: [] }) },
    data: [],
    error: '개별공시지가 API route 구조만 준비되었습니다. 실제 endpoint와 조회 파라미터 확인이 필요합니다.',
  });
}
