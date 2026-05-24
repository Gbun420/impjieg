import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "secondary" | "accent" | "info";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
      default: "bg-primary/10 text-primary-hover border-primary/20",
      success: "bg-success/10 text-emerald-800 dark:text-emerald-300 border-success/20",
      warning: "bg-warning/10 text-amber-800 dark:text-amber-300 border-warning/20",
      error: "bg-error/10 text-red-800 dark:text-red-300 border-error/20",
      secondary: "bg-muted text-foreground/80 border-border",
      accent: "bg-accent/10 text-amber-800 dark:text-orange-300 border-accent/20",
      info: "bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/20",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border transition-colors",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
