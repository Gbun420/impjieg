# Talent Directory — Stripe Integration Plan

> **Status:** Draft
> **Date:** 2026-06-08
> **Purpose:** Define Stripe products, checkout, and webhook handling for Talent Directory monetization.

---

## 1. New Products/Prices

Create in Stripe Dashboard (not via code):

### Subscriptions

| Product | Price ID (env var) | Amount | Interval |
|---------|-------------------|--------|----------|
| Talent Starter | `STRIPE_PRICE_TALENT_STARTER` | €49/month | Monthly |
| Talent Recruiter | `STRIPE_PRICE_TALENT_RECRUITER` | €99/month | Monthly |

### Credit Packs (one-time)

| Product | Price ID (env var) | Amount | Credits |
|---------|-------------------|--------|---------|
| 5 Credits | `STRIPE_PRICE_TALENT_CREDITS_5` | €19 | 5 |
| 20 Credits | `STRIPE_PRICE_TALENT_CREDITS_20` | €49 | 20 |
| 50 Credits | `STRIPE_PRICE_TALENT_CREDITS_50` | €99 | 50 |

## 2. Env Variables

```bash
# Talent Directory Stripe prices
STRIPE_PRICE_TALENT_STARTER=price_xxx
STRIPE_PRICE_TALENT_RECRUITER=price_xxx
STRIPE_PRICE_TALENT_CREDITS_5=price_xxx
STRIPE_PRICE_TALENT_CREDITS_20=price_xxx
STRIPE_PRICE_TALENT_CREDITS_50=price_xxx
```

Add to `src/lib/runtime-env.ts` with empty string defaults.

## 3. Checkout Routes

### Subscription Checkout

```
POST /api/checkout
{
  "paymentType": "talent_directory_subscription",
  "planKey": "starter" | "recruiter"
}
```

Flow:
1. Authenticate employer
2. Resolve employer profile
3. Create Stripe checkout session with subscription mode
4. Set `client_reference_id` to `employer_id`
5. Return Stripe checkout URL

### Credit Pack Checkout

```
POST /api/checkout
{
  "paymentType": "talent_directory_credits",
  "packKey": "5" | "20" | "50"
}
```

Flow:
1. Authenticate employer
2. Resolve employer profile
3. Create Stripe checkout session with payment mode
4. Set `client_reference_id` to `employer_id`
5. Return Stripe checkout URL

## 4. Webhook Handling

### Events to Support

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Activate talent access or add credits |
| `customer.subscription.created` | Activate talent access |
| `customer.subscription.updated` | Update access status |
| `customer.subscription.deleted` | Deactivate talent access |
| `invoice.payment_succeeded` | Renew subscription period, reset monthly credits |
| `invoice.payment_failed` | Mark access as past_due |

### `checkout.session.completed` Handler

```typescript
case "talent_directory_subscription":
  // Upsert employer_talent_access with subscription details
  // Set status = 'active', plan_key, stripe IDs
  // Set contact_credits_total based on plan
  // Log audit event

case "talent_directory_credits":
  // Add credits to existing employer_talent_access
  // Increment contact_credits_total
  // Log audit event
```

### Subscription Lifecycle

- `created`/`updated` with `status: active` → ensure access is active
- `updated` with `status: past_due` → mark access past_due, keep existing data
- `deleted` → mark access cancelled/expired, keep existing contact requests visible
- `invoice.payment_succeeded` → reset monthly credits based on plan

## 5. Access Logic

| State | Search | Contact Request | Credits |
|-------|--------|----------------|---------|
| `active` subscription | ✅ | ✅ | Based on plan + packs |
| `trialing` subscription | ✅ | ✅ | Based on plan |
| `past_due` subscription | ❌ | ❌ | Frozen |
| `cancelled`/`expired` | ❌ | ❌ | Frozen |
| No access row | ❌ | ❌ | N/A |
| Credit pack (no sub) | ❌ | ✅ | Pack credits only |

### Monthly Credit Reset

- Talent Starter: 10 credits/month
- Talent Recruiter: 30 credits/month
- Reset on `invoice.payment_succeeded`
- Unused credits do not roll over (monthly allocation)
- Credit pack credits persist until used

## 6. Commercial Grants Integration

Admins can grant:

- **Temporary talent access** — `plan_access` grant with `plan_key: "starter"` or `"recruiter"` and expiry
- **Contact credits** — `talent_directory_credit` grant type with `credits_total`
- **Free trial** — `free_trial` grant with `plan_key` and expiry
- **Discount** — `percent_discount` or `fixed_discount` applied to checkout

Uses existing `admin_commercial_grants` table with new `talent_directory_credit` grant type.

**Do not mix Talent Directory credits with job posting credits.** They are separate credit pools.
