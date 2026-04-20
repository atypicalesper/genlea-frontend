import { useState } from 'react';
import { useControl } from '../../hooks/useControl';
import { useToast } from '../ui/Toast';
import QueueCard from './QueueCard';
import Button from '../ui/Button';
import ControlSkeleton from '../ui/skeletons/ControlSkeleton';
import ApiOffline from '../ui/ApiOffline';
import type { Settings } from '../../types';

const SOURCES = ['wellfound','linkedin','crunchbase','apollo','indeed','glassdoor','surelyremote','zoominfo','github'];

// ─── Manual Scrape Form ───────────────────────────────────────────────────────
function ManualScrapeForm({ onScrape }: { onScrape: (src: string, kw: string, limit: number, loc?: string) => Promise<void> }) {
  const [source,   setSource]   = useState(SOURCES[0]);
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [limit,    setLimit]    = useState(50);
  const [busy,     setBusy]     = useState(false);

  const handleSubmit = async () => {
    if (!keywords.trim()) return;
    setBusy(true);
    try { await onScrape(source, keywords.trim(), limit, location.trim() || undefined); }
    finally { setBusy(false); }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Manual Scrape</h3>
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] text-gray-400 uppercase tracking-wide">Source</label>
          <select value={source} onChange={e => setSource(e.target.value)}
            className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-300">
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-0.5 flex-1 min-w-40">
          <label className="text-[10px] text-gray-400 uppercase tracking-wide">Keywords</label>
          <input
            type="text"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. react saas startup"
            className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-300"
          />
        </div>
        <div className="flex flex-col gap-0.5 w-36">
          <label className="text-[10px] text-gray-400 uppercase tracking-wide">Location <span className="normal-case font-normal">(optional)</span></label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. United States"
            className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-300"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] text-gray-400 uppercase tracking-wide">Limit</label>
          <select value={limit} onChange={e => setLimit(Number(e.target.value))}
            className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-300">
            {[25, 50, 100, 250].map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
        <Button variant="primary" onClick={handleSubmit} className="self-end" disabled={busy}>
          {busy ? 'Queuing…' : '▶ Run Scrape'}
        </Button>
      </div>
    </div>
  );
}

