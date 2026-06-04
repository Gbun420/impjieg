import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Shield, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminConsoleNavItems } from "@/lib/admin-consoles";

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
      <Card className="border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(30,99,255,0.12),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(245,248,252,0.9))] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                {eyebrow}
              </Badge>
              <Badge variant="secondary">Protected route</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="md">
                <Sparkles className="mr-2 h-4 w-4" />
                Open overview
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="md">
                Open public site
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {adminNavItems.map((item) => {
          const active = activePath === item.href || activePath.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} className="shrink-0">
              <Button
                type="button"
                variant={active ? "primary" : "outline"}
                size="sm"
              >
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
