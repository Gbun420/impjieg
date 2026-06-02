import { redirect } from "next/navigation";
import AdminLoginForm from "./admin-login-form";
import { hasValidAdminSession } from "@/lib/admin-session";

export default async function AdminLoginPage() {
  if (await hasValidAdminSession()) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden rounded-[2rem] border border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(247,244,255,0.8))] p-8 shadow-sm lg:block">
          <div className="flex h-full flex-col justify-between gap-8">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
                Internal only
              </p>
              <h2 className="mt-4 max-w-lg text-4xl font-bold tracking-tight text-foreground">
                Monitor jobs, employers, applications, and payments from one place.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                The admin console is designed for quick operational checks: live inventory, account health, payment activity, and the newest platform events.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Real-time counts", "Jobs, employers, alerts, and payments"],
                ["Fast triage", "See what needs attention at a glance"],
                ["Secure access", "Locked behind the internal admin token"],
                ["Production first", "Uses live data from the deployed project"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  );
}
