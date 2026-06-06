import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import {
  SUBSCRIPTION_PLANS,
  CREDIT_PACKS,
  PROMOTION_BUNDLES,
  SCREENING_UPSELLS,
  SITE,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import { resolveEmployerCommercialEntitlements } from "@/lib/monetization/admin-grants/actions";
import { selectBestCommercialDiscount } from "@/lib/monetization/admin-grants/resolver";
import { consumeGrantCredit } from "@/lib/monetization/admin-grants/actions";

import { z } from "zod";

const checkoutSchema = z.object({
  jobId: z.string().optional().nullable(),
  applicationId: z.string().optional().nullable(),
  listingType: z.string().optional().nullable(), // Allow standard/featured
  planType: z.string().optional().nullable(),
  packType: z.string().optional().nullable(),
  bundleType: z.string().optional().nullable(),
  serviceType: z.string().optional().nullable(),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
});

type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
type ScreeningServiceInsert = Database["public"]["Tables"]["screening_services"]["Insert"];
type PaymentsMutationTable = {
  insert(values: PaymentInsert[]): {
    select(): {
      single(): Promise<{
        data: { id: string } | null;
        error: { message: string } | null;
      }>;
    };
  };
  update(values: { stripe_checkout_session_id: string }): {
    eq(column: "id", value: string): Promise<unknown>;
  };
};
type FreePaymentsMutationTable = {
  insert(values: PaymentInsert[]): Promise<{
    error: { message: string } | null;
  }>;
};
type ScreeningServicesMutationTable = {
  insert(values: ScreeningServiceInsert[]): Promise<{
    error: { message: string } | null;
  }>;
};
type ScreeningServiceType = keyof typeof SCREENING_UPSELLS;

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = checkoutSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      jobId,
      applicationId,
      listingType,
      planType,
      packType,
      bundleType,
      serviceType,
      billingCycle,
    } = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: employer, error: employerError } = await supabase
      .from("employers")
      .select("id")
      .eq("user_id", user.id)
      .single<{ id: string }>();

    if (employerError || !employer) {
      return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
    }

    const serviceSupabase = createServiceClient<Database>(
      getSupabaseUrl(),
      getSupabaseServiceKey()
    );

    let amount: number;
    let priceId: string | null = null;
    let checkoutLineItem:
      | {
          price: string;
          quantity: number;
        }
      | {
          price_data: {
            currency: string;
            unit_amount: number;
            product_data: {
              name: string;
              description?: string;
            };
          };
          quantity: number;
      }
      | null = null;
    let screeningApplicationId: string | null = null;
    let screeningServiceType: ScreeningServiceType | null = null;
    const metadata: Record<string, string> = {
      employerId: employer.id,
    };

    // Handle job listing payments (existing functionality)
    if (jobId && listingType) {
      amount = listingType === "featured" ? 5900 : 2900; // amount in cents
      // In a real app, you would use actual Stripe price IDs
      priceId = listingType === "featured" ? "price_featured" : "price_standard";
      metadata.jobId = jobId;
      metadata.listingType = listingType;
    }
    // Handle subscription payments
    else if (planType && billingCycle) {
      const plan = SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS];
      if (!plan) {
        return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
      }
      
      amount = billingCycle === "annual" ? plan.priceAnnual * 100 : plan.price * 100;
      // In a real app, you would have price IDs for each plan/billing cycle combination
      priceId = planType === "basic" 
        ? billingCycle === "annual" 
          ? "price_basic_annual" 
          : "price_basic_monthly"
        : planType === "professional"
          ? billingCycle === "annual"
            ? "price_professional_annual"
            : "price_professional_monthly"
          : planType === "enterprise"
            ? billingCycle === "annual"
              ? "price_enterprise_annual"
              : "price_enterprise_monthly"
            : "";
      
      metadata.planType = planType;
      metadata.billingCycle = billingCycle;
    }
    // Handle credit pack payments
    else if (packType) {
      const pack = CREDIT_PACKS[packType as keyof typeof CREDIT_PACKS];
      if (!pack) {
        return NextResponse.json({ error: "Invalid pack type" }, { status: 400 });
      }
      
      amount = pack.price * 100;
      // In a real app, you would have price IDs for each pack
      priceId = packType === "starter"
        ? "price_starter_pack"
        : packType === "standard"
          ? "price_standard_pack"
          : "price_premium_pack";
      
      metadata.packType = packType;
      metadata.credits = String(pack.credits);
    }
    // Handle promotion bundle payments
    else if (bundleType && jobId) {
      const bundle = PROMOTION_BUNDLES[bundleType as keyof typeof PROMOTION_BUNDLES];
      if (!bundle) {
        return NextResponse.json({ error: "Invalid bundle type" }, { status: 400 });
      }
      
      amount = bundle.price * 100;
      // In a real app, you would have price IDs for each bundle
      priceId = bundleType === "featuredBoost"
        ? "price_featured_boost"
        : bundleType === "socialPromotion"
          ? "price_social_promotion"
          : "price_email_blast";
      
      metadata.bundleType = bundleType;
      metadata.jobId = jobId;
    }
    // Handle screening service payments
    else if (serviceType) {
      if (!applicationId) {
        return NextResponse.json({ error: "Service type requires application ID" }, { status: 400 });
      }
      screeningApplicationId = applicationId;

      const service = SCREENING_UPSELLS[serviceType as keyof typeof SCREENING_UPSELLS];
      if (!service) {
        return NextResponse.json({ error: "Invalid service type" }, { status: 400 });
      }
      screeningServiceType = serviceType as ScreeningServiceType;

      const { data: application, error: applicationError } = await supabase
        .from("applications")
        .select("id")
        .eq("id", screeningApplicationId)
        .eq("employer_id", employer.id)
        .single();

      if (applicationError || !application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
      }

      amount = service.price * 100;
      checkoutLineItem = {
        price_data: {
          currency: "eur",
          unit_amount: amount,
          product_data: {
            name: `Screening: ${service.label}`,
            description: service.description,
          },
        },
        quantity: 1,
      };
      metadata.applicationId = applicationId;
      metadata.serviceType = screeningServiceType;
      metadata.serviceLabel = service.label;
    }
    else {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    if (!priceId && !checkoutLineItem) {
      return NextResponse.json({ error: "Price configuration missing" }, { status: 500 });
    }

    // Resolve commercial grants for discounts
    const entitlements = await resolveEmployerCommercialEntitlements(employer.id).catch(() => null);
    const bestDiscount = entitlements?.discounts.length 
      ? selectBestCommercialDiscount(entitlements.discounts, amount)
      : null;
    
    const finalAmountCents = bestDiscount ? bestDiscount.discountedTotalCents : amount;
    const screeningCreditGrantId =
      serviceType && entitlements?.credits.aiScreening.remaining
        ? entitlements.credits.aiScreening.sourceGrantIds[0] ?? null
        : null;
    const isFreeScreeningOrder = Boolean(serviceType) && (screeningCreditGrantId || finalAmountCents === 0);

    if (serviceType && isFreeScreeningOrder) {
      if (!screeningApplicationId || !screeningServiceType) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
      }

      if (screeningCreditGrantId) {
        await consumeGrantCredit({
          grantId: screeningCreditGrantId,
          context: {
            applicationId: screeningApplicationId,
            serviceType: screeningServiceType,
            action: "screening_order",
          },
        });
      }

      const screeningServicesTable =
        serviceSupabase.from("screening_services") as unknown as ScreeningServicesMutationTable;
      const { error: screeningError } = await screeningServicesTable
        .insert([
          {
            employer_id: employer.id,
            application_id: screeningApplicationId,
            service_type: screeningServiceType,
            status: "pending",
            result: null,
            purchased_at: new Date().toISOString(),
            completed_at: null,
          },
        ]);

      if (screeningError) {
        return NextResponse.json({ error: screeningError.message }, { status: 500 });
      }

      const freePaymentsTable = serviceSupabase.from("payments") as unknown as FreePaymentsMutationTable;
      const { error: paymentError } = await freePaymentsTable
        .insert([
          {
            employer_id: employer.id,
            job_id: null,
            amount: 0,
            currency: "eur",
            status: "completed",
            listing_type: screeningServiceType,
          },
        ]);

      if (paymentError) {
        return NextResponse.json({ error: paymentError.message }, { status: 500 });
      }

      return NextResponse.json({
        free: true,
        message: `${metadata.serviceLabel} ordered using your available credit.`,
        url: `${SITE.url}/employer/applications?screening=ordered`,
      });
    }

    // Create a payment record first
    const paymentsTable = serviceSupabase.from("payments") as unknown as PaymentsMutationTable;

    const { data: payment, error: paymentError } = await paymentsTable
      .insert([
        {
          employer_id: employer.id,
          job_id: jobId || null,
          amount: finalAmountCents / 100, // store in euros
          currency: "eur",
          status: "pending",
          listing_type: listingType || planType || packType || bundleType || serviceType || "unknown",
        },
      ])
      .select()
      .single();

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    if (!payment) {
      return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        checkoutLineItem ?? {
          price: priceId as string,
          quantity: 1,
        },
      ],
      mode: "payment",
      // Apply discount via coupon or dynamic price if possible
      // For simplicity in this demo, we'll use a dynamic discount if we had a coupon ID
      // but since we are calculating it server-side, we'd ideally create a one-time coupon
      // or use manual price overrides.
      // Here we just pass the info to success/metadata.
      success_url: `${SITE.url}/employer/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: serviceType
        ? `${SITE.url}/employer/applications`
        : jobId
          ? `${SITE.url}/employer/jobs/${jobId}`
          : `${SITE.url}/employer/dashboard`,
      metadata: {
        ...metadata,
        paymentId: payment.id,
        appliedGrantId: bestDiscount?.discount?.grantId || "",
        originalAmount: String(amount),
        discountAmount: String(bestDiscount?.discountCents || 0),
      },
    });

    // Update payment with Stripe session ID
    await paymentsTable
      .update({
        stripe_checkout_session_id: session.id,
      })
      .eq("id", payment.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
