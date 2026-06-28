import type { ZoneFeature } from '@/src/types/zone';

interface ZoneDetailPanelProps {
  selectedZone: ZoneFeature | null;
}

export default function ZoneDetailPanel({ selectedZone }: ZoneDetailPanelProps) {
  if (!selectedZone) {
    return (
      <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
        정비구역을 클릭하면 상세정보를 확인할 수 있습니다.
      </div>
    );
  }

  return (
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
  );
}
