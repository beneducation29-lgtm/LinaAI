export interface AdminCostSummary {
  days: number;
  dailyAICost: Array<{ key: string; cost: number }>;
  monthlyAICost: number;
  costPerUser: Array<{ key: string; cost: number }>;
  costPerFeature: Array<{ key: string; cost: number }>;
  topExpensiveOperations: Array<{ key: string; cost: number }>;
  totals: { geminiRequests: number; inputTokens: number; outputTokens: number; voiceMinutes: number; ttsUsage: number; sttUsage: number; avatarUsage: number };
}
export async function fetchAdminCosts(days = 30): Promise<AdminCostSummary> {
  const response = await fetch('/api/admin/costs?days=' + encodeURIComponent(String(days)), { credentials: 'include' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'Không thể tải cost dashboard.');
  return data;
}
