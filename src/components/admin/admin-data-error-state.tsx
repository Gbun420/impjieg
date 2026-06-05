"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AdminDataErrorStateProps = {
  title: string;
  description: string;
  routeLabel: string;
  retryHref: string;
};

export function AdminDataErrorState({
  title,
  description,
  routeLabel,
  retryHref,
}: AdminDataErrorStateProps) {
  return (
    <Card className="overflow-hidden border-border/70 bg-surface shadow-sm">
      <div className="h-1 w-full bg-[linear-gradient(90deg,rgba(226,76,76,0.95)_0%,rgba(245,167,66,0.95)_100%)]" />
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-error/20 bg-error/10 text-error">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <Badge variant="error">{routeLabel}</Badge>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
              {title}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={retryHref}>
            <Button variant="primary">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="outline">Open dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost">Open public site</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
