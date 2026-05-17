import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Globe,
  Users,
  Building2,
  ArrowLeft,
} from "lucide-react";
import JobCard from "@/components/jobs/job-card";
import type { JobWithEmployer } from "@/lib/supabase/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: employer } = await supabase
    .from("employers")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!employer) {
    return { title: "Company Not Found" };
  }

  return {
    title: employer.name,
    description: employer.description || `View open roles at ${employer.name}`,
  };
}

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: employer } = await supabase
    .from("employers")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!employer) {
    notFound();
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, employers(id, name, slug, logo_url, location)")
    .eq("employer_id", employer.id)
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  const typedJobs = (jobs || []) as unknown as JobWithEmployer[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/companies"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to companies
      </Link>

      <Card className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted">
            {employer.logo_url ? (
              <img
                src={employer.logo_url}
                alt={employer.name}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {employer.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {employer.name}
            </h1>
            {employer.description && (
              <p className="mt-2 text-muted-foreground">
                {employer.description}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {employer.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {employer.location}
                </span>
              )}
              {employer.company_size && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {employer.company_size}
                </span>
              )}
              {employer.industry && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {employer.industry}
                </span>
              )}
              {employer.website && (
                <a
                  href={employer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-secondary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-foreground">
          Open Roles ({typedJobs.length})
        </h2>
        {typedJobs.length === 0 ? (
          <p className="text-muted-foreground">
            No open roles at this company.
          </p>
        ) : (
          <div className="space-y-3">
            {typedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
