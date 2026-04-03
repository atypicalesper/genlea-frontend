import type { LeadStatus, PipelineStatus, ScrapeJobStatus } from '../../types';

// ─── Status → style map (Open/Closed — add new statuses without touching logic)

const STATUS_STYLES: Record<string, string> = {
  hot_verified:  'bg-orange-50 text-orange-700 border border-orange-200',
  hot:           'bg-red-50 text-red-600 border border-red-200',
  warm:          'bg-yellow-50 text-yellow-700 border border-yellow-200',
  cold:          'bg-blue-50 text-blue-700 border border-blue-200',
  disqualified:  'bg-gray-100 text-gray-500 border border-gray-200',
  pending:       'bg-purple-50 text-purple-700 border border-purple-200',
  // pipeline
  discovered:    'bg-slate-50 text-slate-600 border border-slate-200',
  watchlist:     'bg-amber-50 text-amber-700 border border-yellow-200',
  enriching:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
  enriched:      'bg-teal-50 text-teal-700 border border-teal-200',
  scoring:       'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200',
  scored:        'bg-green-50 text-green-700 border border-green-200',
  // scrape job
  processing:    'bg-blue-50 text-blue-700 border border-blue-200',
  success:       'bg-green-50 text-green-700 border border-green-200',
  failed:        'bg-red-50 text-red-600 border border-red-200',
  partial:       'bg-yellow-50 text-yellow-700 border border-yellow-200',
  skipped:       'bg-gray-50 text-gray-400 border border-gray-200',
  queued:        'bg-slate-50 text-slate-500 border border-slate-200',
};

const STATUS_LABELS: Record<string, string> = {
  hot_verified: '🔥 Hot Verified',
  hot:          '🔥 Hot',
  warm:         '🌡 Warm',
  cold:         '❄ Cold',
  disqualified: '✗ Disqualified',
  pending:      '⏳ Pending',
};

interface BadgeProps {
  status: LeadStatus | PipelineStatus | ScrapeJobStatus | string;
  className?: string;
}

export default function Badge({ status, className = '' }: BadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-500';
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${style} ${className}`}>
      {label}
    </span>
  );
}
