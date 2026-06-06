import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/constants";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(30,99,255,0.12),transparent_36%),radial-gradient(circle_at_82%_8%,rgba(20,199,183,0.12),transparent_32%),linear-gradient(180deg,rgba(247,244,236,0.68),transparent_42%)] dark:bg-[radial-gradient(circle_at_top,_rgba(140,183,255,0.14),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_35%)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Impjieg Homepage">
            <Image src="/logo-icon.svg" alt="" width={40} height={40} aria-hidden="true" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-semibold tracking-[-0.03em] text-foreground">
                {SITE.name}
              </span>
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary">
                Malta&apos;s modern jobs marketplace
              </span>
            </span>
          </Link>
        </div>
        <div className="marketplace-panel overflow-hidden rounded-[1.5rem] p-8">
          <div className="-mx-8 -mt-8 mb-8 bg-[#08111F] px-8 py-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7AA8FF]">
              Malta marketplace access
            </p>
            <p className="mt-2 text-sm text-white/72">
              Sign in to manage roles, applications, alerts, and career signals.
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
