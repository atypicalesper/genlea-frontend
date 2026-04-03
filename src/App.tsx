import { useRef, useState } from 'react';
import { ToastProvider } from './components/ui/Toast';
import Header from './components/layout/Header';
import ActivityBar from './components/layout/ActivityBar';
import LeadsTab from './components/leads/LeadsTab';
import ControlTab from './components/control/ControlTab';
import LogsTab from './components/logs/LogsTab';
import AnalyticsTab from './components/analytics/AnalyticsTab';
import QueueMonitorTab from './components/queues/QueueMonitorTab';
import { useActivityJobs } from './hooks/useActivityJobs';

export type Tab = 'leads' | 'control' | 'logs' | 'analytics' | 'queues';

// ─── AppShell: layout + tab routing ──────────────────────────────────────────
function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('leads');
  const activeJobs = useActivityJobs(20_000);

  // LeadsTab owns its own refresh — expose a trigger ref so Header can call it
  const leadsRefreshRef = useRef<(() => void) | null>(null);
  const handleHeaderRefresh = () => leadsRefreshRef.current?.();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lastRefresh=""
        onRefresh={handleHeaderRefresh}
      />
      <ActivityBar jobs={activeJobs} />

      <main className="flex-1">
        {activeTab === 'leads'     && <LeadsTab onRegisterRefresh={fn => { leadsRefreshRef.current = fn; }} />}
        {activeTab === 'control'   && <ControlTab />}
        {activeTab === 'logs'      && <LogsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'queues'    && <QueueMonitorTab />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
