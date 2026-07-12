import type { ArchitectureWorkflowStep, ArchitectureWorkflowStatus } from '@/src/types/architecture';

interface ArchitectureWorkflowPanelProps {
  steps: ArchitectureWorkflowStep[];
}

const statusLabel: Record<ArchitectureWorkflowStatus, string> = {
  supported: '현재 지원',
  partial: '부분 지원',
  future: '향후 연동',
};

const statusClassName: Record<ArchitectureWorkflowStatus, string> = {
  supported: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  partial: 'border-amber-200 bg-amber-50 text-amber-800',
  future: 'border-slate-200 bg-slate-50 text-slate-600',
};

export default function ArchitectureWorkflowPanel({ steps }: ArchitectureWorkflowPanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">건축계획검토 흐름</h2>
      <p className="mt-1 text-sm text-slate-500">
        현재는 3D 매스모델 단계까지만 검토하며, 수동 규제 입력은 향후 API 후보값으로 대체하는 전제로 구성했습니다.
      </p>

      <div className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-slate-400">STEP {index + 1}</div>
                <h3 className="mt-0.5 font-semibold text-slate-900">{step.title}</h3>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-1 text-xs font-medium ${statusClassName[step.status]}`}>
                {statusLabel[step.status]}
              </span>
            </div>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-800">현재:</span> {step.currentScope}
              </p>
              <p>
                <span className="font-medium text-slate-800">향후:</span> {step.futureScope}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
