import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "secondary" | "accent" | "info";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
      default: "bg-primary/10 text-primary border-primary/20",
      success: "bg-success/10 text-success border-success/20",
      warning: "bg-warning/10 text-warning border-warning/20",
      error: "bg-error/10 text-error border-error/20",
      secondary: "bg-muted text-muted-foreground border-border",
      accent: "bg-accent/10 text-accent border-accent/20",
      info: "bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/20",
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
