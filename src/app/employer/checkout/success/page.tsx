import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, PlusCircle, LayoutDashboard } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="mx-auto max-w-md p-8 text-center border-primary/20">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
          Payment Successful
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your job listing is now active and visible to job seekers.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/employer/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/employer/post-job" className="flex-1">
            <Button variant="primary" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post Another
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
