"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SITE } from "@/lib/constants";
import { stripe, PRICES } from "@/lib/stripe";
import type { Database, Employer, Payment } from "@/lib/supabase/types";

type EmployerRef = Pick<Employer, "id">;
type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
type PaymentsMutationTable = {
  insert(values: PaymentInsert[]): {
    select(): {
      single(): Promise<{
        data: Payment | null;
        error: { message: string } | null;
      }>;
    };
  };
};

export async function createCheckoutSession(
  jobId: string,
  listingType: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: employer } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  const typedEmployer = employer as EmployerRef | null;

  if (!typedEmployer) {
    return { error: "Employer profile not found" };
  }

  const amount = listingType === "featured" ? 5900 : 2900;

  const paymentsTable = supabase.from("payments") as unknown as PaymentsMutationTable;

  const { data: payment, error: paymentError } = await paymentsTable
    .insert([
      {
        employer_id: typedEmployer.id,
        job_id: jobId,
        amount,
        currency: "eur",
        status: "pending",
        listing_type: listingType,
      },
    ])
    .select()
    .single();

  if (paymentError) {
    return { error: paymentError.message };
  }

  if (!payment) {
    return { error: "Failed to create payment" };
  }

  const priceId =
    listingType === "featured" ? PRICES.featured : PRICES.standard;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${SITE.url}/employer/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE.url}/employer/post-job`,
    metadata: {
      jobId,
      employerId: typedEmployer.id,
      paymentId: payment.id,
      listingType,
    },
  });

  redirect(session.url!);
}
