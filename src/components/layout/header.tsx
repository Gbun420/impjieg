"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { logout } from "@/lib/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useHydrated } from "@/hooks/use-hydrated";
import { Menu, X, Sun, Moon, LogOut, LayoutDashboard } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { SITE } from "@/lib/constants";

const navLinks = [
  { label: "Jobs", href: "/jobs" },
  { label: "Companies", href: "/companies" },
  { label: "Pricing", href: "/pricing" },
];

export default function Header({
  initialAuthState,
}: {
  initialAuthState: {
    isLoggedIn: boolean;
    isEmployer: boolean;
  };
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(initialAuthState.isLoggedIn);
  const [isEmployer, setIsEmployer] = useState(initialAuthState.isEmployer);
  const { theme, toggleTheme } = useTheme();
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    if (!hasSupabasePublicEnv()) {
      return;
    }

    const supabase = createClient();

    const syncEmployerState = async (userId: string) => {
      const { data: employer } = await supabase
        .from("employers")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      setIsEmployer(Boolean(employer));
    };

    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);

        if (user) {
          await syncEmployerState(user.id);
        }
      } catch {
        setIsLoggedIn(false);
        setIsEmployer(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        setIsEmployer(false);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setIsLoggedIn(!!session?.user);
        if (session?.user) {
          syncEmployerState(session.user.id).catch(() => setIsEmployer(false));
        }
      } else if (event === "INITIAL_SESSION") {
        setIsLoggedIn(!!session?.user);
        if (session?.user) {
          syncEmployerState(session.user.id).catch(() => setIsEmployer(false));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await logout();
    setIsLoggedIn(false);
    router.push("/");
    router.refresh();
  }

  if (isAdminRoute) {
    return (
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group inline-flex items-center gap-3" aria-label="Impjieg Homepage">
            <img src="/logo-icon.svg" alt="" className="h-8 w-8 shrink-0" aria-hidden="true" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[1.05rem] font-semibold tracking-[-0.03em] text-foreground">
                {SITE.name}
              </span>
              <span className="text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground">
                {SITE.tagline}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden border-border/60 bg-muted/70 text-foreground md:inline-flex">
              Admin console
            </Badge>

            {hydrated ? (
              <button
                onClick={toggleTheme}
                className="hidden h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:bg-muted md:flex"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            ) : null}

            <Link href="/">
              <Button variant="outline" size="sm">
                Open public site
              </Button>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-3" aria-label="Impjieg Homepage">
          <img src="/logo-icon.svg" alt="" className="h-8 w-8 shrink-0" aria-hidden="true" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[1.05rem] font-semibold tracking-[-0.03em] text-foreground">
              {SITE.name}
            </span>
            <span className="text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground">
              {SITE.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {hydrated ? (
            <button
              onClick={toggleTheme}
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span
              className="hidden md:flex h-8 w-8"
              aria-hidden="true"
            />
          )}

          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link href={isEmployer ? "/employer/dashboard" : "/candidate/dashboard"}>
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm">Post a Job</Button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="mx-auto max-w-6xl px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-border space-y-1">
              {hydrated ? (
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-4 w-4" /> Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" /> Dark Mode
                    </>
                  )}
                </button>
              ) : null}
              {isLoggedIn ? (
                <>
                  <Link
                    href={isEmployer ? "/employer/dashboard" : "/candidate/dashboard"}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button variant="ghost" size="md" className="w-full justify-start">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full justify-start"
                    onClick={async () => {
                      await handleLogout();
                      setMobileOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button variant="ghost" size="md" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button variant="primary" size="md" className="w-full justify-start">
                      Post a Job
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
