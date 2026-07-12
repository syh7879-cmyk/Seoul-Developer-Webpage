import type { ArchitectureSite } from '@/src/types/architecture';
import { formatAreaPyeong, formatAreaSqm } from '@/src/lib/format';

interface SiteAnalysisSummaryProps {
  site: ArchitectureSite;
}

export default function SiteAnalysisSummary({ site }: SiteAnalysisSummaryProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">대지분석</h2>
      <div className="mt-3 space-y-2 text-sm text-slate-700">
        <div><span className="font-medium">대상:</span> {site.name}</div>
        <div><span className="font-medium">주소:</span> {site.address}</div>
        <div><span className="font-medium">필지 수:</span> {site.parcelCount}필지</div>
        <div><span className="font-medium">대지면적:</span> {formatAreaSqm(site.totalLandAreaSqm)} / 약 {formatAreaPyeong(site.totalLandAreaSqm)}</div>
        <div><span className="font-medium">접도 조건:</span> {site.roadAccessSummary}</div>
      </div>
      <div className="mt-3 rounded bg-slate-50 p-3 text-sm text-slate-600">
        {site.contextSummary.map((item) => (
          <div key={item}>- {item}</div>
        ))}
      </div>
    </section>
  );
}
