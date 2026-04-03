import { useEffect, useState } from 'react';
import { useLeads, DEFAULT_FILTERS } from '../../hooks/useLeads';
import { patchCompanyStatus } from '../../api/endpoints';
import { getExportUrl } from '../../api/endpoints';
import StatsBar from '../layout/StatsBar';
import LeadsFilters from './LeadsFilters';
import LeadsTable from './LeadsTable';
import CompanyModal from './CompanyModal';
import { useToast } from '../ui/Toast';
import type { LeadStatus } from '../../types';

const VALID_STATUSES: LeadStatus[] = ['hot_verified','hot','warm','cold','disqualified','pending'];

interface LeadsTabProps {
  onRegisterRefresh?: (fn: () => void) => void;
}

export default function LeadsTab({ onRegisterRefresh }: LeadsTabProps) {
  const { companies, contacts, stats, activeJobs, totalPages, totalCount, loading, error,
    filters, setFilters, refresh, lastRefresh } = useLeads();

  // Register refresh so App.tsx header button can trigger it
  useEffect(() => { onRegisterRefresh?.(refresh); }, [refresh, onRegisterRefresh]);
  const [modalId, setModalId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSort = (col: string) => {
    setFilters({
      sortBy: col,
      sortDir: filters.sortBy === col && filters.sortDir === 'desc' ? 'asc' : 'desc',
    });
  };

  const handleStatusChange = async (id: string, current: string) => {
    const next = prompt(`Set status:\n${VALID_STATUSES.join(', ')}\n\nCurrent: ${current}`)?.trim();
    if (!next || !VALID_STATUSES.includes(next as LeadStatus)) return;
    try {
      await patchCompanyStatus(id, next as LeadStatus);
      toast('Status updated to ' + next);
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
      />

      <CompanyModal companyId={modalId} onClose={() => setModalId(null)} />

      {/* Last refresh indicator */}
      <div className="px-5 pb-2 text-[10px] text-gray-400">{lastRefresh}</div>
    </>
  );
}
