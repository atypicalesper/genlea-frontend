// Custom hook — separates data-fetching concern from rendering.
// Single Responsibility: own only the leads + contacts fetch lifecycle.

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchLeads, fetchContactsForCompanies, fetchStats, fetchActiveJobs } from '../api/endpoints';
import type { Company, Contact, Stats, ActiveJob, LeadFilters } from '../types';

export const DEFAULT_FILTERS: LeadFilters = {
  search: '', status: '', minScore: '', maxScore: '',
  techStack: '', fundingStage: '', source: '', outreachReady: 'all',
  limit: 50, page: 1, sortBy: 'score', sortDir: 'desc',
  segment: 'all',
};

interface UseLeadsReturn {
  companies: Company[];
  contacts: Record<string, Contact[]>;
  stats: Stats | null;
  activeJobs: ActiveJob[];
  totalPages: number;
  totalCount: number;
  loading: boolean;
  error: string | null;
  filters: LeadFilters;
  setFilters: (f: Partial<LeadFilters>) => void;
  refresh: () => void;
  lastRefresh: string;
}

export function useLeads(): UseLeadsReturn {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Record<string, Contact[]>>({});
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<LeadFilters>(DEFAULT_FILTERS);
  const [lastRefresh, setLastRefresh] = useState('');
  const loadingRef = useRef(false);

  const setFilters = useCallback((patch: Partial<LeadFilters>) => {
    setFiltersState(prev => ({ ...prev, ...patch, page: 'page' in patch ? patch.page! : 1 }));
  }, []);

  const load = useCallback(async (f: LeadFilters) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const [leadsRes, activeRes] = await Promise.all([
        fetchLeads(f),
        fetchActiveJobs().catch(() => ({ data: [] as ActiveJob[] })),
      ]);

      setCompanies(leadsRes.data);
      setTotalPages(leadsRes.meta.pages);
      setTotalCount(leadsRes.meta.total);
      setActiveJobs((activeRes as { data: ActiveJob[] }).data ?? []);

      // Batch contacts fetch for visible page
      if (leadsRes.data.length) {
        const ids = leadsRes.data.map(c => c._id).filter(Boolean);
        const ctRes = await fetchContactsForCompanies(ids).catch(() => ({ data: {} }));
        setContacts((ctRes as { data: Record<string, Contact[]> }).data ?? {});
      }

      setLastRefresh('Updated ' + new Date().toLocaleTimeString());
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const loadStats = useCallback(async () => {
    const res = await fetchStats().catch(() => null);
    if (res?.data) setStats(res.data);
  }, []);

  const refresh = useCallback(() => {
    load(filters);
    loadStats();
  }, [load, loadStats, filters]);

  // Reload whenever filters change
  useEffect(() => { load(filters); }, [filters, load]);
  useEffect(() => { loadStats(); }, [loadStats]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => { loadStats(); load(filters); }, 30_000);
    return () => clearInterval(id);
  }, [filters, load, loadStats]);

  return { companies, contacts, stats, activeJobs, totalPages, totalCount, loading, error, filters, setFilters, refresh, lastRefresh };
}
