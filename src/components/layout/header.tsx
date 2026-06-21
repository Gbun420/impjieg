"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { logout } from "@/lib/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useHydrated } from "@/hooks/use-hydrated";
import { Menu, X, Sun, Moon, LogOut, LayoutDashboard, Briefcase, Building2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { ImpjiegLogo } from "@/components/brand";

const navLinks = [
  { label: "Find jobs", href: "/jobs", icon: Briefcase },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Hire talent", href: "/pricing" },
];

export default function Header({
  initialAuthState,
}: {
  initialAuthState?: {
    isLoggedIn: boolean;
    isEmployer: boolean;
  };
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(initialAuthState?.isLoggedIn ?? false);
  const [isEmployer, setIsEmployer] = useState(initialAuthState?.isEmployer ?? false);
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
          <ImpjiegLogo compact />

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden border-border/60 bg-muted/70 text-foreground md:inline-flex">
              Admin console
            </Badge>

            {hydrated ? (
              <button
                onClick={toggleTheme}
                className="hidden h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:bg-muted md:flex"
                aria-label="Toggle theme"
                aria-pressed={theme === "dark"}
                data-testid="theme-toggle"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="hidden h-9 w-9 md:flex" aria-hidden="true" data-testid="theme-toggle-placeholder" />
            )}

            <Button asChild variant="outline" size="sm">
              <Link href="/">
                Open public site
              </Link>
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <ImpjiegLogo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-primary transition-all group-hover:w-full group-hover:left-0" aria-hidden="true" />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {hydrated ? (
            <button
              onClick={toggleTheme}
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-surface/70 text-muted-foreground transition-all hover:bg-surface hover:border-border hover:text-foreground"
              aria-label="Toggle theme"
              aria-pressed={theme === "dark"}
              data-testid="theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="h-4.5 w-4.5" />
              ) : (
                <Moon className="h-4.5 w-4.5" />
              )}
            </button>
          ) : (
            <span className="hidden md:flex h-9 w-9" aria-hidden="true" data-testid="theme-toggle-placeholder" />
          )}

          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Button asChild variant="ghost" size="sm" className="gap-2">
                  <Link href={isEmployer ? "/employer/dashboard" : "/candidate/dashboard"}>
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span>Dashboard</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button asChild variant="primary" size="sm" className="gap-2">
                  <Link href="/employer/post-job">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>Post a role</span>
                  </Link>
                </Button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
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
          <nav id="mobile-navigation" aria-label="Mobile navigation" className="mx-auto max-w-6xl px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {Icon && <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="pt-3 mt-3 border-t border-border space-y-2">
              {hydrated ? (
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-5 w-5 shrink-0" /> Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5 shrink-0" /> Dark Mode
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
                    <Button variant="ghost" size="md" className="w-full justify-start gap-3">
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full justify-start gap-3"
                    onClick={async () => {
                      await handleLogout();
                      setMobileOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
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
                      Sign in
                    </Button>
                  </Link>
                  <Link
                    href="/employer/post-job"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button variant="primary" size="md" className="w-full justify-start gap-3">
                      <Briefcase className="h-5 w-5" />
                      Post a role
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