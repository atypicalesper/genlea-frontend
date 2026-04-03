import { useEffect, useRef, useState } from 'react';
import { fetchLogs, fetchLogStats } from '../api/endpoints';
import type { ScrapeLog, LogStats } from '../types';

export function useLogs(scraper?: string) {
  const [logs,     setLogs]     = useState<ScrapeLog[]>([]);
  const [stats,    setStats]    = useState<LogStats | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const loadingRef = useRef(false);

  const load = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setError(null);
    try {
      const [logsRes, statsRes] = await Promise.all([fetchLogs(scraper, 100), fetchLogStats()]);
      setLogs(logsRes.data ?? []);
      setStats(statsRes.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [scraper]);

  useEffect(() => {
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, [scraper]);

  return { logs, stats, loading, error, refresh: load };
}
