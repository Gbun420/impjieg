"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteJob } from "@/lib/actions/applications";

export function DeleteJobButton({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      title="Close job"
      aria-label="Close job"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("Close this job? It will no longer appear as active.")) {
          return;
        }
        startTransition(async () => {
          const result = await deleteJob(jobId);
          if (result?.error) {
            alert(`Failed to close job: ${result.error}`);
          } else {
            router.refresh();
          }
        });
      }}
    >
      <Trash2 className={`h-3.5 w-3.5 text-error ${isPending ? "animate-pulse" : ""}`} />
    </Button>
  );
}
