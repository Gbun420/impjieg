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
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden w-64 border-r border-border bg-card lg:block">
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
