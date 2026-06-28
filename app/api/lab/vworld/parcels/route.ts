import { adaptVworldParcels } from '@/src/lib/adapters/vworldParcelAdapter';
import { jsonResponse, maskUrl, missingKeyResponse, safeRawPreview } from '@/app/api/lab/_utils/response';

export const dynamic = 'force-dynamic';

const DEFAULT_BBOX = '127.0529,37.6122,127.0552,37.6144';

export async function GET(request: Request) {
  const apiKey = process.env.VWORLD_API_KEY;
  if (!apiKey) return missingKeyResponse('vworld-parcels', 'VWORLD_API_KEY');

  const { searchParams } = new URL(request.url);
  const bbox = searchParams.get('bbox') || DEFAULT_BBOX;
  const centerLng = searchParams.get('lng');
  const centerLat = searchParams.get('lat');
  const size = searchParams.get('size') || '100';
  const geomFilter = bbox ? `BOX(${bbox})` : centerLng && centerLat ? `POINT(${centerLng} ${centerLat})` : `BOX(${DEFAULT_BBOX})`;

  const url = new URL('https://api.vworld.kr/req/data');
  url.searchParams.set('service', 'data');
  url.searchParams.set('request', 'GetFeature');
  url.searchParams.set('data', 'LP_PA_CBND_BUBUN');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('format', 'json');
  url.searchParams.set('size', size);
  url.searchParams.set('geomFilter', geomFilter);
  url.searchParams.set('crs', 'EPSG:4326');

  try {
    // TODO: 브이월드 운영 환경에서 domain, attrFilter, geomFilter 파라미터 요구사항을 추가 검증해야 합니다.
    const response = await fetch(url, { cache: 'no-store' });
    const raw = await response.json();
    const data = adaptVworldParcels(raw);

    return jsonResponse({
      ok: response.ok,
      source: 'vworld-parcels',
      raw: {
        requestUrl: maskUrl(url, ['key']),
        status: response.status,
        preview: safeRawPreview(raw),
      },
      data,
      error: response.ok ? undefined : `브이월드 응답 오류: HTTP ${response.status}`,
    }, response.ok ? 200 : 502);
  } catch (error) {
    return jsonResponse({
      ok: false,
      source: 'vworld-parcels',
      raw: { requestUrl: maskUrl(url, ['key']) },
      error: error instanceof Error ? error.message : '브이월드 연속지적도 호출 중 알 수 없는 오류가 발생했습니다.',
    }, 502);
  }
}
