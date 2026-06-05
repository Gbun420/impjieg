import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import { requireEnv } from "@/lib/runtime-env";
import type Stripe from "stripe";

function getSupabaseAdmin() {
  return createClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      requireEnv("STRIPE_WEBHOOK_SECRET")
    );
  } catch {
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};
      const { paymentId, jobId, listingType, serviceType, applicationId, employerId } = metadata;

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

      if (serviceType && applicationId && employerId) {
        const { data: existingService } = await supabase
          .from("screening_services")
          .select("id, status")
          .eq("application_id", applicationId)
          .eq("service_type", serviceType)
          .in("status", ["pending", "completed"])
          .maybeSingle();

        if (existingService) {
          await supabase
            .from("screening_services")
            .update({ status: "pending" })
            .eq("id", existingService.id);
        } else {
          await supabase
            .from("screening_services")
            .insert([
              {
                employer_id: employerId,
                application_id: applicationId,
                service_type: serviceType,
                status: "pending",
                result: null,
                purchased_at: session.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString(),
                completed_at: null,
              },
            ]);
        }
      }

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};
      const { paymentId, serviceType, applicationId } = metadata;

      if (paymentId) {
        await supabase
          .from("payments")
          .update({ status: "expired" })
          .eq("id", paymentId);
      }

      if (serviceType && applicationId) {
        const { data: existingService } = await supabase
          .from("screening_services")
          .select("id")
          .eq("application_id", applicationId)
          .eq("service_type", serviceType)
          .eq("status", "pending")
          .maybeSingle();

        if (existingService) {
          await supabase
            .from("screening_services")
            .update({ status: "failed" })
            .eq("id", existingService.id);
        }
      }

      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const metadata = intent.metadata || {};
      const { paymentId, jobId, serviceType, applicationId } = metadata;

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

      if (serviceType && applicationId) {
        const { data: existingService } = await supabase
          .from("screening_services")
          .select("id")
          .eq("application_id", applicationId)
          .eq("service_type", serviceType)
          .eq("status", "pending")
          .maybeSingle();

        if (existingService) {
          await supabase
            .from("screening_services")
            .update({ status: "failed" })
            .eq("id", existingService.id);
        }
      }

      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
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
