import type { BuildableAreaResult } from '@/src/types/architecture';
import { formatAreaPyeong, formatAreaSqm, formatPercent } from '@/src/lib/format';

interface BuildableAreaSummaryProps {
  result: BuildableAreaResult;
}

export default function BuildableAreaSummary({ result }: BuildableAreaSummaryProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">건축 가능 영역 요약</h2>
      <div className="mt-3 space-y-2 text-sm text-slate-700">
        <div><span className="font-medium">최대 건축면적:</span> {formatAreaSqm(result.maxBuildingAreaSqm)} / 약 {formatAreaPyeong(result.maxBuildingAreaSqm)}</div>
        <div><span className="font-medium">최대 연면적:</span> {formatAreaSqm(result.maxGrossFloorAreaSqm)} / 약 {formatAreaPyeong(result.maxGrossFloorAreaSqm)}</div>
        <div><span className="font-medium">예상 층별 바닥면적:</span> {formatAreaSqm(result.estimatedFloorPlateSqm)}</div>
        <div><span className="font-medium">예상 층수:</span> {result.estimatedFloors}층</div>
        <div><span className="font-medium">예상 높이:</span> {result.estimatedHeightM.toFixed(1)}m</div>
        <div><span className="font-medium">이격거리:</span> {result.setbackM}m</div>
        <div><span className="font-medium">공지 후보 면적:</span> {formatAreaSqm(result.openSpaceAreaSqm)}</div>
        <div><span className="font-medium">건폐율 소진율:</span> {formatPercent(result.coverageUsedRatio)}</div>
        <div><span className="font-medium">용적률 소진율:</span> {formatPercent(result.farUsedRatio)}</div>
      </div>
    </section>
  );
}
