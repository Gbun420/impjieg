import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PortalNavGroups } from "@/components/portal/portal-nav-groups";
import { employerPortalNavGroups } from "@/lib/portal-navigation";

export const dynamic = "force-dynamic";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/employer/dashboard");
  }

  const { data: employer } = await supabase
    .from("employers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!employer) {
    redirect("/auth/signup");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-[linear-gradient(180deg,rgba(245,248,252,0.96),rgba(247,244,236,0.34))] lg:flex-row">
      <nav className="border-b border-border/50 bg-surface/80 px-4 py-4 backdrop-blur lg:hidden">
        <div className="mb-4 rounded-[1.5rem] bg-[#08111F] p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#46D1BE]">Employer cockpit</p>
          <h1 className="mt-2 text-xl font-semibold tracking-[-0.04em]">Run your Malta hiring pipeline</h1>
        </div>
        <PortalNavGroups
          groups={employerPortalNavGroups}
          className="grid gap-3 md:grid-cols-2"
          buttonClassName="justify-start"
        />
      </nav>

      <aside className="hidden w-80 border-r border-border/50 bg-surface/80 backdrop-blur lg:block">
        <div className="space-y-4 p-4">
          <div className="rounded-[1.5rem] bg-[#08111F] p-5 text-white shadow-[0_18px_55px_rgba(11,18,32,0.16)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#46D1BE]">Employer cockpit</p>
            <h1 className="mt-2 text-xl font-semibold tracking-[-0.04em]">Run your Malta hiring pipeline</h1>
            <p className="mt-2 text-sm leading-6 text-white/64">
              Listings, applicants, visibility, and account controls in one commercial workspace.
            </p>
          </div>
          <PortalNavGroups
            groups={employerPortalNavGroups}
            className="grid gap-3"
            buttonClassName="w-full justify-start"
          />
        </div>
      </aside>
      <main className="flex-1 p-4 lg:p-8">{children}</main>
    </div>
  );
}
