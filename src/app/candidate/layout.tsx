import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { CandidatePortalShell } from "@/components/candidate/candidate-portal-shell";

export const dynamic = "force-dynamic";

export default async function CandidateLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/candidate/dashboard");
  }

  return <CandidatePortalShell>{children}</CandidatePortalShell>;
}
