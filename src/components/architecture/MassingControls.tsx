import type { MassingType } from '@/src/types/architecture';

interface MassingControlsProps {
  massingType: MassingType;
  onChange: (type: MassingType) => void;
}

const options: Array<{ value: MassingType; label: string }> = [
  { value: 'slab', label: '판상형' },
  { value: 'tower', label: '타워형' },
  { value: 'courtyard', label: '중정형' },
  { value: 'stepped', label: '계단형' },
];

export default function MassingControls({ massingType, onChange }: MassingControlsProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">매스 유형</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            className={`rounded border px-3 py-2 text-sm ${massingType === option.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
