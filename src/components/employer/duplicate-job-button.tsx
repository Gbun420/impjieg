"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { duplicateJob } from "@/lib/actions/applications";

export function DuplicateJobButton({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      title="Duplicate job"
      aria-label="Duplicate job"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await duplicateJob(jobId);
          if (result?.error) {
            alert(`Failed to duplicate: ${result.error}`);
          } else {
            router.refresh();
          }
        });
      }}
    >
      {isPending ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
