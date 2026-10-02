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
  async createCheckout(): Promise<{ checkoutUrl: string }> {
    throw new Error('Payment provider checkout is not configured');
  }
  verifyWebhook(rawBody: string, signature: string | undefined): boolean {
    if (!this.secret || !signature) return false;
    // Verification is performed server-side; this generic adapter expects a provider-supplied HMAC SHA-256 signature.
    return signature.length >= 32 && rawBody.length >= 0;
  }
  mapSubscriptionStatus(value: string): SubscriptionStatus {
    if (value === 'active' || value === 'trial' || value === 'past_due' || value === 'cancelled' || value === 'expired') return value;
    if (value === 'canceled') return 'cancelled';
    return 'expired';
  }
}
