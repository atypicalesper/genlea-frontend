import { useState } from 'react';
import { useControl } from '../../hooks/useControl';
import { useToast } from '../ui/Toast';
import QueueCard from './QueueCard';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import type { Settings } from '../../types';

const SOURCES = ['wellfound','linkedin','crunchbase','apollo','indeed','glassdoor','surelyremote','zoominfo','github'];

// ─── Manual Scrape Form ───────────────────────────────────────────────────────
function ManualScrapeForm({ onScrape }: { onScrape: (src: string, kw: string, limit: number) => Promise<void> }) {
  const [source,   setSource]   = useState(SOURCES[0]);
  const [keywords, setKeywords] = useState('');
  const [limit,    setLimit]    = useState(50);
  const [busy,     setBusy]     = useState(false);

  const handleSubmit = async () => {
    if (!keywords.trim()) return;
    setBusy(true);
    try { await onScrape(source, keywords.trim(), limit); }
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
        <div className="flex flex-col gap-0.5 flex-1 min-w-[160px]">
          <label className="text-[10px] text-gray-400 uppercase tracking-wide">Keywords</label>
          <input
            type="text"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            placeholder="e.g. react startup US"
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
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof Settings>(key: K, val: Settings[K]) =>
    setLocal(s => ({ ...s, [key]: val }));

  const updateConcurrency = (queue: keyof Settings['concurrency'], val: number) =>
    setLocal(s => ({ ...s, concurrency: { ...s.concurrency, [queue]: val } }));

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(local); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pipeline Parameters</h3>
        <Button variant="primary" onClick={handleSave} disabled={saving} className="text-xs">
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <SliderField
          label="Origin Ratio Threshold"
          value={local.originRatioThreshold}
          min={0.4} max={0.95} step={0.05}
          display={v => `${Math.round(v * 100)}%`}
          onChange={v => update('originRatioThreshold', v)}
        />
        <SliderField
          label="Min Name Sample"
          value={local.minNameSample}
          min={5} max={100} step={5}
          display={v => String(v)}
          onChange={v => update('minNameSample', v)}
        />
        <SliderField
          label="Hot Verified Threshold"
          value={local.hotVerifiedThreshold}
          min={50} max={100} step={5}
          display={v => String(v)}
          onChange={v => update('hotVerifiedThreshold', v)}
        />
        <SliderField
          label="Hot Threshold"
          value={local.hotThreshold}
          min={40} max={90} step={5}
          display={v => String(v)}
          onChange={v => update('hotThreshold', v)}
        />
        <SliderField
          label="Warm Threshold"
          value={local.warmThreshold}
          min={20} max={70} step={5}
          display={v => String(v)}
          onChange={v => update('warmThreshold', v)}
        />
        <div className="col-span-2">
          <div className="text-gray-400 uppercase tracking-wide text-[10px] mb-2">Worker Concurrency</div>
          <div className="grid grid-cols-3 gap-2">
            {(['discovery','enrichment','scoring'] as const).map(q => (
              <SliderField
                key={q}
                label={q}
                value={local.concurrency[q]}
                min={1} max={10} step={1}
                display={v => String(v)}
                onChange={v => updateConcurrency(q, v)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SliderFieldProps {
  label: string; value: number; min: number; max: number; step: number;
  display: (v: number) => string;
  onChange: (v: number) => void;
}
function SliderField({ label, value, min, max, step, display, onChange }: SliderFieldProps) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
        <span className="uppercase tracking-wide">{label}</span>
        <span className="font-semibold text-gray-700">{display(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-blue-600"
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
  const { queueStats, cronInfo, activeJobs, settings, loading, error, actions, saveSettings } = useControl();
  const { toast } = useToast();

  const run = async (fn: () => Promise<{ data: { message?: string; runId?: string; queued?: number; retried?: number } }>, msg?: string) => {
    try {
      const res = await fn();
      toast(msg ?? res.data.message ?? 'Done');
    } catch (e) { toast('Error: ' + (e as Error).message); }
  };

  if (loading && !queueStats) return (
    <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  );

  if (error) return (
    <div className="p-5 text-red-500 text-sm">{error}</div>
  );

  const queues = ['discovery', 'enrichment', 'scoring'] as const;

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Queue Cards */}
      <div className="grid grid-cols-3 gap-3">
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
        onScrape={(src, kw, limit) =>
          run(() => actions.postManualScrape(src, kw, limit), `Scrape queued: ${src} "${kw}"`)
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
