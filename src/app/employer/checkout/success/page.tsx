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
  let serviceLabel: string | null = null;
  let isScreeningOrder = false;

  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      verified = session.status === "complete" && session.payment_status === "paid";
      const metadata = session.metadata || {};
      if (metadata.serviceType) {
        isScreeningOrder = true;
        serviceLabel = metadata.serviceLabel || "Screening order";
      }
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
          {isScreeningOrder
            ? verified
              ? "Screening order confirmed"
              : "Screening order pending verification"
            : verified
              ? "Payment Successful"
              : "Payment pending verification"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isScreeningOrder
            ? verified
              ? `${serviceLabel} is now attached to the application and will appear in your pipeline.`
              : "We couldn't verify this screening checkout yet. Return to your applications to confirm the order status."
            : verified
              ? "Your job listing is now active and visible to job seekers."
              : "We couldn't verify this checkout session yet. Return to your dashboard to confirm the listing status."}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={isScreeningOrder ? "/employer/applications" : "/employer/dashboard"} className="flex-1">
            <Button variant={verified ? "outline" : "primary"} className="w-full">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {isScreeningOrder ? "Applications" : "Dashboard"}
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
