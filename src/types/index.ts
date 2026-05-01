// ─── API contract types — mirrored from backend ──────────────────────────────
// See ../shared-api-types.ts (header note explains the mirror contract).
export type {
  LeadStatus, PipelineStatus, FundingStage, ScraperSource,
  ContactRole, ScrapeJobStatus, FailureMode,
  PatchCompanyBody, PatchCompanyStatusBody, ScrapeRequestBody,
} from '../shared-api-types';
import type {
  ScraperSource, ContactRole, LeadStatus, PipelineStatus,
  FundingStage, ScrapeJobStatus, FailureMode,
} from '../shared-api-types';

// ─── Frontend-only types ──────────────────────────────────────────────────────
export type SortDir = 'asc' | 'desc';

// ─── API Response wrappers (frontend-side) ───────────────────────────────────
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  issues?: Array<{ path: string; message: string }>;
}

export interface ScoreBreakdown {
  originRatioScore: number;
  jobFreshnessScore: number;
  techStackScore: number;
  contactScore: number;
  companyFitScore: number;
  total: number;
}

export interface Company {
  _id: string;
  name: string;
  domain: string;
  description?: string;
  linkedinUrl?: string;
  crunchbaseUrl?: string;
  websiteUrl?: string;
  githubOrg?: string;
  hqCountry: string;
  hqState?: string;
  hqCity?: string;
  employeeCount?: number;
  originDevCount?: number;
  totalDevCount?: number;
  originRatio?: number;
  toleranceIncluded: boolean;
  fundingStage?: FundingStage;
  fundingTotalUsd?: number;
  foundedYear?: number;
  industry: string[];
  techStack: string[];
  openRoles: string[];
  sources: ScraperSource[];
  score: number;
  scoreBreakdown?: ScoreBreakdown;
  notes?: string;
  disqualificationReason?: string;
  status: LeadStatus;
  pipelineStatus: PipelineStatus;
  manuallyReviewed: boolean;
  sourcesCount: number;
  lastJobPostedDays?: number;
  createdAt: string;
  updatedAt: string;
  lastScrapedAt: string;
  lastEnrichedAt?: string;
}

export interface Contact {
  _id: string;
  companyId: string;
  role: ContactRole;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email?: string;
  emailVerified: boolean;
  emailConfidence: number;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  location?: string;
  isIndianOrigin?: boolean;
  forOriginRatio?: boolean;
  sources: ScraperSource[];
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  _id: string;
  companyId: string;
  title: string;
  techTags: string[];
  source?: ScraperSource;
  sourceUrl?: string;
  postedAt?: string;
  scrapedAt: string;
  isActive: boolean;
}

export interface AgentStep {
  tool:       string;
  summary:    string;
  ts:         string;
  latencyMs?: number;
}

export interface ScrapeStageRecord {
  name: string;
  durationMs: number;
  ok: boolean;
  detail?: string;
}

export interface ScrapeDiagnosticsSummary {
  scraper: string;
  runId: string;
  url: string;
  outcome: FailureMode;
  totalMs: number;
  itemsFound: number;
  stages: ScrapeStageRecord[];
  artifactBase?: string;
}

export interface ScrapeLog {
  _id: string;
  runId: string;
  scraper: ScraperSource;
  status: ScrapeJobStatus;
  companiesFound: number;
  contactsFound: number;
  jobsFound: number;
  errors: string[];
  durationMs: number;
  startedAt: string;
  completedAt?: string;
  agentSteps?: AgentStep[];
  diagnostics?: ScrapeDiagnosticsSummary;
}

// ─── Dashboard-specific ───────────────────────────────────────────────────────

export interface Stats {
  total: number;
  hot_verified: number;
  hot: number;
  warm: number;
  cold: number;
  disqualified: number;
  pending: number;
}

export interface QueueCounts {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

export interface QueueStats {
  discovery: QueueCounts;
  enrichment: QueueCounts;
  scoring: QueueCounts;
}

export interface ActiveJob {
  queue: 'discovery' | 'enrichment' | 'scoring';
  jobId: string;
  name: string;
  source?: string;
  domain?: string;
  companyId?: string;
  runId: string;
  startedAt?: string;
}

export interface CronInfo {
  schedule: string;
  description: string;
  lastSeedAt: string | null;
  nextApproxAt: string | null;
  seedQueryCount: number;
}

export interface LogStats {
  total: number;
  success: number;
  partial: number;
  failed: number;
}

export interface Settings {
  originRatioThreshold: number;
  originRatioMinSample: number;
  targetTechTags: string[];
  highValueIndustries: string[];
  leadScoreHotVerifiedThreshold: number;
  leadScoreHotThreshold: number;
  leadScoreWarmThreshold: number;
  leadScoreColdThreshold: number;
  workerConcurrencyDiscovery: number;
  workerConcurrencyEnrichment: number;
  workerConcurrencyScoring: number;
  maxConcurrentBrowsers: number;
}

export interface CompanyDetail {
  company: Company;
  contacts: Contact[];
  jobs: { active: Job[]; inactive: Job[] };
  summary: {
    totalContacts: number;
    verifiedEmails: number;
    activeJobs: number;
    score: number;
    status: LeadStatus;
    originRatio?: number;
  };
}

// ─── Filter state ─────────────────────────────────────────────────────────────

export interface LeadFilters {
  search: string;
  status: string;
  minScore: string;
  maxScore: string;
  techStack: string;
  fundingStage: string;
  source: string;
  outreachReady: 'all' | 'ready';
  limit: number;
  page: number;
  sortBy: string;
  sortDir: SortDir;
  segment: 'all' | 'qualified' | 'disqualified' | LeadStatus;
}
