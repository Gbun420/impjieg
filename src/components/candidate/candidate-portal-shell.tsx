import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Briefcase, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PortalNavGroups } from "@/components/portal/portal-nav-groups";
import { candidatePortalNavGroups } from "@/lib/portal-navigation";

type CandidatePortalShellProps = {
  children: ReactNode;
};

export function CandidatePortalShell({ children }: CandidatePortalShellProps) {
  return (
    <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,#0B1220_0%,#121A2B_55%,#0F172A_100%)] p-0 text-white shadow-[0_28px_80px_rgba(11,18,32,0.18)]">
        <div className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_top_right,rgba(30,99,255,0.24),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(20,199,183,0.16),transparent_28%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="border-white/10 bg-white/10 text-white">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Candidate portal
                </Badge>
                <Badge variant="secondary" className="border-white/10 bg-white/5 text-white/85">
                  Personal workspace
                </Badge>
                <Badge variant="secondary" className="border-white/10 bg-white/5 text-white/75">
                  Live jobs
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.32em] text-white/55">
                  Candidate control plane
                </p>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                  Manage your profile, applications, and alerts
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
                  Keep your job search tidy with one clean menu for profile updates,
                  application tracking, alerts, and live market browsing.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-xl">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Scope</p>
                <p className="mt-2 text-sm font-medium text-white">Candidate workspace</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Access</p>
                <p className="mt-2 text-sm font-medium text-white">Authenticated only</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Focus</p>
                <p className="mt-2 text-sm font-medium text-white">Search and tracking</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="rounded-[1.35rem] border border-border/70 bg-surface p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Navigation</p>
            <p className="text-sm text-muted-foreground">
              Move through your candidate workspace without hunting for links.
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/jobs">
              <Button variant="outline" size="sm">
                <Briefcase className="mr-2 h-4 w-4" />
                Browse jobs
              </Button>
            </Link>
            <Link href="/candidate/profile">
              <Button variant="ghost" size="sm">
                Open profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <PortalNavGroups
          groups={candidatePortalNavGroups}
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
          buttonClassName="justify-start"
        />
      </div>

      {children}
    </div>
  );
}
