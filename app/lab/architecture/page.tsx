'use client';

import { useMemo, useState } from 'react';
import { mockParcels } from '@/src/data/mockParcels';
import RegulationInputPanel from '@/src/components/architecture/RegulationInputPanel';
import SiteAnalysisSummary from '@/src/components/architecture/SiteAnalysisSummary';
import BuildableAreaSummary from '@/src/components/architecture/BuildableAreaSummary';
import MassingControls from '@/src/components/architecture/MassingControls';
import MassingPreview3D from '@/src/components/architecture/MassingPreview3D';
import ArchitectureWorkflowPanel from '@/src/components/architecture/ArchitectureWorkflowPanel';
import type { ArchitectureSite, ArchitectureWorkflowStep, MassingType } from '@/src/types/architecture';
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

const workflowSteps: ArchitectureWorkflowStep[] = [
  {
    id: 'regulation-sync',
    title: '법령 동기화 및 정리',
    status: 'partial',
    currentScope: '건폐율, 용적률, 최고층수, 높이, 이격거리 등 핵심 규제값을 수동 입력합니다.',
    futureScope: '토지이용계획, 조례, 지구단위계획, 건축 관련 API 후보값으로 자동 채움 구조를 연결합니다.',
  },
  {
    id: 'site-analysis',
    title: '대지분석',
    status: 'supported',
    currentScope: 'mock 필지를 기준으로 대지면적, 필지 수, 접도 요약을 표시합니다.',
    futureScope: '연속지적도, 도로, 하천, 주변 건축물, 좌표계 변환 결과를 통합 분석합니다.',
  },
  {
    id: 'buildable-area',
    title: '건축 가능 영역 분석',
    status: 'supported',
    currentScope: '입력 규제값으로 최대 건축면적, 최대 연면적, 예상 층수와 높이를 계산합니다.',
    futureScope: '사선, 일조, 공개공지, 주차, 피난, 지구단위계획 조건을 단계적으로 추가합니다.',
  },
  {
    id: 'design-mockup',
    title: '디자인 목업 생성',
    status: 'partial',
    currentScope: '판상형, 타워형, 중정형, 계단형 중 하나를 골라 검토용 건축 스터디 매스를 생성합니다.',
    futureScope: '배치 대안 비교, 주동 간격, 코어 위치, 저층부 프로그램 같은 설계 변수 입력을 추가합니다.',
  },
  {
    id: 'massing-preview',
    title: '3D 매스 형성',
    status: 'supported',
    currentScope: '포디움, 주동, 코어, 옥탑, 층 구분선, 입면 리듬이 포함된 3D 매스모델을 표시합니다.',
    futureScope: '조감도 생성은 이번 범위에서 제외하고, 3D 매스 검토 품질과 데이터 연계를 우선 고도화합니다.',
  },
];

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
          <ArchitectureWorkflowPanel steps={workflowSteps} />
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
