import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_URL || "https://impjieg.com";

  const staticPages = [
    "",
    "/jobs",
    "/companies",
    "/pricing",
    "/about",
    "/contact",
    "/salary-calculator",
    "/alerts",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  let jobPages: MetadataRoute.Sitemap = [];
  let companyPages: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createClient();

    const { data: jobs } = await supabase
      .from("jobs")
      .select("slug, employers(slug)")
      .eq("status", "active")
      .limit(1000);

    if (jobs) {
      jobPages = jobs.map((job: any) => ({
        url: `${baseUrl}/jobs/${job.employers?.slug}/${job.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.6,
      }));
    }

    const { data: companies } = await supabase
      .from("employers")
      .select("slug")
      .limit(500);

    if (companies) {
      companyPages = companies.map((company: any) => ({
        url: `${baseUrl}/companies/${company.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));
    }
  } catch {
    // If Supabase is not configured yet, return static pages only
  }

  return [...staticPages, ...jobPages, ...companyPages];
}
