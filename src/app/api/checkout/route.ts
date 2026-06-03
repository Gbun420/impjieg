import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { SUBSCRIPTION_PLANS, CREDIT_PACKS, PROMOTION_BUNDLES } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

import { z } from "zod";

const checkoutSchema = z.object({
  jobId: z.string().optional().nullable(),
  listingType: z.string().optional().nullable(), // Allow standard/featured
  planType: z.string().optional().nullable(),
  packType: z.string().optional().nullable(),
  bundleType: z.string().optional().nullable(),
  serviceType: z.string().optional().nullable(),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
});

type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
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

    const { jobId, listingType, planType, packType, bundleType, serviceType, billingCycle } = parsed.data;

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

    let amount: number;
    let priceId: string;
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
      // For screening services, we need an application ID, not a job ID
      // This is a simplification - in reality, you'd pass applicationId
      return NextResponse.json({ error: "Service type requires application ID" }, { status: 400 });
    }
    else {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    if (!priceId) {
      return NextResponse.json({ error: "Price configuration missing" }, { status: 500 });
    }

    // Create a payment record first
    const paymentsTable = supabase.from("payments") as unknown as PaymentsMutationTable;

    const { data: payment, error: paymentError } = await paymentsTable
      .insert([
        {
          employer_id: employer.id,
          job_id: jobId || null,
          amount: amount / 100, // store in euros
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
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/employer/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: jobId
        ? `${process.env.NEXT_PUBLIC_URL}/employer/jobs/${jobId}`
        : `${process.env.NEXT_PUBLIC_URL}/employer/dashboard`,
      metadata: {
        ...metadata,
        paymentId: payment.id,
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
