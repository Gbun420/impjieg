"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error boundary caught:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error/10 text-error">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
        Admin route error
      </h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground">
        {isDev
          ? error.message || "Something went wrong in the admin console."
          : "We hit a temporary server-side error while loading the admin console. The route has a dedicated fallback so it should recover cleanly on refresh."}
      </p>

      {isDev && error.stack ? (
        <pre className="mt-6 max-h-40 max-w-lg overflow-auto rounded-lg border border-border bg-muted p-4 text-left font-mono text-xs text-muted-foreground">
          {error.stack}
        </pre>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button variant="primary" onClick={() => reset()}>
          Retry
        </Button>
        <Link href="/admin/dashboard">
          <Button variant="outline">Dashboard</Button>
        </Link>
        <Link href="/">
          <Button variant="ghost">Public site</Button>
        </Link>
      </div>
    </div>
  );
}
