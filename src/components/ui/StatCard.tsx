import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
}

export default function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold">{value}</div>
      {helper ? <div className="text-xs text-slate-500">{helper}</div> : null}
    </div>
  );
}
