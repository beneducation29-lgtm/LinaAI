import type { Entitlements, UsageSnapshot } from '../types/subscription';

export type QuotaDecision = { allowed: true } | { allowed: false; code: 'LIMIT_REACHED'; reason: string; retryAfterSeconds?: number };

export function checkQuota(entitlements: Entitlements, usage: UsageSnapshot, requestedMinutes = 0): QuotaDecision {
  if (entitlements.dailyRequests !== null && usage.dailyRequests >= entitlements.dailyRequests) {
    return { allowed: false, code: 'LIMIT_REACHED', reason: 'DAILY_REQUESTS' };
  }
  if (entitlements.monthlyMinutes !== null && usage.monthlyMinutes + Math.max(0, requestedMinutes) > entitlements.monthlyMinutes) {
    return { allowed: false, code: 'LIMIT_REACHED', reason: 'MONTHLY_MINUTES' };
  }
  return { allowed: true };
}
