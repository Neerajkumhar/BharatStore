import { showUpgradePrompt } from '@/components/entitlements/UpgradePrompt';

/**
 * fetch wrapper that surfaces plan/feature 403s (PLAN_LIMIT_EXCEEDED,
 * FEATURE_NOT_IN_PLAN) through the global upgrade modal. Returns the raw
 * Response so callers keep their existing error handling.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (response.status === 403) {
    try {
      const payload = await response.clone().json();
      const code = payload?.data?.code;
      if (code === 'PLAN_LIMIT_EXCEEDED' || code === 'FEATURE_NOT_IN_PLAN') {
        showUpgradePrompt(payload.data);
      }
    } catch {
      // Non-JSON body — ignore; caller handles the response normally.
    }
  }
  return response;
}
