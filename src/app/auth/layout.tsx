import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/constants";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(18,59,103,0.12),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.28),transparent_35%)] dark:bg-[radial-gradient(circle_at_top,_rgba(140,183,255,0.14),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_35%)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Impjieg Homepage">
            <Image src="/logo-icon.svg" alt="" width={40} height={40} aria-hidden="true" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-semibold tracking-[-0.03em] text-foreground">
                {SITE.name}
              </span>
              <span className="text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground">
                {SITE.tagline}
              </span>
            </span>
          </Link>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
