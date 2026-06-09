import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { TALENT_DIRECTORY_ENABLED } from "@/lib/talent-directory/constants";
import { notFound } from "next/navigation";
import { ContactRequestsList } from "@/components/talent-directory/candidate/contact-requests-list";

export const metadata: Metadata = {
  title: "Contact Requests — Candidate",
  description: "View and respond to employer contact requests.",
};

export const dynamic = "force-dynamic";

export default async function CandidateContactRequestsPage() {
  if (!TALENT_DIRECTORY_ENABLED) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/candidate/contact-requests");
  }

  const { data: requests } = await supabase
    .from("candidate_contact_requests")
    .select("*, employer:employers(id, name, slug, logo_url, location)")
    .eq("candidate_user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Contact Requests
        </h1>
        <p className="text-sm text-muted-foreground">
          View and respond to employer contact requests
        </p>
      </div>

      <ContactRequestsList requests={requests ?? []} />
    </div>
  );
}
