import { adaptOsmNominatimPlaces } from '@/src/lib/adapters/osmNominatimAdapter';
import { jsonResponse, safeRawPreview } from '@/app/api/lab/_utils/response';

export const dynamic = 'force-dynamic';

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const DEFAULT_QUERY = '장위동 성북구 서울';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || DEFAULT_QUERY;
  const limit = searchParams.get('limit') || '5';

  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set('format', 'geojson');
  url.searchParams.set('polygon_geojson', '1');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', limit);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'seoul-developer-api-lab/0.1 (API feasibility testing)',
      },
    });
    const raw = await response.json();
    const data = adaptOsmNominatimPlaces(raw);

    return jsonResponse({
      ok: response.ok,
      source: 'osm-nominatim-places',
      raw: {
        requestUrl: url.toString(),
        sourceCrs: 'EPSG:4326',
        displayCrs: 'EPSG:4326',
        status: response.status,
        preview: safeRawPreview(raw),
      },
      data,
      error: response.ok ? undefined : `Nominatim 응답 오류: HTTP ${response.status}`,
    }, response.ok ? 200 : 502);
  } catch (error) {
    return jsonResponse({
      ok: false,
      source: 'osm-nominatim-places',
      raw: { requestUrl: url.toString() },
      error: error instanceof Error ? error.message : 'OpenStreetMap Nominatim API 호출 중 알 수 없는 오류가 발생했습니다.',
    }, 502);
  }
}
