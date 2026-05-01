import { lazy, Suspense, useRef, useState } from 'react';
import { ToastProvider } from './components/ui/Toast';
import Header from './components/layout/Header';
import ActivityBar from './components/layout/ActivityBar';
import { useActivityJobs } from './hooks/useActivityJobs';
import { useHealth } from './hooks/useHealth';
import TableSkeleton from './components/ui/skeletons/TableSkeleton';
import ControlSkeleton from './components/ui/skeletons/ControlSkeleton';
import LogsSkeleton from './components/ui/skeletons/LogsSkeleton';
import AnalyticsSkeleton from './components/ui/skeletons/AnalyticsSkeleton';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ApiOffline from './components/ui/ApiOffline';

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
  const health = useHealth();

  // If health check has failed enough that there's an error, treat the API as offline.
  // This catches the case where /health 5xx's or times out so we don't crash inner views.
  const apiUnreachable = health.isError && !health.isLoading;

  if (apiUnreachable) {
    const msg = health.error instanceof Error ? health.error.message : String(health.error);
    return (
      <div className="min-h-screen flex flex-col">
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          lastRefresh=""
          onRefresh={() => void health.refetch()}
        />
        <main className="flex-1 px-3 pb-4 pt-3 sm:px-4 lg:px-6">
          <ApiOffline error={msg} onRetry={() => void health.refetch()} />
        </main>
      </div>
    );
  }

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
        {/* Each tab has its own ErrorBoundary so a crash in one tab doesn't kill the rest of the shell */}
        <ErrorBoundary>
          <Suspense fallback={<TableSkeleton />}>
            {activeTab === 'leads' && (
              <LeadsTab onRegisterRefresh={fn => { leadsRefreshRef.current = fn; }} />
            )}
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<ControlSkeleton />}>
            {activeTab === 'control' && <ControlTab />}
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<LogsSkeleton />}>
            {activeTab === 'logs' && <LogsTab />}
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<AnalyticsSkeleton />}>
            {activeTab === 'analytics' && <AnalyticsTab />}
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={null}>
            {activeTab === 'queues' && <QueueMonitorTab />}
          </Suspense>
        </ErrorBoundary>
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
