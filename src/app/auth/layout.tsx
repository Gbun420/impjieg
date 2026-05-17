import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Impjieg" className="h-8" />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
