"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-error">Error</h1>
      <h2 className="mt-4 text-2xl font-semibold text-foreground">
        Something went wrong
      </h2>
      <p className="mt-2 text-muted-foreground">
        {error.message || "An unexpected error occurred."}
      </p>
      <Button variant="primary" className="mt-6" onClick={() => reset()}>
        Try Again
      </Button>
    </div>
  );
}
