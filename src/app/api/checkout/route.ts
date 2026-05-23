import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { PRICES, SUBSCRIPTION_PLANS, CREDIT_PACKS, PROMOTION_BUNDLES, SCREENING_UPSELLS } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const { jobId, listingType, planType, packType, bundleType, serviceType, billingCycle = "monthly" } = await request.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: employer } = await supabase
      .from("employers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!employer) {
      return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
    }

    let amount: number;
    let priceId: string;
    let metadata: Record<string, string> = {
      employerId: employer.id,
    };

    // Handle job listing payments (existing functionality)
    if (jobId && listingType) {
      amount = listingType === "featured" ? 5900 : 2900; // amount in cents
      priceId = listingType === "featured" ? PRICES.featured : PRICES.standard;
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
    else if (serviceType && jobId) {
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
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        employer_id: employer.id,
        job_id: jobId || null,
        amount: amount / 100, // store in euros
        currency: "eur",
        status: "pending",
        listing_type: listingType || planType || packType || bundleType || serviceType || "unknown",
      })
      .select()
      .single();

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
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
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/employer/${jobId ? `jobs/${jobId}` : ""}`,
      metadata: {
        ...metadata,
        paymentId: payment.id,
      },
    });

    // Update payment with Stripe session ID
    await supabase
      .from("payments")
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