"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { unsaveJob } from "@/lib/actions/saved-jobs";

export function RemoveSavedJobButton({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("Remove this job from saved?")) {
          return;
        }
        startTransition(async () => {
          await unsaveJob(jobId);
          router.refresh();
        });
      }}
    >
      {isPending ? "Removing..." : "Remove"}
    </Button>
  );
}
