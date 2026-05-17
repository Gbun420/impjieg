import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

  const supabase = await createClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const { paymentId, jobId, listingType } = session.metadata;

      await supabase
        .from("payments")
        .update({
          status: "completed",
          stripe_payment_intent_id: session.payment_intent,
          stripe_checkout_session_id: session.id,
        })
        .eq("id", paymentId);

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
      const { paymentId } = session.metadata;

      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("id", paymentId);

      break;
    }
  }

  return NextResponse.json({ received: true });
}
