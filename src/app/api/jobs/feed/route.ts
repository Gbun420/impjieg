import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { JobWithEmployer } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Fetch active jobs with employer information
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

    // Transform to a more consumable format for external platforms
    const feedJobs = (jobs as JobWithEmployer[] || []).map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      url: `${process.env.NEXT_PUBLIC_URL}/jobs/${job.employers.slug}/${job.slug}`,
      location: job.location,
      sector: job.sector,
      job_type: job.job_type,
      seniority: job.seniority,
      remote_type: job.remote_type,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      skills: job.skills,
      benefits: job.benefits,
      visa_friendly: job.visa_friendly,
      is_featured: job.is_featured,
      posted_at: job.created_at,
      expires_at: job.expires_at,
      employer: {
        id: job.employers.id,
        name: job.employers.name,
        url: `${process.env.NEXT_PUBLIC_URL}/companies/${job.employers.slug}`,
        logo: job.employers.logo_url,
        location: job.employers.location,
        website: job.employers.website,
        verified: job.employers.is_verified
      },
      // Application information
      how_to_apply: job.application_url || job.application_email || "Apply through the application button on the job page",
      // Additional metadata for job boards
      source: "impjieg",
      language: "en"
    }));

    // Return as JSON
    return NextResponse.json(feedJobs);
  } catch (error) {
    console.error("Error generating jobs feed:", error);
    return NextResponse.json(
      { error: "Failed to generate jobs feed" },
      { status: 500 }
    );
  }
}