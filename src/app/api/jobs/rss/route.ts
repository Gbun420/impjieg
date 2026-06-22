import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/constants";
import type { JobWithEmployer } from "@/lib/supabase/types";
import { escapeXml } from "./escape";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const supabase = await createClient();
    const baseUrl = SITE.url;

    const { data: jobs, error } = await supabase
      .from("jobs")
      .select(`
        id,
        title,
        slug,
        description,
        location,
        sector,
        job_type,
        seniority,
        remote_type,
        salary_min,
        salary_max,
        skills,
        benefits,
        visa_friendly,
        is_featured,
        status,
        expires_at,
        application_email,
        application_url,
        views,
        applications_count,
        created_at,
        updated_at,
        employers (
          id,
          name,
          slug,
          logo_url,
          location,
          website,
          is_verified
        )
      `)
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const jobsList = ((jobs as JobWithEmployer[]) || []).map((job) => `
      <item>
        <title>${escapeXml(job.title)}</title>
        <description>${escapeXml(job.description)}</description>
        <link>${escapeXml(`${baseUrl}/jobs/${job.employers.slug}/${job.slug}`)}</link>
        <guid isPermaLink="false">impjieg-job-${escapeXml(job.id)}</guid>
        <pubDate>${new Date(job.created_at).toUTCString()}</pubDate>
        <category>${escapeXml(job.sector)}</category>
        <category>${escapeXml(job.job_type)}</category>
        ${job.salary_min ? `<salary>${escapeXml(`${job.salary_min}${job.salary_max ? `-${job.salary_max}` : ''}`)}</salary>` : ''}
        ${job.remote_type ? `<remote_type>${escapeXml(job.remote_type)}</remote_type>` : ''}
        ${job.visa_friendly ? '<visa_friendly>true</visa_friendly>' : ''}
        <source>${escapeXml(baseUrl)}</source>
      </item>
    `).join('');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${escapeXml(`${baseUrl}/jobs`)}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${jobsList}
  </channel>
</rss>`;

    return new Response(rssFeed, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error("Error generating jobs RSS feed:", error);
    return NextResponse.json(
      { error: "Failed to generate jobs RSS feed" },
      { status: 500 }
    );
  }
}
