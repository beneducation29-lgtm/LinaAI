import type { AdminAnalyticsSummary } from '../types/analytics';

export async function fetchAdminAnalytics(days = 30): Promise<AdminAnalyticsSummary> {
  const response = await fetch('/api/admin/analytics?days=' + encodeURIComponent(String(days)), { credentials: 'include' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'Không thể tải analytics.');
  return data;
}
