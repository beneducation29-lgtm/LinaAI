import type { AIUsageRecord, UsageSnapshot } from '../types/subscription';

export interface UsageCostRates {
  inputPerMillion: number;
  outputPerMillion: number;
}

export function estimateTokenCost(inputTokens: number, outputTokens: number, rates: UsageCostRates): number {
  return Number(((Math.max(0, inputTokens) / 1_000_000) * rates.inputPerMillion + (Math.max(0, outputTokens) / 1_000_000) * rates.outputPerMillion).toFixed(8));
}

export function buildAIUsageRecord(input: {
  userId: string;
  model: string;
  purpose: string;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
  timestamp?: string;
}): AIUsageRecord {
  const inputTokens = Math.max(0, Math.floor(input.inputTokens || 0));
  const outputTokens = Math.max(0, Math.floor(input.outputTokens || 0));
  return {
    userId: input.userId,
    model: String(input.model).slice(0, 120),
    purpose: String(input.purpose).slice(0, 120),
    inputTokens,
    outputTokens,
    estimatedCost: Number(Math.max(0, input.estimatedCost || 0).toFixed(8)),
    timestamp: input.timestamp || new Date().toISOString(),
  };
}

export function emptyUsageSnapshot(): UsageSnapshot {
  return { dailyRequests: 0, monthlyMinutes: 0, geminiRequests: 0, inputTokens: 0, outputTokens: 0, voiceMinutes: 0, ttsUsage: 0, sttUsage: 0, avatarUsage: 0 };
}
