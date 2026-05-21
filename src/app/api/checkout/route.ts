import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PRICING } from "@/lib/constants";
import type { Database, Employer, Payment } from "@/lib/supabase/types";

type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
type PaymentsMutationTable = {
  insert(
    values: PaymentInsert[]
  ): {
    select(): {
      single(): Promise<{
        data: Payment | null;
        error: { message: string } | null;
      }>;
    };
  };
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const serviceSupabase = createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: employerData } = await supabase
    .from("employers")
    .select("id, name")
    .eq("user_id", user.id)
    .single();

  const employer = employerData as Pick<Employer, "id" | "name"> | null;

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

  const paymentsTable = serviceSupabase.from(
    "payments"
  ) as unknown as PaymentsMutationTable;

  const { data: payment } = await paymentsTable
    .insert([
      {
        employer_id: employer.id,
        job_id: jobId,
        amount: pricing.price,
        currency: "eur",
        status: "pending",
        listing_type: listingType,
      },
    ])
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
    success_url: `${process.env.NEXT_PUBLIC_URL || "https://impjieg.vercel.app"}/employer/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL || "https://impjieg.vercel.app"}/employer/post-job`,
    metadata: {
      paymentId: payment.id,
      jobId,
      listingType,
      employerId: employer.id,
    },
  });

  return NextResponse.json({ url: session.url });
}
