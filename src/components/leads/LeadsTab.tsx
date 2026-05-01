import { useEffect, useState } from 'react';
import { useLeads, DEFAULT_FILTERS } from '../../hooks/useLeads';
import { useUpdateCompanyStatus, useRenameCompany } from '../../hooks/useCompanyMutations';
import { getExportUrl } from '../../api/endpoints';
import StatsBar from '../layout/StatsBar';
import LeadsFilters from './LeadsFilters';
import LeadsTable from './LeadsTable';
import CompanyModal from './CompanyModal';
import StatusChangeModal from './StatusChangeModal';
import PromptModal from '../ui/PromptModal';
import ConfirmModal from '../ui/ConfirmModal';
import { useToast } from '../ui/Toast';
import type { Company, LeadStatus } from '../../types';

interface LeadsTabProps {
  onRegisterRefresh?: (fn: () => void) => void;
}

export default function LeadsTab({ onRegisterRefresh }: LeadsTabProps) {
  const { companies, contacts, stats, activeJobs, totalPages, totalCount, loading, error,
    filters, setFilters, refresh, lastRefresh } = useLeads();

  // Register refresh so App.tsx header button can trigger it
  useEffect(() => { onRegisterRefresh?.(refresh); }, [refresh, onRegisterRefresh]);

  const [modalId, setModalId] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<Company | null>(null);
  const [disqualifyTarget, setDisqualifyTarget] = useState<Company | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Company | null>(null);
  const [renameTarget, setRenameTarget] = useState<Company | null>(null);
  const { toast } = useToast();

  const updateStatus = useUpdateCompanyStatus();
  const renameCompany = useRenameCompany();

  const handleSort = (col: string) => {
    setFilters({
      sortBy: col,
      sortDir: filters.sortBy === col && filters.sortDir === 'desc' ? 'asc' : 'desc',
    });
  };

  const handleStatusChange = (id: string) => {
    const company = companies.find(c => c._id === id);
    if (company) setStatusTarget(company);
  };

  const handleStatusConfirm = (next: LeadStatus, reason?: string) => {
    if (!statusTarget) return;
    const { _id, name } = statusTarget;
    setStatusTarget(null);
    updateStatus.mutate(
      { id: _id, status: next, reason },
      {
        onSuccess: () => toast(`Status updated to ${next} for ${name}`),
        onError:   e => toast(`Failed: ${(e as Error).message}`),
      },
    );
  };

  const handleDisqualify = (id: string) => {
    const company = companies.find(c => c._id === id);
    if (company) setDisqualifyTarget(company);
  };

  const handleDisqualifyConfirm = (reason: string) => {
    if (!disqualifyTarget) return;
    const company = disqualifyTarget;
    setDisqualifyTarget(null);
    updateStatus.mutate(
      { id: company._id, status: 'disqualified', reason: reason || 'Manually disqualified' },
      {
        onSuccess: () => toast(`Lead disqualified: ${company.name}`),
        onError:   e => toast(`Failed: ${(e as Error).message}`),
      },
    );
  };

  const handleRestore = (id: string) => {
    const company = companies.find(c => c._id === id);
    if (company) setRestoreTarget(company);
  };

  const handleRestoreConfirm = () => {
    if (!restoreTarget) return;
    const company = restoreTarget;
    setRestoreTarget(null);
    updateStatus.mutate(
      { id: company._id, status: 'pending' },
      {
        onSuccess: () => toast(`Lead restored: ${company.name}`),
        onError:   e => toast(`Failed: ${(e as Error).message}`),
      },
    );
  };

  const handleRename = (id: string) => {
    const company = companies.find(c => c._id === id);
    if (company) setRenameTarget(company);
  };

  const handleRenameConfirm = (nextName: string) => {
    if (!renameTarget) return;
    const company = renameTarget;
    setRenameTarget(null);
    if (!nextName || nextName === company.name) return;
    renameCompany.mutate(
      { id: company._id, name: nextName },
      {
        onSuccess: () => toast('Lead title updated'),
        onError:   e => toast(`Failed: ${(e as Error).message}`),
      },
    );
  };

  const handleExport = () => window.open(getExportUrl(), '_blank');

  return (
    <>
      <StatsBar
        stats={stats}
        segment={filters.segment}
        onSegmentChange={segment => setFilters({ segment })}
      />

      <LeadsFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApply={refresh}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        onExport={handleExport}
      />

      <LeadsTable
        companies={companies}
        contacts={contacts}
        activeJobs={activeJobs}
        loading={loading}
        error={error}
        filters={filters}
        totalPages={totalPages}
        totalCount={totalCount}
        onSort={handleSort}
        onPageChange={delta => setFilters({ page: filters.page + delta })}
        onOpenCompany={id => setModalId(id)}
        onStatusChange={handleStatusChange}
        onDisqualify={handleDisqualify}
        onRestore={handleRestore}
        onRename={handleRename}
      />

      <CompanyModal companyId={modalId} onClose={() => setModalId(null)} onUpdated={refresh} />

      {statusTarget && (
        <StatusChangeModal
          companyName={statusTarget.name}
          currentStatus={statusTarget.status}
          onConfirm={handleStatusConfirm}
          onClose={() => setStatusTarget(null)}
        />
      )}

      <PromptModal
        open={!!disqualifyTarget}
        title={disqualifyTarget ? `Disqualify "${disqualifyTarget.name}"?` : ''}
        description="Why is this not a fit?"
        initialValue={disqualifyTarget?.disqualificationReason ?? ''}
        confirmLabel="Disqualify"
        multiline
        maxLength={500}
        onConfirm={handleDisqualifyConfirm}
        onClose={() => setDisqualifyTarget(null)}
      />

      <ConfirmModal
        open={!!restoreTarget}
        title={restoreTarget ? `Restore "${restoreTarget.name}"?` : ''}
        description="This will move it back into the review pipeline."
        confirmLabel="Restore"
        onConfirm={handleRestoreConfirm}
        onClose={() => setRestoreTarget(null)}
      />

      <PromptModal
        open={!!renameTarget}
        title="Edit lead title"
        initialValue={renameTarget?.name ?? ''}
        confirmLabel="Save"
        required
        maxLength={200}
        onConfirm={handleRenameConfirm}
        onClose={() => setRenameTarget(null)}
      />

      {/* Last refresh indicator */}
      <div className="px-1 pb-2 text-[10px] text-slate-400">{lastRefresh}</div>
    </>
  );
}
