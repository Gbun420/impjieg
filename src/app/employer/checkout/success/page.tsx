import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, PlusCircle, LayoutDashboard, AlertCircle } from "lucide-react";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  let verified = false;

  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      verified = session.status === "complete" && session.payment_status === "paid";
    } catch (error) {
      console.error("Failed to verify checkout session:", error);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="mx-auto max-w-md border-primary/20 p-8 text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
            verified ? "bg-success/10" : "bg-warning/10"
          }`}
        >
          {verified ? (
            <CheckCircle2 className="h-10 w-10 text-success" />
          ) : (
            <AlertCircle className="h-10 w-10 text-warning" />
          )}
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
          {verified ? "Payment Successful" : "Payment pending verification"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {verified
            ? "Your job listing is now active and visible to job seekers."
            : "We couldn't verify this checkout session yet. Return to your dashboard to confirm the listing status."}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/employer/dashboard" className="flex-1">
            <Button variant={verified ? "outline" : "primary"} className="w-full">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/employer/post-job" className="flex-1">
            <Button variant={verified ? "primary" : "outline"} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post Another
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
