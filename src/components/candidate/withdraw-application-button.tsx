"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { withdrawApplication } from "@/lib/actions/applications";

export function WithdrawApplicationButton({ applicationId }: { applicationId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      title="Withdraw application"
      aria-label="Withdraw application"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("Withdraw this application? This cannot be undone.")) {
          return;
        }
        startTransition(async () => {
          const formData = new FormData();
          formData.set("applicationId", applicationId);
          await withdrawApplication(formData);
          router.refresh();
        });
      }}
    >
      <RotateCcw className={`h-3.5 w-3.5 text-muted-foreground ${isPending ? "animate-pulse" : ""}`} />
    </Button>
  );
}
