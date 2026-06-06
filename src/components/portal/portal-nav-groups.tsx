"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PortalNavGroup } from "@/lib/portal-navigation";

type PortalNavGroupsProps = {
  groups: PortalNavGroup[];
  className?: string;
  buttonClassName?: string;
};

export function PortalNavGroups({
  groups,
  className,
  buttonClassName,
}: PortalNavGroupsProps) {
  const pathname = usePathname();

  return (
    <div className={cn("grid gap-3", className)}>
      {groups.map((group) => (
        <section
          key={group.label}
          className="rounded-2xl border border-border/60 bg-background/70 p-3 shadow-sm"
        >
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
              const active =
                pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} className="shrink-0">
                  <Button
                    type="button"
                    variant={active ? "primary" : "outline"}
                    size="sm"
                    className={cn("min-w-max", buttonClassName)}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
