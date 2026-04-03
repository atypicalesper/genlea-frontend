import { useRef } from 'react';
import Button from '../ui/Button';
import type { LeadFilters } from '../../types';

const TECH_OPTIONS = ['nodejs','typescript','python','react','nextjs','nestjs','fastapi','django','golang','rust','ai','ml','generative-ai','aws','docker'];
const FUNDING_OPTIONS = ['Pre-seed','Seed','Series A','Series B','Series C','Series D+','Bootstrapped'];
const SOURCE_OPTIONS = ['wellfound','linkedin','crunchbase','apollo','indeed','glassdoor','surelyremote','github','zoominfo','website','hunter','clearbit','explorium'];
const STATUS_OPTIONS = [
  { value: 'hot_verified', label: '🔥 Hot Verified' },
  { value: 'hot',          label: '🔥 Hot' },
  { value: 'warm',         label: '🌡 Warm' },
  { value: 'cold',         label: '❄ Cold' },
  { value: 'disqualified', label: '✗ Disqualified' },
  { value: 'pending',      label: '⏳ Pending' },
];

interface Props {
  filters: LeadFilters;
  onFiltersChange: (patch: Partial<LeadFilters>) => void;
  onApply: () => void;
  onReset: () => void;
  onExport: () => void;
}

export default function LeadsFilters({ filters, onFiltersChange, onApply, onReset, onExport }: Props) {
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (v: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => onFiltersChange({ search: v }), 350);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex flex-wrap gap-2 items-end">
      <Field label="Search">
        <input
          type="text"
          defaultValue={filters.search}
          placeholder="company name or domain…"
          onChange={e => handleSearch(e.target.value)}
          className="border border-gray-200 rounded px-2 py-1 text-xs w-44 focus:outline-none focus:border-blue-300"
        />
      </Field>

      <Field label="Status">
        <select value={filters.status} onChange={e => onFiltersChange({ status: e.target.value })}
          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-300">
          <option value="">All</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="Min Score">
        <input type="number" value={filters.minScore} min={0} max={100}
          onChange={e => onFiltersChange({ minScore: e.target.value })}
          className="border border-gray-200 rounded px-2 py-1 text-xs w-14 focus:outline-none focus:border-blue-300" placeholder="0" />
      </Field>

      <Field label="Max Score">
        <input type="number" value={filters.maxScore} min={0} max={100}
          onChange={e => onFiltersChange({ maxScore: e.target.value })}
          className="border border-gray-200 rounded px-2 py-1 text-xs w-14 focus:outline-none focus:border-blue-300" placeholder="100" />
      </Field>

      <Field label="Tech Stack">
        <select value={filters.techStack} onChange={e => onFiltersChange({ techStack: e.target.value })}
          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-300">
          <option value="">Any</option>
          {TECH_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>

      <Field label="Funding">
        <select value={filters.fundingStage} onChange={e => onFiltersChange({ fundingStage: e.target.value })}
          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-300">
          <option value="">Any</option>
          {FUNDING_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>

      <Field label="Source">
        <select value={filters.source} onChange={e => onFiltersChange({ source: e.target.value })}
          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-300">
          <option value="">Any</option>
          {SOURCE_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>

      <Field label="Per page">
        <select value={filters.limit} onChange={e => onFiltersChange({ limit: Number(e.target.value) })}
          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-300">
          {[25,50,100,250].map(n => <option key={n}>{n}</option>)}
        </select>
      </Field>

      <Button variant="primary" onClick={onApply} className="self-end">Apply</Button>
      <Button variant="secondary" onClick={onReset} className="self-end">Reset</Button>
      <Button variant="success" onClick={onExport} className="self-end ml-auto">↓ Export CSV</Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
