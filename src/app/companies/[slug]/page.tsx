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
  Briefcase,
  ShieldCheck,
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
    title: `${emp.name} - Jobs & Company Profile | Impjieg`,
    description: emp.description || `View open roles at ${emp.name} on Impjieg Malta's job board.`,
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

      <Card className="overflow-hidden border-primary/20">
        {emp.cover_image_url && (
          <div className="h-40 w-full overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20 sm:h-48">
            <img
              src={emp.cover_image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-5">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
              emp.cover_image_url
                ? "-mt-12 border-4 border-background bg-background shadow-lg"
                : "bg-muted/50"
            }`}>
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
              {emp.is_verified && (
                <ShieldCheck className="h-5 w-5 text-success" />
              )}
              {emp.description && (
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {emp.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {emp.location && (
              <span className="flex items-center gap-1.5 rounded-lg bg-muted/30 px-3 py-1.5">
                <MapPin className="h-4 w-4" />
                {emp.location}
              </span>
            )}
            {emp.company_size && (
              <span className="flex items-center gap-1.5 rounded-lg bg-muted/30 px-3 py-1.5">
                <Users className="h-4 w-4" />
                {emp.company_size} employees
              </span>
            )}
            {emp.industry && (
              <span className="flex items-center gap-1.5 rounded-lg bg-muted/30 px-3 py-1.5">
                <Building2 className="h-4 w-4" />
                {emp.industry}
              </span>
            )}
            {emp.website && (
              <a
                href={emp.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/20 transition-colors"
              >
                <Globe className="h-4 w-4" />
                Visit Website
              </a>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Open Roles
          </h2>
          <Badge variant="secondary">{typedJobs.length}</Badge>
        </div>
        {typedJobs.length === 0 ? (
          <Card className="mt-5 p-8 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">
              No open roles at this company right now.
            </p>
          </Card>
        ) : (
          <div className="mt-5 space-y-3">
            {typedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
