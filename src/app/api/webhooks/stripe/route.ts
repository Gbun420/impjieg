import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder"
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const metadata = session.metadata || {};
      const { paymentId, jobId, listingType } = metadata;

      if (paymentId) {
        await supabase
          .from("payments")
          .update({
            status: "completed",
            stripe_payment_intent_id: session.payment_intent,
            stripe_checkout_session_id: session.id,
          })
          .eq("id", paymentId);
      }

      if (listingType === "featured" && jobId) {
        await supabase
          .from("jobs")
          .update({ status: "active", is_featured: true })
          .eq("id", jobId);
      }

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as any;
      const metadata = session.metadata || {};
      const { paymentId } = metadata;

      if (paymentId) {
        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("id", paymentId);
      }

      break;
    }
  }

  return NextResponse.json({ received: true });
}
