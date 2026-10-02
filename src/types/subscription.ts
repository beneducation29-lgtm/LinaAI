export type PlanId = 'FREE' | 'PREMIUM' | 'PRO';
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
export type EntitlementKey = 'canUseAI' | 'canUseVoice' | 'canUseAdvancedRoleplay' | 'canUsePremiumLessons';

export interface Entitlements {
  plan: PlanId;
  canUseAI: boolean;
  canUseVoice: boolean;
  canUseAdvancedRoleplay: boolean;
  canUsePremiumLessons: boolean;
  monthlyMinutes: number | null;
  dailyRequests: number | null;
}

export interface SubscriptionRecord {
  userId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  provider: string | null;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface UsageSnapshot {
  dailyRequests: number;
  monthlyMinutes: number;
  geminiRequests: number;
  inputTokens: number;
  outputTokens: number;
  voiceMinutes: number;
  ttsUsage: number;
  sttUsage: number;
  avatarUsage: number;
}

export interface AIUsageRecord {
  userId: string;
  model: string;
  purpose: string;
  estimatedCost: number;
  inputTokens: number;
  outputTokens: number;
  timestamp: string;
}
