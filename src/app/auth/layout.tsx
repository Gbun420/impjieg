import { ImpjiegLogo } from "@/components/brand";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(251,59,78,0.05),transparent_45%)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <ImpjiegLogo />
        </div>
        <div className="marketplace-panel overflow-hidden rounded-[1.5rem] p-8">
          <div className="-mx-8 -mt-8 mb-8 bg-[#08111F] px-8 py-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
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
