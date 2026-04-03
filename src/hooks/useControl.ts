import { useEffect, useRef, useState } from 'react';
import {
  fetchQueueStats, fetchCronInfo, fetchActiveJobs,
  postSeed, postRescoreAll, postRetryFailed, deleteQueueDrain,
  postManualScrape, fetchSettings, patchSettings,
} from '../api/endpoints';
import type { QueueStats, CronInfo, ActiveJob, Settings } from '../types';

export function useControl() {
  const [queueStats, setQueueStats]   = useState<QueueStats | null>(null);
  const [cronInfo,   setCronInfo]     = useState<CronInfo | null>(null);
  const [activeJobs, setActiveJobs]   = useState<ActiveJob[]>([]);
  const [settings,   setSettings]     = useState<Settings | null>(null);
  const [loading,    setLoading]      = useState(true);
  const [error,      setError]        = useState<string | null>(null);
  const loadingRef = useRef(false);

  const load = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setError(null);
    try {
      const [qs, ci, aj, sv] = await Promise.all([
        fetchQueueStats(), fetchCronInfo(), fetchActiveJobs(), fetchSettings(),
      ]);
      setQueueStats(qs.data);
      setCronInfo(ci.data);
      setActiveJobs(aj.data ?? []);
      setSettings(sv.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, []);

  const saveSettings = async (patch: Partial<Settings>) => {
    const res = await patchSettings(patch);
    setSettings(res.data);
  };

  return {
    queueStats, cronInfo, activeJobs, settings, loading, error,
    refresh: load,
    actions: { postSeed, postRescoreAll, postRetryFailed, deleteQueueDrain, postManualScrape },
    saveSettings,
  };
}
