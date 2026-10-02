import type { Entitlements, PlanId, SubscriptionRecord } from '../types/subscription';

export const PLAN_ENTITLEMENTS: Record<PlanId, Omit<Entitlements, 'plan'>> = {
  FREE: {
    canUseAI: true,
    canUseVoice: true,
    canUseAdvancedRoleplay: false,
    canUsePremiumLessons: false,
    monthlyMinutes: 60,
    dailyRequests: 20,
  },
  PREMIUM: {
    canUseAI: true,
    canUseVoice: true,
    canUseAdvancedRoleplay: true,
    canUsePremiumLessons: true,
    monthlyMinutes: 600,
    dailyRequests: 100,
  },
  PRO: {
    canUseAI: true,
    canUseVoice: true,
    canUseAdvancedRoleplay: true,
    canUsePremiumLessons: true,
    monthlyMinutes: 3000,
    dailyRequests: 300,
  },
};

export function isSubscriptionEntitled(subscription: SubscriptionRecord | null, now = new Date()): boolean {
  if (!subscription) return false;
  if (subscription.status === 'cancelled' || subscription.status === 'expired') return false;
  if (subscription.status === 'trial' && subscription.trialEndsAt && new Date(subscription.trialEndsAt).getTime() <= now.getTime()) return false;
  if (subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd).getTime() <= now.getTime() && subscription.status !== 'trial') return false;
  return subscription.status === 'trial' || subscription.status === 'active' || subscription.status === 'past_due';
}

export function getEntitlements(subscription: SubscriptionRecord | null): Entitlements {
  const plan = subscription && isSubscriptionEntitled(subscription) ? subscription.plan : 'FREE';
  return { plan, ...PLAN_ENTITLEMENTS[plan] };
}

export function normalizePlan(value: unknown): PlanId {
  return value === 'PREMIUM' || value === 'PRO' ? value : 'FREE';
}