// ─── Settings Sliders ─────────────────────────────────────────────────────────
function SettingsPanel({
  settings, onSave,
}: { settings: Settings; onSave: (patch: Partial<Settings>) => Promise<void> }) {
  const [local, setLocal] = useState<Settings>(settings);
  const [techTagsText, setTechTagsText] = useState((settings.targetTechTags ?? []).join(', '));
  const [industriesText, setIndustriesText] = useState((settings.highValueIndustries ?? []).join(', '));
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof Settings>(key: K, val: Settings[K]) =>
    setLocal(s => ({ ...s, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const targetTechTags = techTagsText.split(',').map(t => t.trim()).filter(Boolean);
      const highValueIndustries = industriesText.split(',').map(t => t.trim()).filter(Boolean);
      await onSave({ ...local, targetTechTags, highValueIndustries });
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pipeline Parameters</h3>
        <Button variant="primary" onClick={handleSave} disabled={saving} className="text-xs">
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
      <p className="text-[10px] text-gray-400 mb-4">
        Controls how companies are qualified — changes take effect on the next enrichment/scoring run.
      </p>
      <div className="grid gap-4 text-xs md:grid-cols-2">
        <SliderField
          label="Origin Ratio Threshold"
          description="Minimum Indian-origin dev ratio to consider a company. ↓ Lower → wider pipeline, more noise. ↑ Higher → fewer but stronger leads. Worth up to 30 pts."
          value={local.originRatioThreshold}
          min={0.05} max={0.95} step={0.05}
          display={v => `${Math.round(v * 100)}%`}
          onChange={v => update('originRatioThreshold', v)}
        />
        <SliderField
          label="Min Name Sample"
          description="Names needed before the ratio is trusted. ↓ Lower → ratio scored sooner but may be unreliable with few names. ↑ Higher → more companies fall back to neutral 10/30 pts until enough names are found."
          value={local.originRatioMinSample}
          min={5} max={100} step={5}
          display={v => String(v)}
          onChange={v => update('originRatioMinSample', v)}
        />
        <SliderField
          label="Hot Verified Threshold"
          description="Minimum score for Hot Verified status. ↓ Lower → more leads reach top priority, risking false positives. ↑ Higher → only the highest-confidence leads get immediate outreach — smaller but cleaner list."
          value={local.leadScoreHotVerifiedThreshold}
          min={50} max={100} step={5}
          display={v => String(v)}
          onChange={v => update('leadScoreHotVerifiedThreshold', v)}
        />
        <SliderField
          label="Hot Threshold"
          description="Minimum score for Hot status. ↓ Lower → Hot list grows, more companies to outreach. ↑ Higher → Hot list shrinks, more leads fall to Warm and need nurturing first."
          value={local.leadScoreHotThreshold}
          min={40} max={90} step={5}
          display={v => String(v)}
          onChange={v => update('leadScoreHotThreshold', v)}
        />
        <SliderField
          label="Warm Threshold"
          description="Minimum score for Warm status. ↓ Lower → more companies enter the nurture pipeline. ↑ Higher → Warm list shrinks, more companies go straight to Cold and are deprioritised."
          value={local.leadScoreWarmThreshold}
          min={20} max={70} step={5}
          display={v => String(v)}
          onChange={v => update('leadScoreWarmThreshold', v)}
        />
        <SliderField
          label="Cold Threshold"
          description="Minimum score to stay in pipeline as Cold. ↓ Lower → more companies kept for review later, larger DB. ↑ Higher → more companies auto-disqualified — keeps the pipeline lean but risks dropping borderline leads."
          value={local.leadScoreColdThreshold}
          min={5} max={40} step={5}
          display={v => String(v)}
          onChange={v => update('leadScoreColdThreshold', v)}
        />

        {/* Tag editors — full width */}
        <div className="col-span-full border-t border-gray-100 pt-4 grid gap-4 md:grid-cols-2">
          <TagField
            label="Target Tech Stack Tags"
            description="Tags that score positively (up to 20 pts). Fewer tags = stricter match, smaller pipeline. More tags = more companies qualify but signal is diluted. ai, ml, generative-ai score 5 pts each; all others 3 pts."
            value={techTagsText}
            onChange={setTechTagsText}
            placeholder="nodejs, typescript, python, react, ai, ml"
          />
          <TagField
            label="High-Value Industries"
            description="Industry keywords that add +3 pts to Company Fit (substring match). Fewer keywords = only exact-fit industries rewarded. More keywords = broader bonus, less differentiation. Companies with no industry data always get the bonus."
            value={industriesText}
            onChange={setIndustriesText}
            placeholder="ai, saas, fintech, healthtech, edtech"
          />
        </div>

        <div className="col-span-full border-t border-gray-100 pt-4">
          <div className="text-gray-400 uppercase tracking-wide text-[10px] mb-2">
            Worker Concurrency
            <span className="normal-case ml-1 font-normal">— max parallel jobs per queue</span>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <SliderField
              label="Discovery"
              description="↓ Lower → less RAM + CPU, slower pipeline fill. ↑ Higher → faster discovery but each extra worker adds ~400MB RAM (Playwright). Max 2 recommended on 18GB."
              value={local.workerConcurrencyDiscovery}
              min={1} max={20} step={1}
              display={v => String(v)}
              onChange={v => update('workerConcurrencyDiscovery', v)}
            />
            <SliderField
              label="Enrichment"
              description="↓ Lower → less RAM, fewer browser sessions. ↑ Higher → enriches companies faster but each Playwright job uses ~400MB. Most memory-intensive worker — keep at 1 on 18GB."
              value={local.workerConcurrencyEnrichment}
              min={1} max={20} step={1}
              display={v => String(v)}
              onChange={v => update('workerConcurrencyEnrichment', v)}
            />
            <SliderField
              label="Scoring"
              description="↓ Lower → no real downside, scoring is instant. ↑ Higher → scores backlog faster with no memory risk — safe to raise, scoring uses no Playwright or LLM calls."
              value={local.workerConcurrencyScoring}
              min={1} max={30} step={1}
              display={v => String(v)}
              onChange={v => update('workerConcurrencyScoring', v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface SliderFieldProps {
  label: string; description?: string; value: number; min: number; max: number; step: number;
  display: (v: number) => string;
  onChange: (v: number) => void;
}
function SliderField({ label, description, value, min, max, step, display, onChange }: SliderFieldProps) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
        <span className="uppercase tracking-wide font-medium text-gray-600">{label}</span>
        <span className="font-semibold text-gray-700">{display(value)}</span>
      </div>
      {description && <p className="text-[10px] text-gray-400 mb-1 leading-tight">{description}</p>}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-blue-600"
      />
    </div>
  );
}

interface TagFieldProps {
  label: string; description?: string; value: string; placeholder?: string;
  onChange: (v: string) => void;
}
function TagField({ label, description, value, placeholder, onChange }: TagFieldProps) {
  return (
    <div>
      <div className="text-[10px] font-medium text-gray-600 uppercase tracking-wide mb-0.5">{label}</div>
      {description && <p className="text-[10px] text-gray-400 mb-1 leading-tight">{description}</p>}
      <textarea
        rows={3} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-mono resize-none focus:outline-none focus:border-blue-300"
      />
    </div>
  );
}

// ─── Active Jobs Panel ────────────────────────────────────────────────────────
function ActiveJobsPanel({ jobs }: { jobs: { queue: string; name: string; domain?: string; source?: string; startedAt?: string }[] }) {
  if (!jobs.length) return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 text-xs text-gray-400 text-center py-8">
      No jobs currently running
    </div>
  );

  const elapsed = (startedAt?: string) => {
    if (!startedAt) return '';
    const s = Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);
    return s < 60 ? `${s}s` : `${Math.round(s / 60)}m`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Currently Processing</h3>
      <div className="space-y-1.5">
        {jobs.map((j, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-medium text-gray-700 capitalize">{j.queue}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-600">{j.domain ?? j.source ?? j.name}</span>
            {j.startedAt && (
              <span className="ml-auto text-gray-400">{elapsed(j.startedAt)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ControlTab ───────────────────────────────────────────────────────────────
export default function ControlTab() {
  const { queueStats, cronInfo, activeJobs, settings, loading, error, refresh, actions, saveSettings } = useControl();
  const { toast } = useToast();

  const run = async (fn: () => Promise<{ data: { message?: string; runId?: string; queued?: number; retried?: number } }>, msg?: string) => {
    try {
      const res = await fn();
      toast(msg ?? res.data.message ?? 'Done');
    } catch (e) { toast('Error: ' + (e as Error).message); }
  };

  if (loading && !queueStats) return <ControlSkeleton />;

  if (error && !queueStats) return (
    <>
      <ApiOffline error={error} onRetry={refresh} />
      <div className="opacity-20 pointer-events-none select-none"><ControlSkeleton /></div>
    </>
  );

  const queues = ['discovery', 'enrichment', 'scoring'] as const;

  return (
    <div className="space-y-4">
      {/* Queue Cards */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {queues.map(q => queueStats && (
          <QueueCard
            key={q}
            name={q}
            counts={queueStats[q]}
            onRetry={() => run(() => actions.postRetryFailed(q), `Retrying failed ${q} jobs`)}
            onDrain={() => run(() => actions.deleteQueueDrain(q), `Drained ${q} queue`)}
          />
        ))}
      </div>

      {/* Seed + Rescore Row */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pipeline Seeding</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Button variant="primary" onClick={() => run(() => actions.postSeed(), 'Seed queued — discovery starting')}>
            ▶ Seed Now
          </Button>
          <Button variant="secondary" onClick={() => run(() => actions.postRescoreAll(), 'Re-scoring all companies')}>
            ⚡ Rescore All
          </Button>
          {cronInfo && (
            <span className="text-xs text-gray-400 ml-auto">
              Cron: <strong>{cronInfo.schedule}</strong>
              {cronInfo.lastSeedAt && <> · Last: {new Date(cronInfo.lastSeedAt).toLocaleString()}</>}
              {cronInfo.nextApproxAt && <> · Next: {new Date(cronInfo.nextApproxAt).toLocaleString()}</>}
            </span>
          )}
        </div>
      </div>

      {/* Manual Scrape */}
      <ManualScrapeForm
        onScrape={(src, kw, limit, loc) =>
          run(() => actions.postManualScrape(src, kw, limit, loc), `Scrape queued: ${src} "${kw}"`)
        }
      />

      {/* Active Jobs */}
      <ActiveJobsPanel jobs={activeJobs} />

      {/* Settings */}
      {settings && (
        <SettingsPanel settings={settings} onSave={saveSettings} />
      )}
    </div>
  );
}
