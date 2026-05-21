"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Menu, X, Sun, Moon, LogOut, LayoutDashboard, User } from "lucide-react";
import { useRouter } from "next/navigation";

const navLinks = [
  { label: "Browse Jobs", href: "/jobs" },
  { label: "Companies", href: "/companies" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
  { label: "Saved", href: "/saved-jobs" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEmployer, setIsEmployer] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);

        if (user) {
          const { data: employer } = await supabase
            .from("employers")
            .select("id")
            .eq("user_id", user.id)
            .single();
          setIsEmployer(!!employer);
        }
      } catch {
        setIsLoggedIn(false);
        setIsEmployer(false);
      } finally {
        setIsChecking(false);
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
          supabase
            .from("employers")
            .select("id")
            .eq("user_id", session.user.id)
            .single()
            .then(({ data }) => setIsEmployer(!!data));
        }
      } else if (event === "INITIAL_SESSION") {
        setIsLoggedIn(!!session?.user);
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

  if (isChecking) {
    return (
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Impjieg" className="h-7 dark:invert" />
          </Link>
          <div className="h-9 w-20 rounded-xl bg-muted/50 animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Impjieg" className="h-7 dark:invert" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/50 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link href={isEmployer ? "/employer/dashboard" : "/candidate/dashboard"}>
                  <Button variant="ghost" size="sm">
                    {isEmployer ? (
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                    ) : (
                      <User className="mr-2 h-4 w-4" />
                    )}
                    {isEmployer ? "Dashboard" : "My Jobs"}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/employer/post-job">
                  <Button variant="primary" size="sm">Post a Job</Button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/50 transition-colors"
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
        <div className="md:hidden border-t border-border/50 bg-background animate-fade-in">
          <nav className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border/50 space-y-2">
              <button
                onClick={() => {
                  toggleTheme();
                  setMobileOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
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
              {isLoggedIn ? (
                <>
                  <Link
                    href={isEmployer ? "/employer/dashboard" : "/candidate/dashboard"}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button variant="ghost" size="md" className="w-full">
                      {isEmployer ? (
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                      ) : (
                        <User className="mr-2 h-4 w-4" />
                      )}
                      {isEmployer ? "Dashboard" : "My Jobs"}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full"
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
                    <Button variant="ghost" size="md" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/employer/post-job"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button variant="primary" size="md" className="w-full">
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
