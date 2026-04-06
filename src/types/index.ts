// ─── Mirrored from backend src/types/index.ts ────────────────────────────────

export type LeadStatus = 'hot_verified' | 'hot' | 'warm' | 'cold' | 'disqualified' | 'pending';
export type PipelineStatus = 'discovered' | 'watchlist' | 'enriching' | 'enriched' | 'scoring' | 'scored';
export type FundingStage = 'Pre-seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'Series D+' | 'Bootstrapped' | 'Public' | 'Acquired' | 'Unknown';
export type ScraperSource = 'linkedin' | 'sales_navigator' | 'crunchbase' | 'zoominfo' | 'apollo' | 'hunter' | 'github' | 'glassdoor' | 'wellfound' | 'clearbit' | 'explorium' | 'indeed' | 'surelyremote' | 'website' | 'agent';
export type ContactRole = 'CEO' | 'Founder' | 'Co-Founder' | 'CTO' | 'COO' | 'CPO' | 'CFO' | 'VP of Engineering' | 'VP Engineering' | 'VP of Product' | 'VP of Technology' | 'Head of Engineering' | 'Director of Engineering' | 'Head of Product' | 'Director of Product' | 'Head of Technology' | 'Director of Technology' | 'Engineering Manager' | 'HR' | 'Head of HR' | 'VP of HR' | 'Head of People' | 'Recruiter' | 'Head of Talent' | 'Talent Acquisition' | 'Unknown';
export type ScrapeJobStatus = 'queued' | 'processing' | 'success' | 'failed' | 'partial' | 'skipped';
export type SortDir = 'asc' | 'desc';

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
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
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
  leadScoreHotVerifiedThreshold: number;
  leadScoreHotThreshold: number;
  leadScoreWarmThreshold: number;
  leadScoreColdThreshold: number;
  workerConcurrencyDiscovery: number;
  workerConcurrencyEnrichment: number;
  workerConcurrencyScoring: number;
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
  limit: number;
  page: number;
  sortBy: string;
  sortDir: SortDir;
  segment: 'all' | 'qualified' | 'disqualified' | LeadStatus;
}
