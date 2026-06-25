'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { mockZones } from '@/src/data/mockZones';
import { mockParcels } from '@/src/data/mockParcels';
import type { ParcelFeature } from '@/src/types/parcel';
import type { ZoneFeature } from '@/src/types/zone';
import { calculateFeasibility, calculateTotalArea } from '@/src/lib/calculations';
import { createProjectRecord, deleteProject, loadProjects, saveProject, type FeasibilityInputs } from '@/src/lib/storage';

const initialInputs: FeasibilityInputs = {
  floorAreaRatio: 250,
  averageHouseArea: 85,
  expectedSalePrice: 18000000,
  constructionCostPerSqm: 2800000,
  otherCostRatio: 0.15,
};

export default function Home() {
  const [selectedZone, setSelectedZone] = useState<ZoneFeature | null>(mockZones[0]);
  const [selectedParcels, setSelectedParcels] = useState<ParcelFeature[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [projectName, setProjectName] = useState('장위동 가상 합필');
  const [savedProjects, setSavedProjects] = useState(loadProjects());
  const [inputs, setInputs] = useState(initialInputs);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const selectionModeRef = useRef(selectionMode);

  const feasibility = useMemo(() => calculateFeasibility(selectedParcels), [selectedParcels]);

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

  const handleSaveProject = () => {
    const record = createProjectRecord(projectName, selectedParcels, inputs, feasibility as Record<string, number | string | Record<string, number>>, '개발 검토용 가상 합필 시뮬레이션');
    saveProject(record);
    setSavedProjects(loadProjects());
  };

  const handleLoadProject = (record: ReturnType<typeof createProjectRecord>) => {
    const parcelMap = new Map(mockParcels.map((parcel) => [parcel.id, parcel]));
    setSelectedParcels(record.selectedParcelIds.map((id) => parcelMap.get(id)).filter(Boolean) as ParcelFeature[]);
    setProjectName(record.projectName);
    setInputs(record.feasibilityInputs as FeasibilityInputs);
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
    setSavedProjects(loadProjects());
  };

  const totalArea = calculateTotalArea(selectedParcels);
  const estimatedAnnualFloorArea = totalArea * (inputs.floorAreaRatio / 100);
  const estimatedHouseholds = estimatedAnnualFloorArea / inputs.averageHouseArea;
  const estimatedSaleRevenue = estimatedAnnualFloorArea * inputs.expectedSalePrice;
  const totalConstructionCost = estimatedAnnualFloorArea * inputs.constructionCostPerSqm;
  const otherCost = totalConstructionCost * inputs.otherCostRatio;
  const totalProjectCost = totalConstructionCost + otherCost;
  const estimatedProfit = estimatedSaleRevenue - totalProjectCost;
  const roi = totalProjectCost > 0 ? (estimatedProfit / totalProjectCost) * 100 : 0;

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

          <div className="rounded-xl border border-slate-200 p-3">
            <h3 className="font-semibold">가상 합필 바구니</h3>
            <p className="mt-2 text-sm text-slate-600">개발 검토용 필지 묶음으로 확인하고 있습니다.</p>
            <div className="mt-3 space-y-2 text-sm">
              <div>선택 필지 수: {selectedParcels.length}</div>
              <div>선택 필지 목록: {selectedParcels.length ? selectedParcels.map((parcel) => parcel.lotNumber).join(', ') : '없음'}</div>
              <div>합산 대지면적: {totalArea.toLocaleString()}㎡</div>
              <div>평균 공시지가: {feasibility.averageLandPrice.toLocaleString()}원/㎡</div>
              <div>총 공시지가: {feasibility.totalOfficialLandValue.toLocaleString()}원</div>
              <div>용도지역 구성: {Object.entries(feasibility.landUseZones).map(([key, value]) => `${key}:${value}`).join(', ') || '없음'}</div>
              <div>평균 건축물 노후도: {feasibility.averageBuildingAge.toFixed(1)}년</div>
              <div>30년 이상 건축물 비율: {feasibility.oldBuildingRatio.toFixed(1)}%</div>
              <div>접도 조건 요약: {Object.entries(feasibility.roadAccess).map(([key, value]) => `${key}:${value}`).join(', ') || '없음'}</div>
              <div>정비구역 포함 여부: {feasibility.zoneInclusionRatio.toFixed(1)}%</div>
              <div>가상 합필 검토 등급: {feasibility.grade}</div>
            </div>
            <div className="mt-3 rounded bg-amber-50 p-3 text-sm text-amber-800">
              본 결과는 개발 검토용 가상 합필 시뮬레이션입니다. 실제 합필 가능 여부는 지적, 등기, 소유권, 도시계획, 건축 인허가 검토가 필요합니다.
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <h3 className="font-semibold">기초 사업성 카드</h3>
            <div className="mt-3 grid gap-2 text-sm">
              <label className="grid gap-1">
                <span>적용 용적률</span>
                <input className="rounded border px-2 py-1" type="number" value={inputs.floorAreaRatio} onChange={(e) => setInputs((prev) => ({ ...prev, floorAreaRatio: Number(e.target.value) }))} />
              </label>
              <label className="grid gap-1">
                <span>평균 세대면적</span>
                <input className="rounded border px-2 py-1" type="number" value={inputs.averageHouseArea} onChange={(e) => setInputs((prev) => ({ ...prev, averageHouseArea: Number(e.target.value) }))} />
              </label>
              <label className="grid gap-1">
                <span>예상 분양가</span>
                <input className="rounded border px-2 py-1" type="number" value={inputs.expectedSalePrice} onChange={(e) => setInputs((prev) => ({ ...prev, expectedSalePrice: Number(e.target.value) }))} />
              </label>
              <label className="grid gap-1">
                <span>평당 공사비</span>
                <input className="rounded border px-2 py-1" type="number" value={inputs.constructionCostPerSqm} onChange={(e) => setInputs((prev) => ({ ...prev, constructionCostPerSqm: Number(e.target.value) }))} />
              </label>
              <label className="grid gap-1">
                <span>기타사업비율</span>
                <input className="rounded border px-2 py-1" type="number" step="0.01" value={inputs.otherCostRatio} onChange={(e) => setInputs((prev) => ({ ...prev, otherCostRatio: Number(e.target.value) }))} />
              </label>
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <div>예상 연면적: {estimatedAnnualFloorArea.toLocaleString()}㎡</div>
              <div>예상 세대수: {estimatedHouseholds.toFixed(0)}세대</div>
              <div>예상 총분양수입: {estimatedSaleRevenue.toLocaleString()}원</div>
              <div>예상 총공사비: {totalConstructionCost.toLocaleString()}원</div>
              <div>예상 기타사업비: {otherCost.toLocaleString()}원</div>
              <div>예상 총사업비: {totalProjectCost.toLocaleString()}원</div>
              <div>예상 개발이익: {estimatedProfit.toLocaleString()}원</div>
              <div>ROI: {roi.toFixed(1)}%</div>
            </div>
            <div className="mt-3 rounded bg-blue-50 p-3 text-sm text-blue-800">
              이 계산은 기초 시뮬레이션이며 실제 사업성은 인허가, 권리관계, 감정평가, 분양가, 공사비, 금융비용, 조합원 분담금 등에 따라 달라질 수 있습니다.
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <h3 className="font-semibold">프로젝트 저장</h3>
            <input className="mt-2 w-full rounded border px-2 py-1" placeholder="프로젝트 이름" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            <button className="mt-2 w-full rounded bg-emerald-600 px-3 py-2 text-white" onClick={handleSaveProject}>저장</button>
            <div className="mt-3 space-y-2 text-sm">
              {savedProjects.map((project) => (
                <div key={project.projectId} className="rounded border p-2">
                  <div className="font-medium">{project.projectName}</div>
                  <div className="text-xs text-slate-500">{new Date(project.createdAt).toLocaleString()}</div>
                  <div className="mt-2 flex gap-2">
                    <button className="rounded bg-slate-800 px-2 py-1 text-white" onClick={() => handleLoadProject(project)}>불러오기</button>
                    <button className="rounded bg-red-500 px-2 py-1 text-white" onClick={() => handleDeleteProject(project.projectId)}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
