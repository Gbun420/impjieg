import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SECTORS, LOCATIONS, SITE } from "@/lib/constants";
import { getAllPosts } from "@/lib/blog/posts";
import { isJobPubliclyLive } from "@/lib/job-visibility";
import type { Employer } from "@/lib/supabase/types";

type SitemapJobRef = {
  slug: string;
  status: string;
  expires_at: string | null;
  employers: { slug: string } | null;
};

function labelToSlug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE.url;

    const staticPages = [
      "",
      "/jobs",
      "/companies",
      "/pricing",
      "/employer-growth",
      "/about",
      "/contact",
      "/salary-calculator",
      "/blog",
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: route === "" ? 1 : 0.8,
    }));

  const seoSectorPages = SECTORS.map((sector) => ({
    url: `${baseUrl}/jobs/sector/${labelToSlug(sector)}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const seoLocationPages = SECTORS.flatMap((sector) =>
    LOCATIONS.map((location) => ({
      url: `${baseUrl}/jobs/sector/${labelToSlug(sector)}/location/${labelToSlug(location)}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    }))
  );

  let jobPages: MetadataRoute.Sitemap = [];
  let companyPages: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createClient();

    const { data: jobs } = await supabase
      .from("jobs")
      .select("slug, status, expires_at, employers(slug)")
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .limit(1000);

    if (jobs) {
      jobPages = (jobs as SitemapJobRef[])
        .filter((job) => job.employers?.slug && isJobPubliclyLive(job))
        .map((job) => ({
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
      companyPages = (companies as Pick<Employer, "slug">[]).map((company) => ({
        url: `${baseUrl}/companies/${company.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));
    }
  } catch {
    // If Supabase is not configured yet, return static pages only
  }

  const blogPages: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...seoSectorPages, ...seoLocationPages, ...blogPages, ...jobPages, ...companyPages];
}
