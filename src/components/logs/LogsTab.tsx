import { useState } from 'react';
import { useLogs } from '../../hooks/useLogs';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import type { ScrapeLog, AgentStep } from '../../types';

const SCRAPERS = ['','wellfound','linkedin','crunchbase','apollo','indeed','glassdoor','surelyremote','zoominfo','github','hunter','clearbit','explorium','agent'];

// ─── Error Popover ────────────────────────────────────────────────────────────
function ErrorPopover({ errors, onClose }: { errors: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-gray-900 rounded-xl w-full max-w-lg max-h-[60vh] overflow-y-auto shadow-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Errors ({errors.length})</span>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg leading-none">✕</button>
        </div>
        <div className="space-y-1.5">
          {errors.map((e, i) => (
            <div key={i} className="text-xs text-red-300 bg-red-950/30 rounded px-2.5 py-1.5 break-all">{e}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stats Summary Row ────────────────────────────────────────────────────────
function StatsSummary({ total, success, partial, failed }: { total: number; success: number; partial: number; failed: number }) {
  return (
    <div className="flex gap-4 text-xs">
      <span className="text-gray-500">Total: <strong>{total}</strong></span>
      <span className="text-emerald-600">Success: <strong>{success}</strong></span>
      <span className="text-yellow-600">Partial: <strong>{partial}</strong></span>
      <span className="text-red-500">Failed: <strong>{failed}</strong></span>
    </div>
  );
}

// ─── Agent Steps Panel ────────────────────────────────────────────────────────
function AgentStepsPanel({ steps }: { steps: AgentStep[] }) {
  return (
    <div className="px-3 py-2 space-y-1">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-2 text-[11px]">
          <span className="shrink-0 w-4 text-gray-400 text-right">{i + 1}.</span>
          <span className="shrink-0 font-mono text-blue-600 w-36 truncate">{step.tool}</span>
          <span className="text-gray-600 flex-1 min-w-0 break-words">{step.summary}</span>
          {step.latencyMs != null && (
            <span className="shrink-0 text-gray-400">{step.latencyMs}ms</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Log Row ──────────────────────────────────────────────────────────────────
function LogRow({ log, onShowErrors }: { log: ScrapeLog; onShowErrors: (errors: string[]) => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasSteps = log.scraper === 'agent' && (log.agentSteps?.length ?? 0) > 0;

  const dur = log.durationMs
    ? log.durationMs < 1000 ? `${log.durationMs}ms` : `${(log.durationMs / 1000).toFixed(1)}s`
    : '—';

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="px-4 py-2 text-gray-500">{new Date(log.startedAt).toLocaleString()}</td>
        <td className="px-4 py-2 font-medium text-gray-800">{log.scraper}</td>
        <td className="px-4 py-2"><Badge status={log.status} /></td>
        <td className="px-4 py-2 text-gray-600">{log.companiesFound}</td>
        <td className="px-4 py-2 text-gray-600">{log.contactsFound}</td>
        <td className="px-4 py-2 text-gray-500">{dur}</td>
        <td className="px-4 py-2">
          {log.errors.length > 0 ? (
            <button
              onClick={() => onShowErrors(log.errors)}
              className="text-red-500 hover:underline text-[10px]"
            >
              {log.errors.length} error{log.errors.length > 1 ? 's' : ''}
            </button>
          ) : <span className="text-gray-300 text-[10px]">—</span>}
        </td>
        <td className="px-4 py-2">
          {hasSteps ? (
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-blue-500 hover:text-blue-700 text-[10px] flex items-center gap-1"
            >
              <span>{expanded ? '▼' : '▶'}</span>
              <span>{log.agentSteps!.length} steps</span>
            </button>
          ) : <span className="text-gray-300 text-[10px]">—</span>}
        </td>
      </tr>
      {expanded && hasSteps && (
        <tr className="bg-gray-50 border-b border-gray-100">
          <td colSpan={8} className="px-0 py-0">
            <AgentStepsPanel steps={log.agentSteps!} />
          </td>
        </tr>
      )}
    </>
  );
}

// ─── LogsTab ──────────────────────────────────────────────────────────────────
export default function LogsTab() {
  const [scraperFilter, setScraperFilter] = useState('');
  const { logs, stats, loading, error } = useLogs(scraperFilter || undefined);
  const [popoverErrors, setPopoverErrors] = useState<string[] | null>(null);

  return (
    <div className="px-5 py-4">
      {/* Filter row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] text-gray-400 uppercase tracking-wide">Scraper</label>
          <select value={scraperFilter} onChange={e => setScraperFilter(e.target.value)}
            className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-300">
            {SCRAPERS.map(s => <option key={s} value={s}>{s || 'All'}</option>)}
          </select>
        </div>
        {stats && <StatsSummary {...stats} />}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Started','Scraper','Status','Companies','Contacts','Duration','Errors','Steps'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-gray-500 uppercase tracking-wide text-[11px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Spinner size="lg" /><span>Loading logs…</span>
                </div>
              </td></tr>
            )}
            {error && !loading && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-red-400">{error}</td></tr>
            )}
            {!loading && !error && logs.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No logs yet</td></tr>
            )}
            {!loading && logs.map(log => (
              <LogRow key={log._id} log={log} onShowErrors={setPopoverErrors} />
            ))}
          </tbody>
        </table>
      </div>

      {popoverErrors && (
        <ErrorPopover errors={popoverErrors} onClose={() => setPopoverErrors(null)} />
      )}
    </div>
  );
}
