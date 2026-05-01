// Mutation hooks for company status/name/notes changes.
// Optimistic: update the local cache immediately, rollback on error.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchCompanyStatus, patchCompanyName, patchCompanyNotes } from '../api/endpoints';
import type { Company, LeadStatus, PaginatedResponse } from '../types';

type LeadsCache = PaginatedResponse<Company>;

// Helper: walk every cached `leads` query and apply a mutation to the matching company
function mutateAllLeadsCaches(
  qc: ReturnType<typeof useQueryClient>,
  companyId: string,
  patch: Partial<Company>,
) {
  qc.setQueriesData<LeadsCache>({ queryKey: ['leads'] }, prev => {
    if (!prev) return prev;
    return {
      ...prev,
      data: prev.data.map(c => (c._id === companyId ? { ...c, ...patch } : c)),
    };
  });
}

export function useUpdateCompanyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: LeadStatus; reason?: string }) =>
      patchCompanyStatus(id, status, reason),
    onMutate: async ({ id, status, reason }) => {
      await qc.cancelQueries({ queryKey: ['leads'] });
      const snapshot = qc.getQueriesData<LeadsCache>({ queryKey: ['leads'] });
      mutateAllLeadsCaches(qc, id, {
        status,
        manuallyReviewed: true,
        ...(status === 'disqualified' ? { disqualificationReason: reason ?? 'Manually disqualified' } : {}),
      });
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      // Rollback on failure
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['leads'] });
      void qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useRenameCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => patchCompanyName(id, name),
    onMutate: async ({ id, name }) => {
      await qc.cancelQueries({ queryKey: ['leads'] });
      const snapshot = qc.getQueriesData<LeadsCache>({ queryKey: ['leads'] });
      mutateAllLeadsCaches(qc, id, { name });
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useUpdateCompanyNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => patchCompanyNotes(id, notes),
    onMutate: async ({ id, notes }) => {
      await qc.cancelQueries({ queryKey: ['leads'] });
      const snapshot = qc.getQueriesData<LeadsCache>({ queryKey: ['leads'] });
      mutateAllLeadsCaches(qc, id, { notes });
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}
