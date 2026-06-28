'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { mockZones } from '@/src/data/mockZones';
import { mockParcels } from '@/src/data/mockParcels';
import VirtualMergeBasket from '@/src/components/VirtualMergeBasket';
import FeasibilityCard from '@/src/components/panel/FeasibilityCard';
import ProjectSavePanel from '@/src/components/panel/ProjectSavePanel';
import type { ParcelFeature } from '@/src/types/parcel';
import type { ZoneFeature } from '@/src/types/zone';
import type { SavedProject } from '@/src/types/project';
import { calculateFeasibility, calculateTotalArea, calculateVirtualMergeSummary, defaultFeasibilityInputs, toProjectVirtualMergeSummary } from '@/src/lib/calculations';

export default function Home() {
  const [selectedZone, setSelectedZone] = useState<ZoneFeature | null>(mockZones[0]);
  const [selectedParcels, setSelectedParcels] = useState<ParcelFeature[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [inputs, setInputs] = useState(defaultFeasibilityInputs);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const selectionModeRef = useRef(selectionMode);

  const totalArea = useMemo(() => calculateTotalArea(selectedParcels), [selectedParcels]);
  const virtualMergeSummary = useMemo(() => calculateVirtualMergeSummary(selectedParcels, selectedZone), [selectedParcels, selectedZone]);
  const feasibilityResults = useMemo(() => calculateFeasibility(totalArea, inputs), [totalArea, inputs]);
  const projectVirtualMergeSummary = useMemo(() => toProjectVirtualMergeSummary(virtualMergeSummary), [virtualMergeSummary]);

  useEffect(() => {
    selectionModeRef.current = selectionMode;
  }, [selectionMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://demotiles.maplibre.org/style.json',
      center: [127.055, 37.609],
      zoom: 14,
      pitch: 0,
    });

    mapRef.current = map;

    map.on('load', () => {
      map.addSource('zones', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: mockZones.map((zone) => ({
            type: 'Feature',
            properties: { id: zone.id, name: zone.name, type: zone.projectType },
            geometry: zone.geometry,
          })),
        },
      });

      map.addSource('parcels', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'zone-layer',
        type: 'fill',
        source: 'zones',
        paint: {
          'fill-color': ['match', ['get', 'type'], '재개발', '#2563eb', '재건축', '#7c3aed', '가로주택정비', '#16a34a', '소규모재건축', '#fbbf24', '#6b7280'],
          'fill-opacity': 0.22,
          'fill-outline-color': '#111827',
        },
      });

      map.addLayer({
        id: 'parcel-layer',
        type: 'fill',
        source: 'parcels',
        paint: {
          'fill-color': '#f59e0b',
          'fill-opacity': 0.18,
          'fill-outline-color': '#92400e',
        },
      });

      map.addLayer({
        id: 'selected-parcel-layer',
        type: 'fill',
        source: 'parcels',
        paint: {
          'fill-color': '#ef4444',
          'fill-opacity': 0.45,
          'fill-outline-color': '#b91c1c',
        },
        filter: ['==', ['get', 'selected'], true],
      });

      const updateParcelData = () => {
        const source = map.getSource('parcels') as maplibregl.GeoJSONSource | undefined;
        source?.setData({
          type: 'FeatureCollection',
          features: mockParcels.map((parcel) => ({
            type: 'Feature',
            properties: { id: parcel.id, selected: selectedParcels.some((item) => item.id === parcel.id) },
            geometry: parcel.geometry,
          })),
        });
      };

      updateParcelData();

      map.on('click', 'zone-layer', (event) => {
        const feature = event.features?.[0];
        const zone = mockZones.find((item) => item.id === feature?.properties?.id);
        if (zone) setSelectedZone(zone);
      });

      map.on('click', 'parcel-layer', (event) => {
        if (!selectionModeRef.current) return;
        const feature = event.features?.[0];
        const parcel = mockParcels.find((item) => item.id === feature?.properties?.id);
        if (!parcel) return;
        setSelectedParcels((current) => {
          const exists = current.some((item) => item.id === parcel.id);
          return exists ? current.filter((item) => item.id !== parcel.id) : [...current, parcel];
        });
      });
    });

    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource('parcels') as maplibregl.GeoJSONSource | undefined;
    source?.setData({
      type: 'FeatureCollection',
      features: mockParcels.map((parcel) => ({
        type: 'Feature',
        properties: { id: parcel.id, selected: selectedParcels.some((item) => item.id === parcel.id) },
        geometry: parcel.geometry,
      })),
    });
  }, [selectedParcels]);

  const handleLoadProject = (record: SavedProject) => {
    const parcelMap = new Map(mockParcels.map((parcel) => [parcel.id, parcel]));
    const zone = mockZones.find((item) => item.id === record.selectedZoneId);

    setSelectedParcels(record.selectedParcelIds.map((id) => parcelMap.get(id)).filter(Boolean) as ParcelFeature[]);
    if (zone) setSelectedZone(zone);
    setInputs(record.feasibilityInputs);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">정비지도랩</h1>
          <p className="text-sm text-slate-600">가상 합필 시뮬레이션 기반 개발 검토용 필지 묶음 MVP</p>
        </div>
        <div className="rounded-lg bg-white px-4 py-2 text-sm text-slate-700 shadow">실제 합필 가능 여부는 지적·등기·도시계획 검토가 필요합니다.</div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[280px_1fr_360px]">
        <aside className="rounded-2xl bg-white p-4 shadow">
          <h2 className="mb-3 text-lg font-semibold">필터</h2>
          <input className="mb-3 w-full rounded border px-3 py-2" placeholder="정비구역 검색" />
          <label className="mb-2 block text-sm font-medium">자치구</label>
          <select className="mb-3 w-full rounded border px-3 py-2">
            <option>성북구</option>
          </select>
          <label className="mb-2 block text-sm font-medium">사업유형</label>
          <select className="mb-3 w-full rounded border px-3 py-2">
            <option>전체</option>
            <option>재개발</option>
            <option>재건축</option>
            <option>가로주택정비</option>
            <option>소규모재건축</option>
            <option>리모델링</option>
          </select>
          <label className="mb-2 block text-sm font-medium">진행단계</label>
          <select className="mb-3 w-full rounded border px-3 py-2">
            <option>전체</option>
            <option>정비계획</option>
            <option>정비구역지정</option>
            <option>조합설립인가</option>
            <option>사업시행인가</option>
            <option>관리처분인가</option>
            <option>착공</option>
            <option>준공</option>
          </select>
          <button className="w-full rounded bg-slate-800 px-3 py-2 text-white" onClick={() => setSelectedParcels([])}>
            선택 초기화
          </button>
          <div className="mt-4 rounded border border-slate-200 p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={selectionMode} onChange={() => setSelectionMode((prev) => !prev)} />
              필지 선택 모드
            </label>
            <p className="mt-2 text-xs text-slate-500">필지 선택 모드를 켜면 지도에서 필지를 클릭해 가상 합필 바구니에 담을 수 있습니다.</p>
          </div>
        </aside>

        <section className="rounded-2xl bg-white p-3 shadow">
          <div id="map" className="h-[70vh] w-full rounded-xl" />
        </section>

        <aside className="space-y-4 rounded-2xl bg-white p-4 shadow">
          {selectedZone ? (
            <div>
              <h2 className="text-lg font-semibold">정비구역 상세정보</h2>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div><span className="font-medium">구역명:</span> {selectedZone.name}</div>
                <div><span className="font-medium">사업유형:</span> {selectedZone.projectType}</div>
                <div><span className="font-medium">위치:</span> {selectedZone.address}</div>
                <div><span className="font-medium">자치구:</span> {selectedZone.district}</div>
                <div><span className="font-medium">진행단계:</span> {selectedZone.currentStage}</div>
                <div><span className="font-medium">구역면적:</span> {selectedZone.zoneAreaSqm.toLocaleString()}㎡</div>
                <div><span className="font-medium">예상 세대수:</span> {selectedZone.expectedHouseholds}</div>
                <div><span className="font-medium">조합원 수:</span> {selectedZone.unionMembers}</div>
                <div><span className="font-medium">일반분양 추정:</span> {selectedZone.estimatedGeneralSale}</div>
                <div><span className="font-medium">주요 리스크:</span> {selectedZone.riskSummary.join(', ')}</div>
                <div><span className="font-medium">주변 정비구역:</span> {selectedZone.nearbyZones.join(', ')}</div>
              </div>
            </div>
          ) : null}

          <VirtualMergeBasket selectedParcels={selectedParcels} selectedZone={selectedZone} />

          <FeasibilityCard totalLandAreaSqm={totalArea} inputs={inputs} onInputsChange={setInputs} />

          <ProjectSavePanel
            selectedParcels={selectedParcels}
            selectedZone={selectedZone}
            feasibilityInputs={inputs}
            feasibilityResults={feasibilityResults}
            virtualMergeSummary={projectVirtualMergeSummary}
            onLoadProject={handleLoadProject}
          />
        </aside>
      </div>
    </main>
  );
}
