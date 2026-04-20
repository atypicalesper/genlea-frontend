import type { ActiveJob } from '../../types';

const STAGE_COLORS: Record<string, string> = {
  discovery:  'bg-blue-100 text-blue-700',
  enrichment: 'bg-indigo-100 text-indigo-700',
  scoring:    'bg-purple-100 text-purple-700',
};

interface ActivityBarProps { jobs: ActiveJob[] }

export default function ActivityBar({ jobs }: ActivityBarProps) {
  if (!jobs.length) return null;

  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const fresh = jobs.filter(j => j.startedAt && new Date(j.startedAt).getTime() > fiveMinAgo);
  if (!fresh.length) return null;

  return (
    <div className="mx-3 mt-3 rounded-2xl border border-teal-200/80 bg-teal-50/90 px-4 py-2 text-xs text-teal-900 shadow-sm shadow-teal-900/5 sm:mx-4 lg:mx-6">
      <div className="flex items-start gap-3 overflow-x-auto">
        <span className="inline-flex items-center gap-2 shrink-0 font-semibold">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse inline-block" />
          {fresh.length} active pipeline job{fresh.length === 1 ? '' : 's'}
        </span>
        <span className="text-teal-700/70 shrink-0">Recent activity:</span>
        <div className="flex gap-1.5 flex-wrap">
          {fresh.map(j => {
            const label = j.queue === 'discovery' ? j.source : j.queue === 'enrichment' ? j.domain : 'scoring';
            return (
              <span key={j.jobId} className={`px-2 py-0.5 rounded-full font-medium ${STAGE_COLORS[j.queue]}`}>
                {j.queue}:{label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
