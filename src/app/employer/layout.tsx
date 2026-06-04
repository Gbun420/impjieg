import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Inbox,
  Settings,
} from "lucide-react";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/employer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employer/jobs", label: "My Jobs", icon: Briefcase },
  { href: "/employer/post-job", label: "Post a Job", icon: PlusCircle },
  { href: "/employer/applications", label: "Applications", icon: Inbox },
  { href: "/employer/settings", label: "Settings", icon: Settings },
];

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
      <nav className="border-b border-border/50 bg-muted/20 lg:hidden">
        <div className="flex gap-2 overflow-x-auto px-4 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium whitespace-nowrap text-foreground transition-all hover:bg-muted/60 hover:border-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <item.icon className="mr-1.5 h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <aside className="hidden w-64 border-r border-border/50 bg-muted/20 lg:block">
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-4 lg:p-8">{children}</main>
    </div>
  );
}
