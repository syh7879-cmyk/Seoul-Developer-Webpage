import { adaptOsmOverpassBuildings } from '@/src/lib/adapters/osmOverpassAdapter';
import { jsonResponse, safeRawPreview } from '@/app/api/lab/_utils/response';

export const dynamic = 'force-dynamic';

const DEFAULT_BBOX = '127.0529,37.6122,127.0552,37.6144';
const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';

const parseBbox = (bbox: string) => {
  const [west, south, east, north] = bbox.split(',').map(Number);
  if ([west, south, east, north].every(Number.isFinite)) {
    return { west, south, east, north };
  }

  return { west: 127.0529, south: 37.6122, east: 127.0552, north: 37.6144 };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bbox = searchParams.get('bbox') || DEFAULT_BBOX;
  const { west, south, east, north } = parseBbox(bbox);

  const query = `
    [out:json][timeout:25];
    (
      way["building"](${south},${west},${north},${east});
    );
    out tags geom 80;
  `;

  try {
    const response = await fetch(OVERPASS_ENDPOINT, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({ data: query }),
    });
    const raw = await response.json();
    const data = adaptOsmOverpassBuildings(raw);

    return jsonResponse({
      ok: response.ok,
      source: 'osm-overpass-buildings',
      raw: {
        requestUrl: OVERPASS_ENDPOINT,
        query,
        status: response.status,
        preview: safeRawPreview(raw),
      },
      data,
      error: response.ok ? undefined : `Overpass API 응답 오류: HTTP ${response.status}`,
    }, response.ok ? 200 : 502);
  } catch (error) {
    return jsonResponse({
      ok: false,
      source: 'osm-overpass-buildings',
      raw: { requestUrl: OVERPASS_ENDPOINT, query },
      error: error instanceof Error ? error.message : 'OpenStreetMap Overpass API 호출 중 알 수 없는 오류가 발생했습니다.',
    }, 502);
  }
}
