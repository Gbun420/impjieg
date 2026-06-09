import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { TALENT_DIRECTORY_ENABLED } from "@/lib/talent-directory/constants";
import { notFound } from "next/navigation";
import { TalentSearch } from "@/components/talent-directory/employer/talent-search";
import { TalentAccessGate } from "@/components/talent-directory/employer/talent-access-gate";
import { getEmployerTalentAccess, hasActiveTalentAccess, getCreditBalance } from "@/lib/talent-directory/access";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, CreditCard, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Talent Directory — Employer",
  description: "Search Malta's opt-in talent pool.",
};

export const dynamic = "force-dynamic";

export default async function EmployerTalentPage() {
  if (!TALENT_DIRECTORY_ENABLED) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/employer/talent");
  }

  const { data: employer } = await supabase
    .from("employers")
    .select("id, name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!employer) {
    redirect("/employer/dashboard");
  }

  const access = await getEmployerTalentAccess(employer.id);
  const isActive = hasActiveTalentAccess(access);
  const balance = getCreditBalance(access);

  if (!isActive) {
    return <TalentAccessGate employerId={employer.id} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Talent Directory
          </h1>
          <p className="text-sm text-muted-foreground">
            Search candidates who have chosen to be discoverable
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            <CreditCard className="mr-1 h-3.5 w-3.5" />
            {balance?.remaining ?? 0} credits remaining
          </Badge>
          <Button asChild variant="outline" size="sm">
            <Link href="/employer/talent/requests">
              <Clock className="mr-1 h-4 w-4" />
              Requests
            </Link>
          </Button>
        </div>
      </div>

      <TalentSearch employerId={employer.id} />
    </div>
  );
}
