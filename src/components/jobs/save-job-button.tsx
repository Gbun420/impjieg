import Link from "next/link";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveJob, unsaveJob } from "@/lib/actions/saved-jobs";

export function SaveJobButton({
  jobId,
  saved,
  authenticated,
  redirectTo,
  compact = false,
}: {
  jobId: string;
  saved: boolean;
  authenticated: boolean;
  redirectTo: string;
  compact?: boolean;
}) {
  if (!authenticated) {
    return (
      <Link
        href={`/auth/login?redirect=${encodeURIComponent(redirectTo)}`}
        className={`inline-flex items-center justify-center rounded-lg border border-border bg-transparent font-medium text-foreground transition-all duration-150 hover:border-border-hover hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          compact ? "h-8 px-3 text-sm" : "h-10 px-4 text-sm"
        }`}
      >
        <BookmarkPlus className="mr-1.5 h-4 w-4" />
        Save Job
      </Link>
    );
  }

  async function handleToggle() {
    "use server";
    if (saved) {
      await unsaveJob(jobId);
      return;
    }

    await saveJob(jobId);
  }

  return (
    <form action={handleToggle}>
      <Button
        type="submit"
        variant={saved ? "secondary" : "outline"}
        size={compact ? "sm" : "md"}
        className="whitespace-nowrap"
      >
        {saved ? (
          <>
            <BookmarkCheck className="mr-1.5 h-4 w-4" />
            Saved
          </>
        ) : (
          <>
            <BookmarkPlus className="mr-1.5 h-4 w-4" />
            Save Job
          </>
        )}
      </Button>
    </form>
  );
}
