import { createHmac, timingSafeEqual } from 'node:crypto';
import type { PlanId, SubscriptionStatus } from '../types/subscription';

export interface PaymentProvider {
  readonly name: string;
  createCheckout(input: { userId: string; plan: PlanId; email?: string }): Promise<{ checkoutUrl: string; providerCustomerId?: string | null }>;
  verifyWebhook(rawBody: string, signature: string | undefined): boolean;
  mapSubscriptionStatus(value: string): SubscriptionStatus;
}

export class GenericHmacPaymentProvider implements PaymentProvider {
  readonly name: string;
  private readonly secret: string;
  constructor(name: string, secret: string) { this.name = name; this.secret = secret; }
  async createCheckout(_input: { userId: string; plan: PlanId; email?: string }): Promise<{ checkoutUrl: string }> {
    throw new Error('Payment provider checkout is not configured');
  }
  verifyWebhook(rawBody: string, signature: string | undefined): boolean {
    if (!this.secret || !signature) return false;
    const expected = createHmac('sha256', this.secret).update(rawBody, 'utf8').digest('hex');
    const provided = signature.replace(/^sha256=/i, '').trim();
    if (!/^[a-f0-9]{64}$/i.test(provided)) return false;
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'));
  }
  mapSubscriptionStatus(value: string): SubscriptionStatus {
    if (value === 'active' || value === 'trial' || value === 'past_due' || value === 'cancelled' || value === 'expired') return value;
    if (value === 'canceled') return 'cancelled';
    return 'expired';
  }
}
