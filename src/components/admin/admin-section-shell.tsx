import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Shield, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminConsoleNavGroups, adminConsoleNavItems } from "@/lib/admin-consoles";

export const adminNavItems = adminConsoleNavItems;

type AdminSectionShellProps = {
  title: string;
  description: string;
  activePath: string;
  eyebrow?: string;
  children?: ReactNode;
};

export function AdminSectionShell({
  title,
  description,
  activePath,
  eyebrow = "Internal admin",
  children,
}: AdminSectionShellProps) {
  return (
    <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-[#272019] to-[#0C0A08] p-0 text-white shadow-[0_28px_80px_rgba(12,10,8,0.18)]">
        <div className="relative overflow-hidden p-6 sm:p-8">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="border-white/10 bg-white/10 text-white">
                  <Shield className="mr-1.5 h-3.5 w-3.5" />
                  {eyebrow}
                </Badge>
                <Badge variant="secondary" className="border-white/10 bg-white/5 text-white/85">
                  Protected route
                </Badge>
                <Badge variant="secondary" className="border-white/10 bg-white/5 text-white/75">
                  Live data
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.32em] text-white/55">
                  Operations console
                </p>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                  {title}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
                  {description}
                </p>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-xl">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Scope</p>
                <p className="mt-2 text-sm font-medium text-white">Admin operations</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Access</p>
                <p className="mt-2 text-sm font-medium text-white">Authenticated only</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Source</p>
                <p className="mt-2 text-sm font-medium text-white">Production dataset</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="rounded-[1.35rem] border border-border/70 bg-surface p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Consoles</p>
            <p className="text-sm text-muted-foreground">
              Switch between live admin sections without leaving the protected shell.
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/dashboard">
                <Sparkles className="mr-2 h-4 w-4" />
                Open overview
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                Open public site
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-4">
          {adminConsoleNavGroups.map((group) => (
            <div key={group.label} className="rounded-2xl border border-border/60 bg-background/70 p-3">
              <div className="mb-3 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {group.label}
                </p>
                <p className="text-xs leading-5 text-muted-foreground">
                  {group.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => {
                  const active = activePath === item.href || activePath.startsWith(`${item.href}/`);
                  return (
                    <Button
                      key={item.href}
                      asChild
                      type="button"
                      variant={active ? "primary" : "outline"}
                      size="sm"
                      className="min-w-max shrink-0"
                    >
                      <Link href={item.href}>
                        {item.label}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {children}
    </div>
  );
}
