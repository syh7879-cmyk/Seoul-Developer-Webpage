'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import type { ApiLabResponse, StandardParcel } from '@/src/types/apiLab';

type ApiOption = 'vworld-parcels' | 'seoul-redevelopment' | 'landuse' | 'buildings' | 'landprice';

const apiOptions: Array<{ value: ApiOption; label: string; keyHint: string; path: string }> = [
  { value: 'vworld-parcels', label: '브이월드 연속지적도', keyHint: 'VWORLD_API_KEY', path: '/api/lab/vworld/parcels' },
  { value: 'seoul-redevelopment', label: '서울시 정비사업 추진 경과', keyHint: 'SEOUL_OPEN_API_KEY', path: '/api/lab/seoul/redevelopment' },
  { value: 'landuse', label: '토지이용계획정보', keyHint: 'DATA_GO_KR_API_KEY', path: '/api/lab/landuse' },
  { value: 'buildings', label: '건축물대장정보', keyHint: 'DATA_GO_KR_API_KEY', path: '/api/lab/buildings' },
  { value: 'landprice', label: '개별공시지가', keyHint: 'DATA_GO_KR_API_KEY', path: '/api/lab/landprice' },
];

const defaultBbox = '127.0529,37.6122,127.0552,37.6144';
const defaultLng = '127.0542';
const defaultLat = '37.6134';
const defaultPnu = '1129013800100010000';

const toFeatureCollection = (parcels: StandardParcel[]) => ({
  type: 'FeatureCollection' as const,
  features: parcels
    .filter((parcel) => Boolean(parcel.geometry))
    .map((parcel) => ({
      type: 'Feature' as const,
      properties: {
        id: parcel.id,
        pnu: parcel.pnu,
        lotNumber: parcel.lotNumber,
        address: parcel.address,
        areaSqm: parcel.areaSqm,
        source: parcel.source,
      },
      geometry: parcel.geometry,
    })),
});

const truncateJson = (value: unknown) => {
  try {
    const text = JSON.stringify(value, null, 2);
    return text.length > 5000 ? `${text.slice(0, 5000)}\n...` : text;
  } catch {
    return '표시할 수 없는 응답입니다.';
  }
};

