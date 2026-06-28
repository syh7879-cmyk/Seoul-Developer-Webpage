import type { ReactNode } from 'react';
import type { FeasibilityInputs, FeasibilityResults } from '@/src/types/feasibility';
import { calculateFeasibility } from '@/src/lib/calculations';
import { formatAreaPyeong, formatAreaSqm, formatCurrencyKRW, formatNumber, formatPercent } from '@/src/lib/format';

interface FeasibilityCardProps {
  totalLandAreaSqm: number;
  inputs: FeasibilityInputs;
  onInputsChange: (inputs: FeasibilityInputs) => void;
}

type InputKey = keyof FeasibilityInputs;

const inputFields: Array<{ key: InputKey; label: string; suffix: string; step?: number }> = [
  { key: 'appliedFar', label: '적용 용적률', suffix: '%' },
  { key: 'averageUnitAreaSqm', label: '평균 세대면적', suffix: '㎡' },
  { key: 'expectedSalePricePerSqm', label: '예상 분양가', suffix: '원/㎡', step: 100000 },
  { key: 'constructionCostPerSqm', label: '공사비', suffix: '원/㎡', step: 100000 },
  { key: 'otherCostRatio', label: '기타사업비율', suffix: '%' },
];

const ResultRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0">
    <span className="text-slate-600">{label}</span>
    <span className="text-right font-medium text-slate-900">{children}</span>
  </div>
);

export default function FeasibilityCard({ totalLandAreaSqm, inputs, onInputsChange }: FeasibilityCardProps) {
  const results: FeasibilityResults = calculateFeasibility(totalLandAreaSqm, inputs);
  const hasSelectedParcels = totalLandAreaSqm > 0;

  const updateInput = (key: InputKey, value: number) => {
    onInputsChange({
      ...inputs,
      [key]: Math.max(0, Number.isFinite(value) ? value : 0),
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <h3 className="font-semibold">기초 사업성 카드</h3>

      {!hasSelectedParcels ? (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          필지를 선택하면 기초 사업성 시뮬레이션을 확인할 수 있습니다.
        </div>
      ) : null}

      <div className="mt-3 grid gap-2 text-sm">
        {inputFields.map((field) => (
          <label key={field.key} className="grid gap-1">
            <span className="flex items-center justify-between text-slate-700">
              <span>{field.label}</span>
              <span className="text-xs text-slate-500">{field.suffix}</span>
            </span>
            <input
              className="rounded border px-2 py-1"
              min={0}
              step={field.step ?? 1}
              type="number"
              value={inputs[field.key]}
              onChange={(event) => updateInput(field.key, Number(event.target.value))}
            />
          </label>
        ))}
      </div>

      {hasSelectedParcels ? (
        <div className="mt-3 rounded-lg border border-slate-200 p-3 text-sm">
          <ResultRow label="합산 대지면적">{formatAreaSqm(results.totalLandAreaSqm)} / 약 {formatAreaPyeong(results.totalLandAreaSqm)}</ResultRow>
          <ResultRow label="적용 용적률">{formatPercent(inputs.appliedFar)}</ResultRow>
          <ResultRow label="예상 연면적">{formatAreaSqm(results.expectedGfaSqm)} / 약 {formatAreaPyeong(results.expectedGfaSqm)}</ResultRow>
          <ResultRow label="예상 세대수">{formatNumber(results.expectedHouseholds)}세대</ResultRow>
          <ResultRow label="예상 총분양수입">{formatCurrencyKRW(results.expectedSalesRevenue)}</ResultRow>
          <ResultRow label="예상 총공사비">{formatCurrencyKRW(results.expectedConstructionCost)}</ResultRow>
          <ResultRow label="예상 기타사업비">{formatCurrencyKRW(results.expectedOtherCost)}</ResultRow>
          <ResultRow label="예상 총사업비">{formatCurrencyKRW(results.expectedTotalCost)}</ResultRow>
          <ResultRow label="예상 개발이익">{formatCurrencyKRW(results.expectedProfit)}</ResultRow>
          <ResultRow label="ROI">{results.roi.toFixed(1)}%</ResultRow>
        </div>
      ) : null}

      <div className="mt-3 rounded bg-blue-50 p-3 text-sm text-blue-800">
        이 계산은 기초 시뮬레이션이며 실제 사업성은 인허가, 권리관계, 감정평가, 분양가, 공사비, 금융비용, 조합원 분담금 등에 따라 달라질 수 있습니다.
      </div>
    </div>
  );
}
