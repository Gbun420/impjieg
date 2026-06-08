import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">404</h1>
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-foreground">
        Page Not Found
      </h2>
      <p className="mt-2 text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild variant="primary">
          <Link href="/jobs">Browse Jobs</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
