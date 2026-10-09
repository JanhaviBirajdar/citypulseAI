import React from 'react';
import { Database } from 'lucide-react';

interface DemoBadgeProps {
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({
  label = 'DEMO DATA',
  className = '',
  size = 'sm'
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold tracking-wider uppercase rounded-full border border-amber-300 bg-amber-50 text-amber-800 ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${className}`}
      title="This record is explicitly labeled sample demo data for hackathon demonstration."
    >
      <Database className={size === 'sm' ? 'w-2.5 h-2.5 text-amber-600' : 'w-3 h-3 text-amber-600'} />
      {label}
    </span>
  );
};
