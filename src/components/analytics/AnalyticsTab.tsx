import { useCallback, useEffect, useState } from 'react';
import { fetchStats, fetchQueueStats, fetchLogStats } from '../../api/endpoints';
import type { Stats, QueueStats, LogStats } from '../../types';
import AnalyticsSkeleton from '../ui/skeletons/AnalyticsSkeleton';
import ApiOffline from '../ui/ApiOffline';
import Button from '../ui/Button';

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color ?? 'text-gray-900'}`}>{value}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── Status bar chart (CSS-only) ──────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  hot_verified: 'bg-orange-500',
  hot:          'bg-red-400',
  warm:         'bg-yellow-400',
  cold:         'bg-blue-300',
  disqualified: 'bg-gray-300',
  pending:      'bg-gray-200',
};
const STATUS_LABELS: Record<string, string> = {
  hot_verified: 'Hot Verified', hot: 'Hot', warm: 'Warm',
  cold: 'Cold', disqualified: 'Disqualified', pending: 'Pending',
};

function StatusBreakdown({ stats }: { stats: Stats }) {
  const keys: (keyof Stats)[] = ['hot_verified','hot','warm','cold','disqualified','pending'];
  const total = stats.total || 1;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">Lead Status Breakdown</div>
      <div className="flex h-4 rounded-full overflow-hidden mb-3">
        {keys.map(k => {
          const pct = (stats[k] / total) * 100;
          return pct > 0 ? (
            <div
              key={k}
              className={STATUS_COLORS[k as string]}
              style={{ width: `${pct}%` }}
              title={`${STATUS_LABELS[k as string]}: ${stats[k]}`}
            />
          ) : null;
        })}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        {keys.map(k => (
          <div key={k} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_COLORS[k as string]}`} />
            <span className="text-gray-600">{STATUS_LABELS[k as string]}</span>
            <span className="ml-auto font-semibold text-gray-800">{stats[k]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Queue throughput ─────────────────────────────────────────────────────────
function QueueSummary({ qs }: { qs: QueueStats }) {
  const queues = ['discovery','enrichment','scoring'] as const;
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">Queue State</div>
      <div className="space-y-2">
        {queues.map(q => {
          const c = qs[q];
          const total = c.waiting + c.active + c.failed + c.completed;
          const pct = total > 0 ? Math.round((c.completed / total) * 100) : 0;
          return (
            <div key={q} className="text-xs">
              <div className="flex justify-between mb-0.5">
                <span className="capitalize text-gray-700 font-medium">{q}</span>
                <span className="text-gray-400">{pct}% done · {c.failed} failed</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AnalyticsTab ─────────────────────────────────────────────────────────────
export default function AnalyticsTab() {
  const [stats,      setStats]      = useState<Stats | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [logStats,   setLogStats]   = useState<LogStats | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, q, l] = await Promise.all([fetchStats(), fetchQueueStats(), fetchLogStats()]);
      setStats(s.data);
      setQueueStats(q.data);
      setLogStats(l.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <AnalyticsSkeleton />;

  if (error) return (
    <>
      <ApiOffline error={error} onRetry={load} />
      <div className="opacity-20 pointer-events-none select-none"><AnalyticsSkeleton /></div>
    </>
  );

  const hot = stats ? stats.hot_verified + stats.hot : 0;
  const convRate = stats?.total ? Math.round((hot / stats.total) * 100) : 0;
  const scrapeSuccessRate = logStats && logStats.total > 0
    ? Math.round((logStats.success / logStats.total) * 100) : 0;

  return (
    <div className="px-5 py-4 space-y-4">
      <div className="flex justify-end">
        <Button variant="secondary" onClick={load} className="text-xs">Refresh</Button>
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Total Companies"    value={stats?.total ?? 0} />
        <MetricCard label="Hot Leads"          value={hot}                color="text-red-500" />
        <MetricCard label="Conversion Rate"    value={`${convRate}%`}     color="text-emerald-600"
          sub="% companies → hot/hot_verified" />
        <MetricCard label="Scrape Success Rate" value={`${scrapeSuccessRate}%`} color="text-blue-600"
          sub={logStats ? `${logStats.total} total runs` : undefined} />
      </div>

      {stats && <StatusBreakdown stats={stats} />}
      {queueStats && <QueueSummary qs={queueStats} />}

      {logStats && (
        <div className="grid grid-cols-3 gap-3">
          <MetricCard label="Scrape Runs"    value={logStats.total} />
          <MetricCard label="Partial Runs"   value={logStats.partial}  color="text-yellow-600" />
          <MetricCard label="Failed Runs"    value={logStats.failed}   color="text-red-500" />
        </div>
      )}
    </div>
  );
}
