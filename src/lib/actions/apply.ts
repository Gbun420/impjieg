"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function submitApplication(formData: FormData) {
  const supabase = await createClient();

  const jobId = formData.get("jobId") as string;
  const employerId = formData.get("employerId") as string;
  const candidateName = formData.get("candidateName") as string;
  const candidateEmail = formData.get("candidateEmail") as string;
  const candidatePhone = formData.get("candidatePhone") as string;
  const coverLetter = formData.get("coverLetter") as string;
  const cvUrl = formData.get("cvUrl") as string;

  if (!jobId || !employerId || !candidateName || !candidateEmail) {
    return { error: "Please fill in all required fields" };
  }

  const { data: application, error } = await supabase
    .from("applications")
    .insert({
      job_id: jobId,
      employer_id: employerId,
      candidate_name: candidateName,
      candidate_email: candidateEmail,
      candidate_phone: candidatePhone || null,
      candidate_cv_url: cvUrl || null,
      cover_letter: coverLetter || null,
      status: "new",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Track application for logged-in candidates
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await serviceSupabase.from("candidate_applications").insert({
      user_id: user.id,
      job_id: jobId,
      application_id: application.id,
      status: "applied",
    });
  }

  // Increment job applications count
  const { data: currentJob } = await supabase
    .from("jobs")
    .select("applications_count")
    .eq("id", jobId)
    .single();

  await supabase
    .from("jobs")
    .update({ applications_count: (currentJob as any)?.applications_count + 1 || 1 })
    .eq("id", jobId);

  // Get employer info for notification
  const { data: employer } = await supabase
    .from("employers")
    .select("name, whatsapp_notifications, whatsapp_number, email_notifications")
    .eq("id", employerId)
    .single();

  // Get job title for notification
  const { data: job } = await supabase
    .from("jobs")
    .select("title")
    .eq("id", jobId)
    .single();

  const jobTitleStr = (job as any)?.title || "a position";

  // Send email notification to employer
  if (employer && (employer as any).email_notifications !== false) {
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Impjieg <notifications@impjieg.com>",
            to: [candidateEmail],
            bcc: [(employer as any).email || "hello@impjieg.com"],
            subject: `New Application: ${candidateName} applied for ${jobTitleStr}`,
            html: `
              <h2>New Application Received</h2>
              <p><strong>Candidate:</strong> ${candidateName}</p>
              <p><strong>Email:</strong> ${candidateEmail}</p>
              ${candidatePhone ? `<p><strong>Phone:</strong> ${candidatePhone}</p>` : ""}
              <p><strong>Job:</strong> ${jobTitleStr}</p>
              ${coverLetter ? `<h3>Cover Letter</h3><p>${coverLetter.replace(/\n/g, "<br>")}</p>` : ""}
              ${cvUrl ? `<p><a href="${cvUrl}">View CV</a></p>` : ""}
              <hr>
              <p><a href="${process.env.NEXT_PUBLIC_URL}/employer/applications">View in Dashboard</a></p>
            `,
          }),
        });
      }
    } catch {
      // Silently fail email notification
    }
  }

  // Send WhatsApp notification if enabled
  if (employer && (employer as any).whatsapp_notifications && (employer as any).whatsapp_number) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL || "https://impjieg.vercel.app"}/api/notifications/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          candidateName,
          jobTitle: jobTitleStr,
          employerPhone: (employer as any).whatsapp_number,
        }),
      });
    } catch {
      // Silently fail notification
    }
  }

  revalidatePath(`/jobs/[employerSlug]/[jobSlug]`);
  return { success: true };
}
