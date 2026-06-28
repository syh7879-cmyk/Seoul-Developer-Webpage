import type { ReactNode } from 'react';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
}

const toneClassName: Record<BadgeTone, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
};

export default function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClassName[tone]}`}>
      {children}
    </span>
  );
}
