import type { ParcelFeature } from '@/src/types/parcel';
import type { ZoneFeature } from '@/src/types/zone';
import { calculateVirtualMergeSummary } from '@/src/lib/calculations';
import { formatAreaPyeong, formatAreaSqm, formatCurrencyKRW, formatPercent } from '@/src/lib/format';
import Badge from '@/src/components/ui/Badge';
import StatCard from '@/src/components/ui/StatCard';
import WarningBox from '@/src/components/ui/WarningBox';

interface VirtualMergeBasketProps {
  selectedParcels: ParcelFeature[];
  selectedZone: ZoneFeature | null;
}

const noticeText = '본 결과는 개발 검토용 가상 합필 시뮬레이션입니다. 실제 합필 가능 여부는 지적, 등기, 소유권, 도시계획, 건축 인허가 검토가 필요합니다.';

const summarizeCounts = (summary: Record<string, number>) =>
  Object.entries(summary)
    .map(([key, value]) => `${key} ${value}필지`)
    .join(', ') || '없음';

const getGradeTone = (grade: string) => {
  if (grade === '양호') return 'success';
  if (grade === '주의') return 'warning';
  if (grade === '위험') return 'danger';
  return 'neutral';
};

export default function VirtualMergeBasket({ selectedParcels, selectedZone }: VirtualMergeBasketProps) {
  const summary = calculateVirtualMergeSummary(selectedParcels, selectedZone);
  const warnings = [
    summary.mixedLandUseZones ? '용도지역 혼재: 선택 필지의 용도지역이 2개 이상입니다.' : null,
    summary.roadAccessWarning ? '도로 미접 또는 접도 조건 약함: 접도 조건을 행정자료로 재확인하세요.' : null,
    summary.zoneInclusion.hasOutsideParcel ? '정비구역 일부 외부 포함: 선택 필지 중 정비구역 밖 mock 필지가 있습니다.' : null,
    !summary.isContinuous ? '비연속 필지 포함: 필지 연속성 검토가 필요합니다.' : null,
    '실제 행정검토 필요: 실제 합필 가능 여부는 지적, 등기, 소유권, 도시계획, 건축 인허가 검토 필요',
  ].filter(Boolean) as string[];

  if (!selectedParcels.length) {
    return (
      <div className="rounded-xl border border-slate-200 p-3">
        <h3 className="font-semibold">가상 합필 바구니</h3>
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          <p>아직 선택된 필지가 없습니다.</p>
          <p className="mt-1">필지 선택 모드를 켠 뒤 지도에서 검토할 필지를 클릭해보세요.</p>
        </div>
        <div className="mt-3 rounded bg-amber-50 p-3 text-sm text-amber-800">{noticeText}</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">가상 합필 바구니</h3>
          <p className="mt-1 text-sm text-slate-600">개발 검토용 필지 묶음 시뮬레이션입니다.</p>
        </div>
        <Badge tone={getGradeTone(summary.grade)}>{summary.grade}</Badge>
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 p-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <StatCard label="선택 필지 수" value={`${summary.parcelCount}필지`} />
          <StatCard label="합산 대지면적" value={formatAreaSqm(summary.totalArea)} helper={formatAreaPyeong(summary.totalArea)} />
          <StatCard label="총 공시지가" value={formatCurrencyKRW(summary.totalOfficialLandValue)} />
          <StatCard label="가상 합필 등급" value={summary.grade} />
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <div><span className="font-medium">선택 필지 목록:</span> {selectedParcels.map((parcel) => `${parcel.address} (${parcel.lotNumber})`).join(', ')}</div>
        <div><span className="font-medium">평균 공시지가:</span> ㎡당 {formatCurrencyKRW(summary.averageLandPrice)}</div>
        <div><span className="font-medium">용도지역 구성:</span> {summarizeCounts(summary.landUseZones)}</div>
        <div><span className="font-medium">용도지역 혼재 여부:</span> {summary.mixedLandUseZones ? '혼재' : '단일'}</div>
        <div><span className="font-medium">평균 건축물 노후도:</span> {summary.averageBuildingAge.toFixed(1)}년</div>
        <div><span className="font-medium">30년 이상 건축물 비율:</span> {formatPercent(summary.oldBuildingRatio)}</div>
        <div><span className="font-medium">접도 조건 요약:</span> {summarizeCounts(summary.roadAccess)}</div>
        <div><span className="font-medium">접도 경고 여부:</span> {summary.roadAccessWarning ? '경고' : '없음'}</div>
        <div><span className="font-medium">정비구역 포함 여부:</span> {summary.zoneInclusion.hasOutsideParcel ? '일부 외부 포함' : '전부 포함'}</div>
        <div><span className="font-medium">정비구역 포함률:</span> {formatPercent(summary.zoneInclusion.ratio)}</div>
        <div><span className="font-medium">필지 연속성 여부:</span> {summary.isContinuous ? '연속' : '비연속 또는 검토 필요'}</div>
      </div>

      <div className="mt-3">
        <WarningBox title="경고 및 안내">
          <ul className="list-disc space-y-1 pl-5">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </WarningBox>
      </div>

      <div className="mt-3 rounded bg-slate-50 p-3 text-sm text-slate-700">{noticeText}</div>
    </div>
  );
}
