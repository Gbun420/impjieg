import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-primary/5" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2" aria-label="Impjieg Homepage">
            <img src="/logo.svg" alt="Impjieg" className="h-8 dark:invert" />
          </Link>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
