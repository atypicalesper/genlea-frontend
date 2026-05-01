// Custom hook — separates data-fetching concern from rendering.
// Single Responsibility: own only the leads + contacts fetch lifecycle.
// Backed by @tanstack/react-query for caching, dedupe, and SWR semantics.

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLeads, fetchContactsForCompanies, fetchStats, fetchActiveJobs } from '../api/endpoints';
import type { Company, Contact, Stats, ActiveJob, LeadFilters } from '../types';

export const DEFAULT_FILTERS: LeadFilters = {
  search: '', status: '', minScore: '', maxScore: '',
  techStack: '', fundingStage: '', source: '', outreachReady: 'all',
  limit: 50, page: 1, sortBy: 'score', sortDir: 'desc',
  segment: 'all',
};

// Refresh cadence preserved from previous behavior (30s)
const AUTO_REFRESH_MS = 30_000;

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
  const [filters, setFiltersState] = useState<LeadFilters>(DEFAULT_FILTERS);

  const setFilters = useCallback((patch: Partial<LeadFilters>) => {
    setFiltersState(prev => ({ ...prev, ...patch, page: 'page' in patch ? patch.page! : 1 }));
  }, []);

  // ── Leads page (paginated + filtered) ───────────────────────────────────────
  const leadsQuery = useQuery({
    queryKey: ['leads', filters] as const,
    queryFn: () => fetchLeads(filters),
    refetchInterval: AUTO_REFRESH_MS,
    placeholderData: prev => prev, // keep showing previous page while loading next
  });

  // ── Active jobs (header status) — independent, cached separately ────────────
  const activeJobsQuery = useQuery({
    queryKey: ['activeJobs'] as const,
    queryFn: fetchActiveJobs,
    refetchInterval: AUTO_REFRESH_MS,
  });

  // ── Stats (segment counts) — independent ────────────────────────────────────
  const statsQuery = useQuery({
    queryKey: ['stats'] as const,
    queryFn: fetchStats,
    refetchInterval: AUTO_REFRESH_MS,
  });

  // ── Contacts: keyed by the visible companies, dedupes on identical page set ─
  const companies = leadsQuery.data?.data ?? [];
  const companyIds = useMemo(
    () => companies.map(c => c._id).filter(Boolean),
    [companies],
  );
  const contactsBatchKey = companyIds.join(',');

  const contactsQuery = useQuery({
    queryKey: ['contacts', contactsBatchKey] as const,
    queryFn: () => fetchContactsForCompanies(companyIds),
    enabled: companyIds.length > 0,
    staleTime: 60_000,
  });

  const contactsData = contactsQuery.data?.data ?? {};

  // ── Refresh = invalidate everything ─────────────────────────────────────────
  const refresh = useCallback(() => {
    void leadsQuery.refetch();
    void activeJobsQuery.refetch();
    void statsQuery.refetch();
    void contactsQuery.refetch();
  }, [leadsQuery, activeJobsQuery, statsQuery, contactsQuery]);

  const lastRefresh = useMemo(() => {
    const ts = leadsQuery.dataUpdatedAt;
    return ts ? `Updated ${new Date(ts).toLocaleTimeString()}` : '';
  }, [leadsQuery.dataUpdatedAt]);

  const error = leadsQuery.error
    ? (leadsQuery.error instanceof Error ? leadsQuery.error.message : String(leadsQuery.error))
    : null;

  return {
    companies,
    contacts: contactsData,
    stats: statsQuery.data?.data ?? null,
    activeJobs: activeJobsQuery.data?.data ?? [],
    totalPages: leadsQuery.data?.meta.pages ?? 1,
    totalCount: leadsQuery.data?.meta.total ?? 0,
    loading: leadsQuery.isFetching,
    error,
    filters,
    setFilters,
    refresh,
    lastRefresh,
  };
}
