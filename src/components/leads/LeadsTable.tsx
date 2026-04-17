import type { Company, Contact, ActiveJob, LeadFilters, PipelineStatus, SortDir } from '../../types';
import Badge from '../ui/Badge';
import ContactChip from './ContactChip';
import { Skeleton, SkeletonBadge, SkeletonText } from '../ui/Skeleton';

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-4 py-2.5 max-w-45">
        <SkeletonText w="w-28" h="h-3.5" />
        <SkeletonText w="w-20" h="h-2.5" />
        <div className="flex gap-0.75 mt-1">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="w-1.5 h-1.5 rounded-full" />)}
        </div>
      </td>
      <td className="px-4 py-2.5"><SkeletonText w="w-6" h="h-4" /></td>
      <td className="px-4 py-2.5"><SkeletonText w="w-10" h="h-3.5" /></td>
      <td className="px-4 py-2.5"><SkeletonText w="w-16" h="h-3" /></td>
      <td className="px-4 py-2.5"><SkeletonText w="w-8" h="h-3" /></td>
      <td className="px-4 py-2.5"><SkeletonBadge /></td>
      <td className="px-4 py-2.5"><div className="flex gap-1"><Skeleton className="h-4 w-12 rounded" /><Skeleton className="h-4 w-10 rounded" /></div></td>
      <td className="px-4 py-2.5"><div className="flex gap-1"><Skeleton className="h-4 w-16 rounded" /></div></td>
      <td className="px-4 py-2.5"><div className="flex gap-1"><Skeleton className="h-4 w-14 rounded" /><Skeleton className="h-4 w-10 rounded" /></div></td>
      <td className="px-4 py-2.5"><div className="flex flex-col gap-0.5"><SkeletonText w="w-32" h="h-3" /><SkeletonText w="w-24" h="h-2.5" /></div></td>
      <td className="px-4 py-2.5"><div className="flex gap-1"><Skeleton className="h-6 w-6 rounded" /><Skeleton className="h-6 w-6 rounded" /></div></td>
    </tr>
  );
}

const PIPELINE_STEPS: PipelineStatus[] = ['discovered', 'enriching', 'enriched', 'scoring', 'scored'];

