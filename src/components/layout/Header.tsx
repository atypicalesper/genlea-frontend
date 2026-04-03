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
    <header className="bg-white border-b border-gray-200 px-5 py-2 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-5">
        <span className="font-bold text-gray-900 text-lg tracking-tight">GenLea</span>
        <nav className="flex">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === t.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3 text-xs">
        {lastRefresh && <span className="text-gray-400">{lastRefresh}</span>}
        <button onClick={onRefresh} className="text-blue-600 hover:underline">↻ Refresh</button>
        <a href="/health" target="_blank" rel="noreferrer" className="text-gray-400 hover:underline">Health</a>
      </div>
    </header>
  );
}
