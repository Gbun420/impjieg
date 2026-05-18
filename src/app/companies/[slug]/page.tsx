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
import type { Employer, JobWithEmployer } from "@/lib/supabase/types";

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

  const emp = employer as Employer | null;

  if (!emp) {
    return { title: "Company Not Found" };
  }

  return {
    title: emp.name,
    description: emp.description || `View open roles at ${emp.name}`,
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

  const emp = employer as Employer | null;

  if (!emp) {
    notFound();
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, employers(id, name, slug, logo_url, location)")
    .eq("employer_id", emp.id)
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  const typedJobs = (jobs || []) as unknown as JobWithEmployer[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/companies"
        className="group mb-8 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to companies
      </Link>

      <Card className="p-6 sm:p-8 border-primary/20">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-muted/50">
            {emp.logo_url ? (
              <img
                src={emp.logo_url}
                alt={emp.name}
                className="h-10 w-10 rounded-xl object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {emp.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {emp.name}
            </h1>
            {emp.description && (
              <p className="mt-2 text-muted-foreground leading-relaxed">
                {emp.description}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {emp.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {emp.location}
                </span>
              )}
              {emp.company_size && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {emp.company_size}
                </span>
              )}
              {emp.industry && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {emp.industry}
                </span>
              )}
              {emp.website && (
                <a
                  href={emp.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-10">
        <h2 className="mb-5 text-xl font-bold tracking-tight text-foreground">
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
