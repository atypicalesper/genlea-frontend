import { useEffect, useState } from 'react';
import { fetchCompany, postReEnrich, postReScore, deleteCompany } from '../../api/endpoints';
import type { CompanyDetail } from '../../types';
import Badge from '../ui/Badge';
import ModalSkeleton from '../ui/skeletons/ModalSkeleton';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

interface CompanyModalProps {
  companyId: string | null;
  onClose: () => void;
}

export default function CompanyModal({ companyId, onClose }: CompanyModalProps) {
  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!companyId) return;
    setDetail(null);
    setError(null);
    setLoading(true);
    fetchCompany(companyId)
      .then(res => setDetail(res.data))
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
