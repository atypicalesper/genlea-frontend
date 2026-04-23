import { useEffect, useState } from 'react';
import { useLeads, DEFAULT_FILTERS } from '../../hooks/useLeads';
import { patchCompanyName, patchCompanyStatus } from '../../api/endpoints';
import { getExportUrl } from '../../api/endpoints';
import StatsBar from '../layout/StatsBar';
import LeadsFilters from './LeadsFilters';
import LeadsTable from './LeadsTable';
import CompanyModal from './CompanyModal';
import StatusChangeModal from './StatusChangeModal';
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
  const { toast } = useToast();

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

  const handleStatusConfirm = async (next: LeadStatus) => {
    if (!statusTarget) return;
    const { _id, name } = statusTarget;
    setStatusTarget(null);
    try {
      await patchCompanyStatus(_id, next);
      toast('Status updated to ' + next + ' for ' + name);
      refresh();
    } catch (e) { toast('Failed: ' + (e as Error).message); }
  };

  const handleDisqualify = async (id: string) => {
    const company = companies.find(c => c._id === id);
    if (!company) return;
    if (!confirm(`Disqualify "${company.name}"? You can restore it later with the status picker.`)) return;

    try {
      await patchCompanyStatus(id, 'disqualified');
      toast('Lead disqualified: ' + company.name);
      refresh();
    } catch (e) { toast('Failed: ' + (e as Error).message); }
  };

  const handleRename = async (id: string) => {
    const company = companies.find(c => c._id === id);
    if (!company) return;

    const nextName = prompt('Edit lead title', company.name)?.trim();
    if (!nextName || nextName === company.name) return;

    try {
      await patchCompanyName(id, nextName);
      toast('Lead title updated');
      refresh();
    } catch (e) { toast('Failed: ' + (e as Error).message); }
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

      {/* Last refresh indicator */}
      <div className="px-1 pb-2 text-[10px] text-slate-400">{lastRefresh}</div>
    </>
  );
}
