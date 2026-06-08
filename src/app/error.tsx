"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error securely to server console/external tracing tools
    console.error("Application error boundary caught:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error/10 text-error">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
        An unexpected error occurred
      </h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground">
        {isDev 
          ? error.message || "Something went wrong. Details are listed below." 
          : "We encountered a temporary server-side error. Our engineering team has been notified, and we are working to resolve this as soon as possible."}
      </p>

      {isDev && error.stack && (
        <pre className="mt-6 max-h-40 max-w-lg overflow-auto rounded-lg bg-muted p-4 text-left font-mono text-xs text-muted-foreground border border-border">
          {error.stack}
        </pre>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button variant="primary" onClick={() => reset()}>
          Try Again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
