import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type JobAlertUpdate = Database["public"]["Tables"]["job_alerts"]["Update"];
type JobAlertsUpdateTable = {
  update(values: JobAlertUpdate): {
    eq(column: "id", value: string): {
      eq(column: "email", value: string): Promise<{
        error: { message: string } | null;
      }>;
    };
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const email = searchParams.get("email");

  if (!id || !email) {
    return new Response("<h1>Invalid unsubscribe link</h1>", {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const supabase = createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const jobAlertsTable = supabase.from("job_alerts") as unknown as JobAlertsUpdateTable;

  const { error } = await jobAlertsTable
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("email", email);

  if (error) {
    return new Response("<h1>Unable to unsubscribe alert</h1>", {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new Response(
    "<h1>Job alert unsubscribed</h1><p>You will no longer receive emails for this alert.</p>",
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}
