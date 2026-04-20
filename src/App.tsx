import { lazy, Suspense, useRef, useState } from 'react';
import { ToastProvider } from './components/ui/Toast';
import Header from './components/layout/Header';
import ActivityBar from './components/layout/ActivityBar';
import { useActivityJobs } from './hooks/useActivityJobs';
import TableSkeleton from './components/ui/skeletons/TableSkeleton';
import ControlSkeleton from './components/ui/skeletons/ControlSkeleton';
import LogsSkeleton from './components/ui/skeletons/LogsSkeleton';
import AnalyticsSkeleton from './components/ui/skeletons/AnalyticsSkeleton';

// ─── Lazy-loaded tabs ─────────────────────────────────────────────────────────
const LeadsTab       = lazy(() => import('./components/leads/LeadsTab'));
const ControlTab     = lazy(() => import('./components/control/ControlTab'));
const LogsTab        = lazy(() => import('./components/logs/LogsTab'));
const AnalyticsTab   = lazy(() => import('./components/analytics/AnalyticsTab'));
const QueueMonitorTab = lazy(() => import('./components/queues/QueueMonitorTab'));

export type Tab = 'leads' | 'control' | 'logs' | 'analytics' | 'queues';

function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('leads');
  const activeJobs = useActivityJobs(20_000);
  const leadsRefreshRef = useRef<(() => void) | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lastRefresh=""
        onRefresh={() => leadsRefreshRef.current?.()}
      />
      <ActivityBar jobs={activeJobs} />

      <main className="flex-1 px-3 pb-4 pt-3 sm:px-4 lg:px-6">
        {/* Each tab has its own Suspense so the fallback matches the tab's layout */}
        <Suspense fallback={<TableSkeleton />}>
          {activeTab === 'leads' && (
            <LeadsTab onRegisterRefresh={fn => { leadsRefreshRef.current = fn; }} />
          )}
        </Suspense>

        <Suspense fallback={<ControlSkeleton />}>
          {activeTab === 'control' && <ControlTab />}
        </Suspense>

        <Suspense fallback={<LogsSkeleton />}>
          {activeTab === 'logs' && <LogsTab />}
        </Suspense>

        <Suspense fallback={<AnalyticsSkeleton />}>
          {activeTab === 'analytics' && <AnalyticsTab />}
        </Suspense>

        <Suspense fallback={null}>
          {activeTab === 'queues' && <QueueMonitorTab />}
        </Suspense>
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
