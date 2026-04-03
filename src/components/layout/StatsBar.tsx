import type { Stats } from '../../types';
import type { LeadFilters } from '../../types';

type Segment = LeadFilters['segment'];

interface Pill {
  id: Segment;
  label: string;
  valueKey: keyof Stats | 'qualified';
  color: string;
  sub?: string;
}

const PILLS: Pill[] = [
  { id: 'all',          label: 'Total',        valueKey: 'total',        color: 'text-gray-700' },
  { id: 'qualified',    label: 'Qualified',     valueKey: 'qualified',    color: 'text-green-600', sub: 'hot + warm' },
  { id: 'hot_verified', label: '🔥 Hot Verified', valueKey: 'hot_verified', color: 'text-orange-600' },
  { id: 'hot',          label: '🔥 Hot',         valueKey: 'hot',          color: 'text-red-600' },
  { id: 'warm',         label: '🌡 Warm',         valueKey: 'warm',         color: 'text-yellow-600' },
  { id: 'cold',         label: '❄ Cold',          valueKey: 'cold',         color: 'text-blue-600' },
  { id: 'disqualified', label: '✗ Disqualified',  valueKey: 'disqualified', color: 'text-gray-500' },
  { id: 'pending',      label: '⏳ Pending',       valueKey: 'pending',      color: 'text-purple-600' },
];

interface StatsBarProps {
  stats: Stats | null;
  segment: Segment;
  onSegmentChange: (s: Segment) => void;
}

export default function StatsBar({ stats, segment, onSegmentChange }: StatsBarProps) {
  const getValue = (pill: Pill): string => {
    if (!stats) return '—';
    if (pill.valueKey === 'qualified') return String((stats.hot_verified ?? 0) + (stats.hot ?? 0) + (stats.warm ?? 0));
    return String(stats[pill.valueKey as keyof Stats] ?? 0);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 flex overflow-x-auto">
      {PILLS.map(pill => (
        <button
          key={pill.id}
          onClick={() => onSegmentChange(pill.id)}
          className={`flex flex-col items-center justify-center gap-px px-4 py-2 border-r border-gray-100 last:border-r-0 transition-colors ${
            segment === pill.id ? 'bg-blue-50' : 'hover:bg-gray-50'
          }`}
        >
          <span className={`text-[10px] uppercase tracking-wide font-medium ${pill.color}`}>{pill.label}</span>
          <span className={`font-bold text-base ${pill.color}`}>{getValue(pill)}</span>
          {pill.sub && <span className="text-[9px] text-gray-400">{pill.sub}</span>}
        </button>
      ))}
    </div>
  );
}
