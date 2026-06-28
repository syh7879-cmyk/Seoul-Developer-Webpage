import { adaptSeoulRedevelopmentZones } from '@/src/lib/adapters/seoulRedevelopmentAdapter';
import { jsonResponse, missingKeyResponse, safeRawPreview } from '@/app/api/lab/_utils/response';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const apiKey = process.env.SEOUL_OPEN_API_KEY;
  if (!apiKey) return missingKeyResponse('seoul-redevelopment', 'SEOUL_OPEN_API_KEY');

  const { searchParams } = new URL(request.url);
  const startIndex = searchParams.get('start') || '1';
  const endIndex = searchParams.get('end') || '50';

  // TODO: 서울 열린데이터광장의 정확한 서비스명과 컬럼명을 운영 키로 검증해야 합니다.
  // 이 데이터는 정비구역 polygon 경계가 아니라 추진 경과 속성정보일 수 있습니다.
  const url = `https://openapi.seoul.go.kr:8088/${apiKey}/json/ListPublicReservationCulture/${startIndex}/${endIndex}/`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    const raw = await response.json();
    const data = adaptSeoulRedevelopmentZones(raw);

    return jsonResponse({
      ok: response.ok,
      source: 'seoul-redevelopment',
      raw: {
        status: response.status,
        preview: safeRawPreview(raw),
      },
      data,
      error: response.ok ? undefined : `서울시 API 응답 오류: HTTP ${response.status}`,
    }, response.ok ? 200 : 502);
  } catch (error) {
    return jsonResponse({
      ok: false,
      source: 'seoul-redevelopment',
      error: error instanceof Error ? error.message : '서울시 정비사업 API 호출 중 알 수 없는 오류가 발생했습니다.',
    }, 502);
  }
}
