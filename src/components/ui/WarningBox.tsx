import type { ReactNode } from 'react';

interface WarningBoxProps {
  children: ReactNode;
  title?: string;
  tone?: 'amber' | 'blue' | 'slate' | 'emerald';
}

const toneClassName = {
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  blue: 'border-blue-200 bg-blue-50 text-blue-800',
  slate: 'border-slate-200 bg-slate-50 text-slate-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

export default function WarningBox({ children, title, tone = 'amber' }: WarningBoxProps) {
  return (
    <div className={`rounded-lg border p-3 text-sm ${toneClassName[tone]}`}>
      {title ? <div className="font-semibold">{title}</div> : null}
      <div className={title ? 'mt-2' : undefined}>{children}</div>
    </div>
  );
}