function PipelineDots({ status, live }: { status: PipelineStatus; live?: boolean }) {
  const idx = PIPELINE_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0.75 mt-0.5" title={`Pipeline: ${status}`}>
      {PIPELINE_STEPS.map((step, i) => (
        <div
          key={step}
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            i < idx  ? 'bg-green-400' :
            i === idx ? (live ? 'bg-emerald-500 animate-pulse' : 'bg-blue-400') :
            'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

interface LeadsTableProps {
  companies: Company[];
  contacts: Record<string, Contact[]>;
  activeJobs: ActiveJob[];
  loading: boolean;
  error: string | null;
  filters: LeadFilters;
  totalPages: number;
  totalCount: number;
  onSort: (col: string) => void;
  onPageChange: (delta: number) => void;
  onOpenCompany: (id: string) => void;
  onStatusChange: (id: string) => void;
}

const SORT_COLS = ['name','score','originRatio','fundingStage','employeeCount'];

function scoreColor(s: number) {
  if (!s || s < 1) return 'text-gray-300';
  if (s >= 80) return 'text-orange-600';
  if (s >= 65) return 'text-red-500';
  if (s >= 50) return 'text-yellow-500';
  return 'text-blue-400';
}

function ratioColor(r?: number | null) {
  if (r == null) return 'text-gray-300';
  if (r >= 0.75) return 'text-green-600';
  if (r >= 0.60) return 'text-yellow-600';
  return 'text-red-400';
}

interface SortThProps {
  col: string;
  label: string;
  current: string;
  dir: SortDir;
  onSort: (col: string) => void;
}

function SortTh({ col, label, current, dir, onSort }: SortThProps) {
  const active = current === col;
  return (
    <th
      className={`text-left px-4 py-2.5 text-gray-500 uppercase tracking-wide text-[11px] cursor-pointer select-none hover:bg-gray-100 ${active ? 'text-blue-600' : ''}`}
      onClick={() => onSort(col)}
    >
      {label}
      <span className={`ml-1 text-[10px] ${active ? 'opacity-100 text-blue-600' : 'opacity-30'}`}>
        {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </th>
  );
}

export default function LeadsTable({
  companies, contacts, activeJobs, loading, error,
  filters, totalPages, totalCount,
  onSort, onPageChange, onOpenCompany, onStatusChange,
}: LeadsTableProps) {
  const activeJobMap = new Map(
    activeJobs
      .filter(j => j.companyId)
      .map(j => [j.companyId!, j.queue === 'enrichment' ? 'enriching' : 'scoring'] as const)
  );

  return (
    <div className="px-5 py-3">
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {SORT_COLS.map(col => (
                <SortTh key={col} col={col} label={col === 'originRatio' ? 'Origin %' : col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')}
                  current={filters.sortBy} dir={filters.sortDir} onSort={onSort} />
              ))}
              <th className="text-left px-4 py-2.5 text-gray-500 uppercase tracking-wide text-[11px]">Status</th>
              <th className="text-left px-4 py-2.5 text-gray-500 uppercase tracking-wide text-[11px]">Tech Stack</th>
              <th className="text-left px-4 py-2.5 text-gray-500 uppercase tracking-wide text-[11px]">Open Roles</th>
              <th className="text-left px-4 py-2.5 text-gray-500 uppercase tracking-wide text-[11px]">Sources</th>
              <th className="text-left px-4 py-2.5 text-gray-500 uppercase tracking-wide text-[11px]">Contacts</th>
              <th className="px-4 py-2.5 text-gray-500 uppercase tracking-wide text-[11px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
            {error && !loading && (
              <tr><td colSpan={11} className="px-4 py-8 text-center">
                <div className="flex flex-col items-center gap-2 text-red-400">
                  <span className="text-2xl">⚠</span>
                  <span className="font-medium">{error}</span>
                </div>
              </td></tr>
            )}
            {!loading && !error && companies.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <div className="text-3xl">📭</div>
                  <div className="font-medium text-gray-600">No companies found</div>
                  <div className="text-xs">Try adjusting filters or run a seed from the Control Panel</div>
                </div>
              </td></tr>
            )}
            {!loading && companies.map(c => {
              const livePhase = activeJobMap.get(c._id);
              const rowContacts = contacts[c._id] ?? [];
              return (
                <tr
                  key={c._id}
                  className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${livePhase ? 'bg-emerald-50/30' : ''}`}
                  onClick={() => onOpenCompany(c._id)}
                >
                  <td className="px-4 py-2.5 max-w-45">
                    <div className="font-medium text-gray-900 truncate">{c.name || '—'}</div>
                    <div className="text-[10px] text-blue-500 truncate">{c.domain}</div>
                    {c.pipelineStatus && (
                      <PipelineDots status={c.pipelineStatus} live={!!livePhase} />
                    )}
                  </td>
                  <td className={`px-4 py-2.5 font-bold ${scoreColor(c.score)}`}>
                    {c.score > 0 ? c.score : '—'}
                  </td>
                  <td className={`px-4 py-2.5 font-semibold ${ratioColor(c.originRatio)}`}>
                    {c.originRatio != null ? `${Math.round(c.originRatio * 100)}%` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{c.fundingStage ?? '—'}</td>
                  <td className="px-4 py-2.5 text-gray-600">{c.employeeCount ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    {livePhase
                      ? <><Badge status={c.status} className="opacity-50 mr-1" /><Badge status={livePhase} /></>
                      : <Badge status={c.status} />
                    }
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {c.techStack.slice(0, 4).map(t => (
                        <span key={t} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {c.openRoles.slice(0, 2).map(r => (
                        <span key={r} className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[10px]">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {c.sources.slice(0, 3).map(s => (
                        <span key={s} className="bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded text-[10px]">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    {rowContacts.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {rowContacts.slice(0, 3).map(p => <ContactChip key={p._id} contact={p} />)}
                        {rowContacts.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{rowContacts.length - 3} more</span>
                        )}
                      </div>
                    ) : <span className="text-gray-300 text-[10px]">—</span>}
                  </td>
                  <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onStatusChange(c._id)}
                        className="px-2 py-1 border border-gray-200 rounded text-[10px] hover:bg-gray-50"
                        title="Change status"
                      >✎</button>
                      <button
                        onClick={() => onOpenCompany(c._id)}
                        className="px-2 py-1 border border-gray-200 rounded text-[10px] hover:bg-gray-50"
                        title="View detail"
                      >→</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-2.5 text-xs text-gray-500">
        <span>Page {filters.page} of {totalPages} — {totalCount} companies</span>
        <div className="flex gap-2">
          <button
            disabled={filters.page <= 1}
            onClick={() => onPageChange(-1)}
            className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >← Prev</button>
          <button
            disabled={filters.page >= totalPages}
            onClick={() => onPageChange(1)}
            className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >Next →</button>
        </div>
      </div>
    </div>
  );
}
