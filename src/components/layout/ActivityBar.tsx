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
    <div className="bg-blue-50 border-b border-blue-200 px-5 py-1.5 flex items-center gap-2 text-xs text-blue-700 overflow-x-auto">
      <span className="inline-flex items-center gap-1.5 shrink-0 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
        Pipeline running:
      </span>
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
  );
}
