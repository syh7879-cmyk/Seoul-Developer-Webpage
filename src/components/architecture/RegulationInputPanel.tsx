import type { RegulationInputs, RegulationSource } from '@/src/types/architecture';

interface RegulationInputPanelProps {
  inputs: RegulationInputs;
  onChange: (inputs: RegulationInputs) => void;
}

const numberFields: Array<{ key: keyof Pick<RegulationInputs, 'buildingCoverageRatio' | 'floorAreaRatio' | 'maxFloors' | 'maxHeightM' | 'setbackM' | 'openSpaceRatio'>; label: string; suffix: string }> = [
  { key: 'buildingCoverageRatio', label: '건폐율', suffix: '%' },
  { key: 'floorAreaRatio', label: '용적률', suffix: '%' },
  { key: 'maxFloors', label: '최고층수', suffix: '층' },
  { key: 'maxHeightM', label: '최고높이', suffix: 'm' },
  { key: 'setbackM', label: '이격거리', suffix: 'm' },
  { key: 'openSpaceRatio', label: '공지/공개공지 비율', suffix: '%' },
];

export default function RegulationInputPanel({ inputs, onChange }: RegulationInputPanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">규제값 입력</h2>
      <p className="mt-1 text-sm text-slate-500">현재는 수동 입력값이며, 향후 토지이용계획/조례 API 후보값으로 대체할 수 있도록 분리했습니다.</p>

      <label className="mt-4 grid gap-1 text-sm">
        <span>용도지역</span>
        <input className="rounded border px-3 py-2" value={inputs.landUseZone} onChange={(event) => onChange({ ...inputs, landUseZone: event.target.value })} />
      </label>

      <label className="mt-3 grid gap-1 text-sm">
        <span>입력값 출처</span>
        <select className="rounded border px-3 py-2" value={inputs.source} onChange={(event) => onChange({ ...inputs, source: event.target.value as RegulationSource })}>
          <option value="manual">수동 입력</option>
          <option value="api-candidate">API 후보값</option>
          <option value="mixed">수동 + API 후보값</option>
        </select>
      </label>

      <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
        {numberFields.map((field) => (
          <label key={field.key} className="grid gap-1">
            <span className="flex justify-between">
              <span>{field.label}</span>
              <span className="text-xs text-slate-500">{field.suffix}</span>
            </span>
            <input
              className="rounded border px-3 py-2"
              min={0}
              type="number"
              value={inputs[field.key]}
              onChange={(event) => onChange({ ...inputs, [field.key]: Number(event.target.value) })}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
