'use client';

import { useCallback, useMemo, useState } from 'react';
import { mockZones } from '@/src/data/mockZones';
import { mockParcels } from '@/src/data/mockParcels';
import MapView from '@/src/components/map/MapView';
import SidebarFilters from '@/src/components/sidebar/SidebarFilters';
import ZoneDetailPanel from '@/src/components/panel/ZoneDetailPanel';
import VirtualMergeBasket from '@/src/components/panel/VirtualMergeBasket';
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

  const totalArea = useMemo(() => calculateTotalArea(selectedParcels), [selectedParcels]);
  const virtualMergeSummary = useMemo(() => calculateVirtualMergeSummary(selectedParcels, selectedZone), [selectedParcels, selectedZone]);
  const feasibilityResults = useMemo(() => calculateFeasibility(totalArea, inputs), [totalArea, inputs]);
  const projectVirtualMergeSummary = useMemo(() => toProjectVirtualMergeSummary(virtualMergeSummary), [virtualMergeSummary]);

  const handleToggleParcel = useCallback((parcel: ParcelFeature) => {
    setSelectedParcels((current) => {
      const exists = current.some((item) => item.id === parcel.id);
      return exists ? current.filter((item) => item.id !== parcel.id) : [...current, parcel];
    });
  }, []);

  const handleLoadProject = useCallback((record: SavedProject) => {
    const parcelMap = new Map(mockParcels.map((parcel) => [parcel.id, parcel]));
    const zone = mockZones.find((item) => item.id === record.selectedZoneId);

    setSelectedParcels(record.selectedParcelIds.map((id) => parcelMap.get(id)).filter(Boolean) as ParcelFeature[]);
    if (zone) setSelectedZone(zone);
    setInputs(record.feasibilityInputs);
  }, []);

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
        <SidebarFilters
          selectionMode={selectionMode}
          onClearSelection={() => setSelectedParcels([])}
          onToggleSelectionMode={() => setSelectionMode((prev) => !prev)}
        />

        <MapView
          selectedParcels={selectedParcels}
          selectionMode={selectionMode}
          onSelectZone={setSelectedZone}
          onToggleParcel={handleToggleParcel}
        />

        <aside className="space-y-4 rounded-2xl bg-white p-4 shadow">
          <ZoneDetailPanel selectedZone={selectedZone} />

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
