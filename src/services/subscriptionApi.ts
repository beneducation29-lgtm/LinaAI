import type { Entitlements, SubscriptionRecord, UsageSnapshot, PlanId } from '../types/subscription';

export interface SubscriptionSnapshot {
  subscription: SubscriptionRecord | null;
  entitlements: Entitlements;
  usage: UsageSnapshot | { dailyRequests: number; monthlyMinutes: number };
}

export async function fetchSubscription(): Promise<SubscriptionSnapshot> {
  const response = await fetch('/api/subscription/me', { credentials: 'include' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'Không thể tải subscription.');
  return data;
}

export async function startCheckout(plan: Exclude<PlanId, 'FREE'>): Promise<{ checkoutUrl: string }> {
  const response = await fetch('/api/billing/checkout', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'Không thể khởi tạo thanh toán.');
  return data;
}
