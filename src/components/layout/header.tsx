import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Impjieg" className="h-7" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/jobs"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse Jobs
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/companies"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Companies
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/employer/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <form action={logout}>
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/employer/post-job">
                <Button variant="primary" size="sm">
                  Post a Job
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