export default function ApiLabPage() {
  const [api, setApi] = useState<ApiOption>('vworld-parcels');
  const [bbox, setBbox] = useState(defaultBbox);
  const [lng, setLng] = useState(defaultLng);
  const [lat, setLat] = useState(defaultLat);
  const [pnu, setPnu] = useState(defaultPnu);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiLabResponse<unknown> | null>(null);
  const [parcels, setParcels] = useState<StandardParcel[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const selectedOption = apiOptions.find((option) => option.value === api) ?? apiOptions[0];
  const selectedParcel = useMemo(() => parcels.find((parcel) => parcel.id === selectedParcelId) ?? null, [parcels, selectedParcelId]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [Number(defaultLng), Number(defaultLat)],
      zoom: 16,
    });

    mapRef.current = map;

    map.on('load', () => {
      map.addSource('api-lab-parcels', {
        type: 'geojson',
        data: toFeatureCollection([]),
      });

      map.addLayer({
        id: 'api-lab-parcel-fill',
        type: 'fill',
        source: 'api-lab-parcels',
        paint: {
          'fill-color': ['case', ['==', ['get', 'id'], ''], '#f59e0b', '#f59e0b'],
          'fill-opacity': 0.28,
          'fill-outline-color': '#92400e',
        },
      });

      map.addLayer({
        id: 'api-lab-parcel-selected',
        type: 'fill',
        source: 'api-lab-parcels',
        paint: {
          'fill-color': '#ef4444',
          'fill-opacity': 0.48,
          'fill-outline-color': '#b91c1c',
        },
        filter: ['==', ['get', 'id'], ''],
      });

      map.on('click', 'api-lab-parcel-fill', (event) => {
        const feature = event.features?.[0];
        const id = feature?.properties?.id;
        if (typeof id === 'string') setSelectedParcelId(id);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const source = map?.getSource('api-lab-parcels') as maplibregl.GeoJSONSource | undefined;
    source?.setData(toFeatureCollection(parcels));

    if (parcels.length) {
      const [west, south, east, north] = bbox.split(',').map(Number);
      if ([west, south, east, north].every(Number.isFinite)) {
        map?.fitBounds(
          [
            [west, south],
            [east, north],
          ],
          { padding: 48, maxZoom: 17 },
        );
      }
    }
  }, [bbox, parcels]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer('api-lab-parcel-selected')) return;
    map.setFilter('api-lab-parcel-selected', ['==', ['get', 'id'], selectedParcelId ?? '']);
  }, [selectedParcelId]);

  const handleQuery = async () => {
    setIsLoading(true);
    setResponse(null);
    setSelectedParcelId(null);

    const params = new URLSearchParams({ bbox, lng, lat, pnu });
    try {
      const result = await fetch(`${selectedOption.path}?${params.toString()}`, { cache: 'no-store' });
      const body = (await result.json()) as ApiLabResponse<unknown>;
      setResponse(body);

      if (api === 'vworld-parcels' && Array.isArray(body.data)) {
        setParcels(body.data as StandardParcel[]);
      } else {
        setParcels([]);
      }
    } catch (error) {
      setParcels([]);
      setResponse({
        ok: false,
        source: selectedOption.value,
        error: error instanceof Error ? error.message : 'API Lab 요청 중 알 수 없는 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">API Lab</h1>
        <p className="text-sm text-slate-600">실제 공공 API 연동 가능성을 검증하기 위한 별도 실험 공간입니다.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[300px_1fr_380px]">
        <aside className="rounded-2xl bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">조회 조건</h2>
          <label className="mt-3 grid gap-1 text-sm">
            <span>API 선택</span>
            <select className="rounded border px-3 py-2" value={api} onChange={(event) => setApi(event.target.value as ApiOption)}>
              {apiOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="mt-3 grid gap-1 text-sm">
            <span>bbox</span>
            <input className="rounded border px-3 py-2" value={bbox} onChange={(event) => setBbox(event.target.value)} />
          </label>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <label className="grid gap-1">
              <span>중심 경도</span>
              <input className="rounded border px-3 py-2" value={lng} onChange={(event) => setLng(event.target.value)} />
            </label>
            <label className="grid gap-1">
              <span>중심 위도</span>
              <input className="rounded border px-3 py-2" value={lat} onChange={(event) => setLat(event.target.value)} />
            </label>
          </div>
          <label className="mt-3 grid gap-1 text-sm">
            <span>PNU</span>
            <input className="rounded border px-3 py-2" value={pnu} onChange={(event) => setPnu(event.target.value)} />
          </label>
          <button className="mt-4 w-full rounded bg-slate-900 px-3 py-2 text-white disabled:bg-slate-400" disabled={isLoading} onClick={handleQuery}>
            {isLoading ? '조회 중...' : '조회'}
          </button>
          <div className="mt-4 rounded bg-amber-50 p-3 text-sm text-amber-900">
            이 페이지는 본 서비스에 직접 연결되지 않은 API 실험실입니다. 선택한 API는 서버 route에서만 API 키를 읽습니다.
          </div>
          <div className="mt-3 rounded bg-slate-50 p-3 text-sm text-slate-700">
            필요 환경변수: <span className="font-semibold">{selectedOption.keyHint}</span>
          </div>
        </aside>

        <section className="rounded-2xl bg-white p-3 shadow">
          <div ref={mapContainerRef} className="h-[72vh] w-full rounded-xl" />
        </section>

        <aside className="space-y-4 rounded-2xl bg-white p-4 shadow">
          <section>
            <h2 className="text-lg font-semibold">호출 상태</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div><span className="font-medium">API:</span> {selectedOption.label}</div>
              <div><span className="font-medium">상태:</span> {response ? (response.ok ? '성공' : '실패') : '대기'}</div>
              {response?.error ? <div className="rounded bg-red-50 p-2 text-red-700">{response.error}</div> : null}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">클릭한 필지 속성</h2>
            {selectedParcel ? (
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div><span className="font-medium">PNU:</span> {selectedParcel.pnu ?? '-'}</div>
                <div><span className="font-medium">지번:</span> {selectedParcel.lotNumber ?? '-'}</div>
                <div><span className="font-medium">면적:</span> {selectedParcel.areaSqm ? `${selectedParcel.areaSqm.toLocaleString()}㎡` : '-'}</div>
                <div><span className="font-medium">source:</span> {selectedParcel.source}</div>
              </div>
            ) : (
              <p className="mt-3 rounded bg-slate-50 p-3 text-sm text-slate-600">지도에서 필지 polygon을 클릭하면 속성이 표시됩니다.</p>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold">표준 타입 변환 결과</h2>
            <pre className="mt-3 max-h-56 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">{truncateJson(api === 'vworld-parcels' ? parcels.slice(0, 5) : response?.data)}</pre>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Raw 응답 일부</h2>
            <pre className="mt-3 max-h-64 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">{truncateJson(response?.raw ?? response)}</pre>
          </section>
        </aside>
      </div>
    </main>
  );
}
