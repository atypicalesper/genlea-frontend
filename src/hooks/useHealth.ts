// useHealth — pings /health periodically so the shell can show ApiOffline.
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../api/client';

interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'] as const,
    queryFn: () => apiFetch<HealthResponse>('/health', undefined, 5_000),
    refetchInterval: 30_000,
    retry: 1,
  });
}
