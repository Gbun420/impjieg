import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PRICING } from "@/lib/constants";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: employer } = await supabase
    .from("employers")
    .select("id, name")
    .eq("user_id", user.id)
    .single();

  if (!employer) {
    return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
  }

  const body = await request.json();
  const { jobId, listingType } = body;

  if (!jobId || !listingType) {
    return NextResponse.json({ error: "Missing jobId or listingType" }, { status: 400 });
  }

  const pricing = PRICING[listingType as keyof typeof PRICING];
  if (!pricing) {
    return NextResponse.json({ error: "Invalid listing type" }, { status: 400 });
  }

  const { data: payment } = await supabase
    .from("payments")
    .insert({
      employer_id: employer.id,
      job_id: jobId,
      amount: pricing.price,
      currency: "eur",
      status: "pending",
      listing_type: listingType,
    })
    .select()
    .single();

  if (!payment) {
    return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${pricing.label} Job Listing`,
            description: pricing.description,
          },
          unit_amount: pricing.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_URL || "https://impjieg.com"}/employer/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL || "https://impjieg.com"}/employer/post-job`,
    metadata: {
      paymentId: payment.id,
      jobId,
      listingType,
      employerId: employer.id,
    },
  });

  return NextResponse.json({ url: session.url });
}
