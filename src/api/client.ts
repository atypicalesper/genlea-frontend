// ─── Base API client ──────────────────────────────────────────────────────────
// Single responsibility: HTTP transport + error normalization.
// All domain-specific endpoints live in api/endpoints/*.ts

const BASE_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch<T>(
  url: string,
  opts?: RequestInit,
  timeoutMs = BASE_TIMEOUT_MS,
): Promise<T> {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: ctrl.signal, ...opts });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new ApiError(res.status, `API ${res.status}: ${text.slice(0, 200)}`);
    }
    try {
      return await res.json() as T;
    } catch {
      throw new ApiError(200, 'Server returned non-JSON response');
    }
  } finally {
    clearTimeout(tid);
  }
}

export const apiPost = <T>(url: string, body: unknown, timeoutMs?: number) =>
  apiFetch<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, timeoutMs);

export const apiPatch = <T>(url: string, body: unknown) =>
  apiFetch<T>(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const apiDelete = <T>(url: string) =>
  apiFetch<T>(url, { method: 'DELETE' });
