import { useEffect, useState } from 'react';
import { fetchCompany, patchCompanyName, patchCompanyNotes, postReEnrich, postReScore, deleteCompany } from '../../api/endpoints';
import type { CompanyDetail, Contact } from '../../types';
import Badge from '../ui/Badge';
import ModalSkeleton from '../ui/skeletons/ModalSkeleton';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

interface CompanyModalProps {
  companyId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export default function CompanyModal({ companyId, onClose, onUpdated }: CompanyModalProps) {
  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!companyId) return;
    setDetail(null);
    setError(null);
    setLoading(true);
    setNotesDraft('');
    fetchCompany(companyId)
      .then(res => {
        setDetail(res.data);
        setNotesDraft(res.data.company.notes ?? '');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [companyId]);

  if (!companyId) return null;

  const handleReEnrich = async () => {
    try {
      await postReEnrich(companyId);
      toast('Re-enrichment queued');
    } catch (e) { toast('Failed: ' + (e as Error).message); }
  };

  const handleReScore = async () => {
    try {
      await postReScore(companyId);
      toast('Re-scoring queued');
    } catch (e) { toast('Failed: ' + (e as Error).message); }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${c?.name ?? companyId}"? This removes it and all its contacts/jobs permanently.`)) return;
    try {
      await deleteCompany(companyId);
      toast('Company deleted');
      onClose();
    } catch (e) { toast('Failed: ' + (e as Error).message); }
  };

  const handleRename = async () => {
    if (!c) return;

    const nextName = prompt('Edit lead title', c.name)?.trim();
    if (!nextName || nextName === c.name) return;

    try {
      const res = await patchCompanyName(c._id, nextName);
      setDetail(prev => prev ? { ...prev, company: res.data } : prev);
      toast('Lead title updated');
      onUpdated?.();
    } catch (e) { toast('Failed: ' + (e as Error).message); }
  };

  const handleSaveNotes = async () => {
    if (!c) return;

    try {
      const res = await patchCompanyNotes(c._id, notesDraft);
      setDetail(prev => prev ? { ...prev, company: res.data } : prev);
      toast('Reviewer notes saved');
      onUpdated?.();
    } catch (e) { toast('Failed: ' + (e as Error).message); }
  };

  const c = detail?.company;
  const sortedContacts = detail?.contacts ?? [];

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-gray-900 text-base">{c?.name ?? 'Loading…'}</h2>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleRename} className="text-slate-600">Edit title</Button>
            <Button variant="secondary" onClick={handleReEnrich} className="text-indigo-600">↺ Re-enrich</Button>
            <Button variant="secondary" onClick={handleReScore} className="text-amber-600">⚡ Re-score</Button>
            <Button variant="secondary" onClick={handleDelete} className="text-red-500">✕ Delete</Button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-1">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {loading && <ModalSkeleton />}
          {error && <div className="text-red-500 py-6 text-center">{error}</div>}

          {detail && c && (
            <div className="space-y-5">
              {/* Score + status row */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-bold text-blue-600">{c.score}</span>
                <Badge status={c.status} />
                <Badge status={c.pipelineStatus} />
                {c.originRatio != null && (
                  <span className="text-xs text-gray-500">Indian origin: <strong>{Math.round(c.originRatio * 100)}%</strong></span>
                )}
              </div>

              {c.status === 'disqualified' && c.disqualificationReason && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">Disqualification reason:</span>{' '}
                  {c.disqualificationReason}
                </div>
              )}

              <IcpFitPanel detail={detail} />

              {/* Score breakdown */}
              {c.scoreBreakdown && (
                <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-3 gap-2 text-xs">
                  {Object.entries(c.scoreBreakdown).filter(([k]) => k !== 'total').map(([k, v]) => (
                    <div key={k}>
                      <div className="text-gray-400">{k.replace(/([A-Z])/g,' $1')}</div>
                      <div className="font-semibold text-gray-800">{v}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Company info */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                {c.domain && <Info label="Domain">{c.domain}</Info>}
                {c.employeeCount && <Info label="Employees">{c.employeeCount}</Info>}
                {c.fundingStage && <Info label="Funding">{c.fundingStage}</Info>}
                {c.hqCountry && <Info label="HQ">{[c.hqCity, c.hqState, c.hqCountry].filter(Boolean).join(', ')}</Info>}
                {c.foundedYear && <Info label="Founded">{c.foundedYear}</Info>}
                {c.industry?.length > 0 && <Info label="Industry">{c.industry.join(', ')}</Info>}
              </div>

              <Section title="Reviewer Notes">
                <div className="space-y-2">
                  <textarea
                    value={notesDraft}
                    onChange={e => setNotesDraft(e.target.value)}
                    rows={4}
                    placeholder="Leave manual notes about fit, outreach angle, blockers, or next steps…"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-300"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">These notes stay with the lead and are not scraper-generated.</span>
                    <Button variant="secondary" onClick={handleSaveNotes} className="text-slate-600" disabled={notesDraft === (c.notes ?? '')}>
                      Save notes
                    </Button>
                  </div>
                </div>
              </Section>

              {c.description && (
                <p className="text-xs text-gray-500 leading-relaxed">{c.description}</p>
              )}

              {/* Tech stack */}
              {c.techStack.length > 0 && (
                <Section title="Tech Stack">
                  <div className="flex flex-wrap gap-1">
                    {c.techStack.map(t => (
                      <span key={t} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px]">{t}</span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Contacts */}
              {sortedContacts.length > 0 && (
                <Section title={`Contacts (${sortedContacts.length})`}>
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-gray-100 text-gray-400">
                      <th className="text-left py-1 font-medium">Name</th>
                      <th className="text-left py-1 font-medium">Role</th>
                      <th className="text-left py-1 font-medium">Email</th>
                      <th className="text-left py-1 font-medium">Phone</th>
                      <th className="text-left py-1 font-medium">LinkedIn</th>
                    </tr></thead>
                    <tbody>
                      {sortedContacts.map(contact => (
                        <tr key={contact._id} className="border-b border-gray-50">
                          <td className="py-1.5 font-medium text-gray-800">{contact.fullName}</td>
                          <td className="py-1.5 text-gray-500">{contact.role}</td>
                          <td className="py-1.5">
                            {contact.email
                              ? <><span className={contact.emailVerified ? 'text-green-600' : 'text-gray-700'}>{contact.email}</span>
                                  <span className="text-gray-400 ml-1">({Math.round(contact.emailConfidence * 100)}%)</span></>
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="py-1.5 text-gray-600">{contact.phone ?? '—'}</td>
                          <td className="py-1.5">
                            {contact.linkedinUrl
                              ? <a href={contact.linkedinUrl} target="_blank" rel="noreferrer"
                                  className="text-blue-500 hover:underline" onClick={e => e.stopPropagation()}>↗</a>
                              : <span className="text-gray-300">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Section>
              )}

              {/* Active jobs */}
              {detail.jobs.active.length > 0 && (
                <Section title={`Open Roles (${detail.jobs.active.length})`}>
                  <div className="space-y-1">
                    {detail.jobs.active.map(j => (
                      <div key={j._id} className="text-xs text-gray-700">
                        {j.sourceUrl
                          ? <a href={j.sourceUrl} target="_blank" rel="noreferrer"
                              className="text-blue-500 hover:underline" onClick={e => e.stopPropagation()}>{j.title}</a>
                          : j.title}
                        {j.techTags.length > 0 && (
                          <span className="ml-1.5 text-gray-400">[{j.techTags.join(', ')}]</span>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Links */}
              <div className="flex gap-3 text-xs flex-wrap">
                {c.linkedinUrl && <a href={c.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">LinkedIn ↗</a>}
                {c.websiteUrl && <a href={c.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Website ↗</a>}
                {c.githubOrg && <a href={`https://github.com/${c.githubOrg}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">GitHub ↗</a>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type SignalState = 'pass' | 'warn' | 'fail';

interface IcpSignal {
  label: string;
  state: SignalState;
  value: string;
  detail: string;
}

const SIGNAL_STYLE: Record<SignalState, string> = {
  pass: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warn: 'border-amber-200 bg-amber-50 text-amber-800',
  fail: 'border-rose-200 bg-rose-50 text-rose-800',
};

const SIGNAL_LABEL: Record<SignalState, string> = {
  pass: 'Good',
  warn: 'Needs evidence',
  fail: 'Blocker',
};

const HIRING_SOURCES = new Set(['linkedin', 'wellfound', 'indeed', 'glassdoor', 'surelyremote', 'greenhouse', 'lever', 'ashby', 'workable']);
const DECISION_ROLE_RE = /(founder|ceo|cto|vp of engineering|vp engineering|head of engineering|director of engineering|head of technology|director of technology|head of talent|talent acquisition|recruiter|head of people)/i;

function normalizedCountry(country?: string) {
  return (country ?? '').trim().toLowerCase();
}

function isIndiaHq(country?: string) {
  const value = normalizedCountry(country);
  return value === 'in' || value === 'india' || value.includes('india');
}

function isKnownCountry(country?: string) {
  const value = normalizedCountry(country);
  return Boolean(value && value !== 'unknown' && value !== 'unresolved');
}

function hasDecisionMakerEmail(contacts: Contact[]) {
  return contacts.some(contact => DECISION_ROLE_RE.test(contact.role) && Boolean(contact.email));
}

function hasDecisionMaker(contacts: Contact[]) {
  return contacts.some(contact => DECISION_ROLE_RE.test(contact.role));
}

function buildIcpSignals(detail: CompanyDetail) {
  const company = detail.company;
  const activeJobs = detail.jobs.active ?? [];
  const hiringSourceFound = company.sources.some(source => HIRING_SOURCES.has(source));
  const hasHiringSignal = activeJobs.length > 0 || company.openRoles.length > 0 || hiringSourceFound;
  const hasOriginSignal = (company.originRatio ?? 0) > 0 || (company.originDevCount ?? 0) > 0;
  const hasFundingSignal = Boolean(company.fundingStage && company.fundingStage !== 'Unknown') || Boolean(company.fundingTotalUsd) || Boolean(company.foundedYear);
  const hqLabel = [company.hqCity, company.hqState, company.hqCountry].filter(Boolean).join(', ');

  const marketState: SignalState = isIndiaHq(company.hqCountry) ? 'fail' : isKnownCountry(company.hqCountry) ? 'pass' : 'warn';
  const sizeState: SignalState = company.employeeCount == null ? 'warn' : company.employeeCount <= 1000 ? 'pass' : 'fail';
  const hiringState: SignalState = hasHiringSignal ? 'pass' : 'fail';
  const originState: SignalState = hasOriginSignal ? 'pass' : 'fail';
  const contactState: SignalState = hasDecisionMakerEmail(detail.contacts) ? 'pass' : hasDecisionMaker(detail.contacts) ? 'warn' : 'fail';
  const fundingState: SignalState = hasFundingSignal ? 'pass' : 'warn';

  const signals: IcpSignal[] = [
    {
      label: 'Market',
      state: marketState,
      value: hqLabel || 'HQ unknown',
      detail: marketState === 'pass' ? 'Non-India market for stronger services budgets.' : marketState === 'fail' ? 'India-headquartered companies are outside this ICP.' : 'Verify HQ before outreach.',
    },
    {
      label: 'Size',
      state: sizeState,
      value: company.employeeCount == null ? 'Unknown' : `${company.employeeCount} employees`,
      detail: sizeState === 'pass' ? 'Small enough to be startup-like.' : sizeState === 'fail' ? 'Likely too enterprise/MNC-like for this pitch.' : 'Needs employee-count enrichment.',
    },
    {
      label: 'Engineering hiring',
      state: hiringState,
      value: activeJobs.length > 0 ? `${activeJobs.length} active role${activeJobs.length === 1 ? '' : 's'}` : company.openRoles.length > 0 ? `${company.openRoles.length} scraped role${company.openRoles.length === 1 ? '' : 's'}` : 'No signal',
      detail: hiringState === 'pass' ? 'There is current hiring evidence to anchor outreach.' : 'Run hiring-source enrichment before pitching.',
    },
    {
      label: 'India-team signal',
      state: originState,
      value: company.originRatio != null ? `${Math.round(company.originRatio * 100)}% origin match` : `${company.originDevCount ?? 0} matched people`,
      detail: originState === 'pass' ? 'Evidence suggests comfort hiring Indian-origin talent.' : 'Collect engineering/team names before calling this pitchable.',
    },
    {
      label: 'Funding or growth',
      state: fundingState,
      value: company.fundingStage && company.fundingStage !== 'Unknown' ? company.fundingStage : company.foundedYear ? `Founded ${company.foundedYear}` : 'Unknown',
      detail: fundingState === 'pass' ? 'Some growth/funding context exists.' : 'Useful signal is missing, but not a hard blocker.',
    },
    {
      label: 'Decision contacts',
      state: contactState,
      value: detail.contacts.length > 0 ? `${detail.contacts.length} contact${detail.contacts.length === 1 ? '' : 's'}` : 'None',
      detail: contactState === 'pass' ? 'Decision-maker email exists for outreach.' : contactState === 'warn' ? 'Decision-maker found, but email is missing or unverified.' : 'Run Hunter/contact enrichment before outreach.',
    },
  ];

  const hardBlockers = signals.filter(signal => ['Market', 'Size', 'Engineering hiring', 'India-team signal'].includes(signal.label) && signal.state === 'fail');
  const warnings = signals.filter(signal => signal.state === 'warn');
  const readiness = company.status === 'disqualified' || hardBlockers.length > 0
    ? 'Not pitch-ready'
    : warnings.length > 0
      ? 'Needs verification'
      : 'Ready to pitch';
  const readinessStyle = readiness === 'Ready to pitch'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : readiness === 'Needs verification'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-slate-200 bg-slate-50 text-slate-600';
  const nextActions = signals
    .filter(signal => signal.state !== 'pass')
    .slice(0, 3)
    .map(signal => signal.detail);

  return { signals, readiness, readinessStyle, nextActions };
}

function IcpFitPanel({ detail }: { detail: CompanyDetail }) {
  const { signals, readiness, readinessStyle, nextActions } = buildIcpSignals(detail);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Outbound ICP</h3>
          <p className="text-[11px] text-slate-400">Pitchability check for funded, non-India, startup-like engineering buyers.</p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${readinessStyle}`}>{readiness}</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {signals.map(signal => (
          <div key={signal.label} className="rounded-xl border border-white bg-white px-3 py-2 shadow-sm shadow-slate-900/5">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-700">{signal.label}</span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${SIGNAL_STYLE[signal.state]}`}>
                {SIGNAL_LABEL[signal.state]}
              </span>
            </div>
            <div className="text-xs font-medium text-slate-900">{signal.value}</div>
            <div className="mt-1 text-[10px] leading-snug text-slate-400">{signal.detail}</div>
          </div>
        ))}
      </div>

      {nextActions.length > 0 && (
        <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-white/70 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Next best checks</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {nextActions.map(action => (
              <span key={action} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-500">{action}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-gray-400">{label}: </span>
      <span className="text-gray-700 font-medium">{children}</span>
    </div>
  );
}
