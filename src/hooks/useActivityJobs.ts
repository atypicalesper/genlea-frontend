// Lightweight hook — only fetches active jobs for the ActivityBar.
// Avoids duplicating the full useLeads fetch in App.tsx.

import { useEffect, useState } from 'react';
import { fetchActiveJobs } from '../api/endpoints';
import type { ActiveJob } from '../types';

export function useActivityJobs(intervalMs = 20_000) {
  const [jobs, setJobs] = useState<ActiveJob[]>([]);

  useEffect(() => {
    const load = () =>
      fetchActiveJobs()
        .then(res => setJobs(res.data ?? []))
        .catch(() => {});

    load();
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return jobs;
}
