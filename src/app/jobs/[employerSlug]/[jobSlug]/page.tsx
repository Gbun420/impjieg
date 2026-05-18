import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Briefcase,
  Clock,
  Banknote,
  Globe,
  ArrowLeft,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { formatSalary, formatDate, daysAgo } from "@/lib/utils";
import type { JobWithEmployer } from "@/lib/supabase/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ employerSlug: string; jobSlug: string }>;
}): Promise<Metadata> {
  const { employerSlug, jobSlug } = await params;
  const supabase = await createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("title, description, employers(name)")
    .eq("slug", jobSlug)
    .eq("status", "active")
    .single();

  if (!job) {
    return { title: "Job Not Found" };
  }

  return {
    title: `${job.title} at ${job.employers?.[0]?.name}`,
    description: job.description.substring(0, 160),
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ employerSlug: string; jobSlug: string }>;
}) {
  const { employerSlug, jobSlug } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("*, employers(id, name, slug, logo_url, location, website)")
    .eq("slug", jobSlug)
    .eq("status", "active")
    .single();

  if (!job) {
    notFound();
  }

  await supabase
    .from("jobs")
    .update({ views: (job as any).views + 1 })
    .eq("id", (job as any).id);

  const j = job as unknown as JobWithEmployer;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/jobs"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted">
          {j.employers.logo_url ? (
            <img
              src={j.employers.logo_url}
              alt={j.employers.name}
              className="h-10 w-10 rounded object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">
              {j.employers.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {j.title}
            </h1>
            {j.is_featured && <Badge variant="success">Featured</Badge>}
          </div>
          <Link
            href={`/companies/${j.employers.slug}`}
            className="mt-1 text-lg text-muted-foreground hover:text-secondary"
          >
            {j.employers.name}
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {j.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {j.job_type}
            </span>
            {j.remote_type && <Badge>{j.remote_type}</Badge>}
            {j.visa_friendly && <Badge variant="accent">Visa Friendly</Badge>}
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {j.views} views
            </span>
          </div>
        </div>
      </div>

      {(j.salary_min || j.salary_max) && (
        <Card className="mt-6 border-secondary/30 bg-secondary/[0.03]">
          <div className="p-6">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                Verified Salary
              </span>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-foreground">
              {formatSalary(j.salary_min ?? 0)}
              {j.salary_max
                ? ` - ${formatSalary(j.salary_max)}`
                : "+"}
              <span className="text-base font-normal text-muted-foreground">
                /year
              </span>
            </p>
          </div>
        </Card>
      )}

      <div className="mt-8 space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Job Description
          </h2>
          <div
            className="prose prose-sm mt-4 max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: j.description }}
          />
        </div>

        {j.skills && j.skills.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Skills & Requirements
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {j.skills.map((skill: string) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {j.benefits && j.benefits.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Benefits
            </h2>
            <ul className="mt-3 space-y-2">
              {j.benefits.map((benefit: string) => (
                <li
                  key={benefit}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Interested in this role?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Apply directly through the employer&apos;s preferred method.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {j.application_url && (
                <Link href={j.application_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="lg">
                    <Globe className="mr-2 h-4 w-4" />
                    Apply Now
                  </Button>
                </Link>
              )}
              {j.application_email && (
                <Link href={`mailto:${j.application_email}`}>
                  <Button variant="outline" size="lg">
                    Email Application
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
        Posted {formatDate(j.created_at)} &middot; {daysAgo(j.created_at)}
      </div>
    </div>
  );
}
