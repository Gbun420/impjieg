"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { boostJob } from "@/lib/actions/applications";

export function BoostJobButton({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      title="Boost to Featured"
      aria-label="Boost to Featured"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await boostJob(jobId);
          if (result?.error) {
            alert(`Failed to boost: ${result.error}`);
          } else {
            router.refresh();
          }
        });
      }}
    >
      <Zap className={`mr-1 h-3.5 w-3.5 ${isPending ? "animate-pulse" : ""}`} />
      {isPending ? "Boosting..." : "Boost"}
    </Button>
  );
}
