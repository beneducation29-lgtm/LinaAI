import assert from 'node:assert/strict';
import { getEntitlements, isSubscriptionEntitled } from '../src/services/entitlementService';
import { checkQuota } from '../src/services/quotaService';
import { GenericHmacPaymentProvider } from '../src/services/billingService';
import { createHmac } from 'node:crypto';

const free = getEntitlements(null);
assert.equal(free.plan, 'FREE');
assert.equal(free.dailyRequests, 20);
assert.equal(free.monthlyMinutes, 60);
assert.equal(free.canUsePremiumLessons, false);

const premium = getEntitlements({
  userId: 'u1', plan: 'PREMIUM', status: 'active', provider: null,
  providerCustomerId: null, providerSubscriptionId: null, trialEndsAt: null,
  currentPeriodStart: null, currentPeriodEnd: null, cancelAtPeriodEnd: false
});
assert.equal(premium.canUseAdvancedRoleplay, true);

const blocked = checkQuota(free, {
  dailyRequests: 20, monthlyMinutes: 0, geminiRequests: 20, inputTokens: 0,
  outputTokens: 0, voiceMinutes: 0, ttsUsage: 0, sttUsage: 0, avatarUsage: 0
});
assert.deepEqual(blocked, { allowed: false, code: 'LIMIT_REACHED', reason: 'DAILY_REQUESTS' });

const provider = new GenericHmacPaymentProvider('test', 'secret');
const body = JSON.stringify({ id: 'evt_1', userId: 'u1', plan: 'PREMIUM', status: 'active' });
const signature = createHmac('sha256', 'secret').update(body).digest('hex');
assert.equal(provider.verifyWebhook(body, signature), true);
assert.equal(provider.verifyWebhook(body, 'bad'), false);
assert.equal(provider.mapSubscriptionStatus('canceled'), 'cancelled');

assert.equal(isSubscriptionEntitled({ userId: 'u1', plan: 'FREE', status: 'expired', provider: null, providerCustomerId: null, providerSubscriptionId: null, trialEndsAt: null, currentPeriodStart: null, currentPeriodEnd: null, cancelAtPeriodEnd: false }), false);
console.log('Prompt 18 subscription tests passed');
