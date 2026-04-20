import Button from '../ui/Button';
import type { Tab } from '../../App';

const TABS: { id: Tab; label: string }[] = [
  { id: 'leads',    label: 'Leads' },
  { id: 'control',  label: 'Control Panel' },
  { id: 'logs',     label: 'Activity Logs' },
  { id: 'analytics',label: 'Analytics' },
  { id: 'queues',   label: 'Queue Monitor' },
];

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  lastRefresh: string;
  onRefresh: () => void;
}

export default function Header({ activeTab, onTabChange, lastRefresh, onRefresh }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-sm font-bold tracking-[0.18em] text-white shadow-sm shadow-teal-900/15">
              GL
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-slate-900">GenLea</div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Hiring lead pipeline</div>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-slate-50/80 p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-white text-teal-800 shadow-sm shadow-slate-900/5'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
          </nav>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs lg:justify-end">
          <div className="text-[11px] text-slate-400">
            {lastRefresh || 'Live queue + lead monitoring'}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onRefresh} className="py-1.5">
              Refresh
            </Button>
            <a href="/health" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 font-semibold text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700">
              Health
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
