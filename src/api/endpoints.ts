// ─── Domain endpoints ─────────────────────────────────────────────────────────
// Open/Closed: add new endpoints here without touching the client or components.

import { apiFetch, apiPost, apiPatch, apiDelete } from './client';
import type {
  ApiResponse, PaginatedResponse,
  Company, CompanyDetail, Contact, ScrapeLog,
  Stats, QueueStats, ActiveJob, CronInfo, LogStats, Settings,
  LeadFilters, LeadStatus,
} from '../types';

// ── Leads ─────────────────────────────────────────────────────────────────────

export function buildLeadsParams(f: LeadFilters): URLSearchParams {
  const p = new URLSearchParams({
    page:    String(f.page),
    limit:   String(f.limit),
    sortBy:  f.sortBy,
    sortDir: f.sortDir,
  });
  if (f.segment === 'qualified')    p.set('qualified', 'true');
  else if (f.segment === 'disqualified') p.set('qualified', 'false');
  else if (f.segment !== 'all')     p.set('status', f.segment as string);
  else if (f.status)                p.set('status', f.status);
  if (f.minScore)     p.set('minScore', f.minScore);
  if (f.maxScore)     p.set('maxScore', f.maxScore);
  if (f.techStack)    p.set('techStack', f.techStack);
  if (f.fundingStage) p.set('fundingStage', f.fundingStage);
  if (f.source)       p.set('source', f.source);
  if (f.search)       p.set('search', f.search);
  return p;
}

export const fetchLeads = (f: LeadFilters) =>
  apiFetch<PaginatedResponse<Company>>(`/api/leads?${buildLeadsParams(f)}`);

export const fetchStats = () =>
  apiFetch<ApiResponse<Stats>>('/api/stats');

export const fetchContactsForCompanies = (ids: string[]) =>
  apiFetch<ApiResponse<Record<string, Contact[]>>>(
    `/api/contacts/for-companies?ids=${ids.join(',')}`,
    undefined,
    8_000,
  );

// ── Company ───────────────────────────────────────────────────────────────────

export const fetchCompany = (id: string) =>
  apiFetch<ApiResponse<CompanyDetail>>(`/api/companies/${id}`, undefined, 10_000);

export const patchCompanyStatus = (id: string, status: LeadStatus) =>
  apiPatch<ApiResponse<{ status: LeadStatus }>>(`/api/companies/${id}/status`, { status });

export const deleteCompany = (id: string) =>
  apiDelete<ApiResponse<{ success: boolean }>>(`/api/companies/${id}`);

export const postReEnrich = (id: string) =>
  apiPost<ApiResponse<{ runId: string }>>(`/api/companies/${id}/enrich`, {});

export const postReScore = (id: string) =>
  apiPost<ApiResponse<{ runId: string }>>(`/api/companies/${id}/score`, {});

// ── Jobs / Queue ──────────────────────────────────────────────────────────────

export const fetchQueueStats = () =>
  apiFetch<ApiResponse<QueueStats>>('/api/jobs/status');

export const fetchActiveJobs = () =>
  apiFetch<ApiResponse<ActiveJob[]>>('/api/jobs/active');

export const fetchCronInfo = () =>
  apiFetch<ApiResponse<CronInfo>>('/api/jobs/cron');

export const postSeed = () =>
  apiPost<ApiResponse<{ runId: string; queries: number; message: string }>>('/api/seed', {});

export const postRescoreAll = () =>
  apiPost<ApiResponse<{ runId: string; queued: number; message: string }>>('/api/jobs/rescore-all', {});

export const postRetryFailed = (queue: 'discovery' | 'enrichment' | 'scoring') =>
  apiPost<ApiResponse<{ retried: number; message: string }>>(`/api/jobs/retry/${queue}`, {});

export const deleteQueueDrain = (queue: 'discovery' | 'enrichment' | 'scoring') =>
  apiDelete<ApiResponse<{ message: string }>>(`/api/jobs/clear/${queue}`);

export const postManualScrape = (source: string, keywords: string, limit: number, location?: string) =>
  apiPost<ApiResponse<{ runId: string; message: string }>>('/api/scrape', {
    source,
    query: { keywords, limit, ...(location ? { location } : {}) },
  });

// ── Logs ──────────────────────────────────────────────────────────────────────

export const fetchLogs = (scraper?: string, limit = 50) => {
  const p = new URLSearchParams({ limit: String(limit) });
  if (scraper) p.set('scraper', scraper);
  return apiFetch<ApiResponse<ScrapeLog[]>>(`/api/jobs/logs?${p}`);
};

export const fetchLogStats = () =>
  apiFetch<ApiResponse<LogStats>>('/api/jobs/stats');

// ── Settings ──────────────────────────────────────────────────────────────────

export const fetchSettings = () =>
  apiFetch<ApiResponse<Settings>>('/api/settings');

export const patchSettings = (s: Partial<Settings>) =>
  apiPatch<ApiResponse<Settings>>('/api/settings', s);

// ── Export ────────────────────────────────────────────────────────────────────

export const getExportUrl = () => '/api/export/csv';
