'use client';

import { useMemo, useState } from 'react';
import { mockParcels } from '@/src/data/mockParcels';
import RegulationInputPanel from '@/src/components/architecture/RegulationInputPanel';
import SiteAnalysisSummary from '@/src/components/architecture/SiteAnalysisSummary';
import BuildableAreaSummary from '@/src/components/architecture/BuildableAreaSummary';
import MassingControls from '@/src/components/architecture/MassingControls';
import MassingPreview3D from '@/src/components/architecture/MassingPreview3D';
import type { ArchitectureSite, MassingType } from '@/src/types/architecture';
import { calculateTotalArea } from '@/src/lib/calculations';
import { defaultRegulationInputs } from '@/src/lib/architecture/regulations';
import { calculateBuildableArea } from '@/src/lib/architecture/buildableArea';
import { createMassingModel } from '@/src/lib/architecture/massing';

const labParcels = mockParcels.slice(0, 8);

const architectureSite: ArchitectureSite = {
  id: 'jangwi-massing-lab',
  name: '장위동 mock 합필 대지',
  address: '서울 성북구 장위동 일대',
  totalLandAreaSqm: calculateTotalArea(labParcels),
  parcelCount: labParcels.length,
  roadAccessSummary: '양호/보통 필지 중심, 일부 접도 조건은 추가 검토 필요',
  contextSummary: [
    '현재는 mock 필지 기반의 건축 매스 검토 Lab입니다.',
    '규제값은 수동 입력이며 향후 토지이용계획, 조례, 지구단위계획 API 후보값으로 대체할 수 있습니다.',
    '3D 모델은 조감도나 인허가 판정이 아니라 개발 검토용 매스 시뮬레이션입니다.',
  ],
};

export default function ArchitectureLabPage() {
  const [regulationInputs, setRegulationInputs] = useState(defaultRegulationInputs);
  const [massingType, setMassingType] = useState<MassingType>('slab');
  const buildableArea = useMemo(() => calculateBuildableArea(architectureSite.totalLandAreaSqm, regulationInputs), [regulationInputs]);
  const massing = useMemo(() => createMassingModel(buildableArea, massingType), [buildableArea, massingType]);

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">건축 매스 검토 Lab</h1>
        <p className="text-sm text-slate-600">개발 검토용 3D 매스 시뮬레이션입니다. 실제 건축 가능 여부는 법령, 조례, 지구단위계획, 건축심의, 구조, 피난, 주차, 인허가 검토가 필요합니다.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <SiteAnalysisSummary site={architectureSite} />
          <RegulationInputPanel inputs={regulationInputs} onChange={setRegulationInputs} />
          <MassingControls massingType={massingType} onChange={setMassingType} />
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            본 결과는 개발 검토용 3D 매스 시뮬레이션입니다. 실제 건축 가능 여부는 법령, 조례, 지구단위계획, 건축심의, 구조, 피난, 주차, 인허가 검토가 필요합니다.
          </div>
        </aside>

        <section className="space-y-4">
          <BuildableAreaSummary result={buildableArea} />
          <MassingPreview3D buildableArea={buildableArea} massing={massing} />
        </section>
      </div>
    </main>
  );
}
