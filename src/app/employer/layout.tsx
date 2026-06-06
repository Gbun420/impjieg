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
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <nav className="border-b border-border/50 bg-muted/20 px-4 py-4 lg:hidden">
        <PortalNavGroups
          groups={employerPortalNavGroups}
          className="grid gap-3 md:grid-cols-2"
          buttonClassName="justify-start"
        />
      </nav>

      <aside className="hidden w-72 border-r border-border/50 bg-muted/20 lg:block">
        <div className="p-4">
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
