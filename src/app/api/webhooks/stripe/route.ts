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

      if (jobId) {
        const updates: Record<string, unknown> = { status: "active" };
        if (listingType === "featured") {
          updates.is_featured = true;
        }
        await supabase
          .from("jobs")
          .update(updates)
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
          .update({ status: "expired" })
          .eq("id", paymentId);
      }

      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as any;
      const metadata = intent.metadata || {};
      const { paymentId, jobId } = metadata;

      if (paymentId) {
        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("id", paymentId);
      }

      if (jobId) {
        await supabase
          .from("jobs")
          .update({ status: "draft" })
          .eq("id", jobId);
      }

      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as any;
      const paymentIntentId = charge.payment_intent;

      if (paymentIntentId) {
        const { data: payment } = await supabase
          .from("payments")
          .select("id, job_id")
          .eq("stripe_payment_intent_id", paymentIntentId)
          .single();

        if (payment) {
          await supabase
            .from("payments")
            .update({ status: "refunded" })
            .eq("id", payment.id);

          if (payment.job_id) {
            await supabase
              .from("jobs")
              .update({ status: "draft" })
              .eq("id", payment.job_id);
          }
        }
      }

      break;
    }
  }

  return NextResponse.json({ received: true });
}
