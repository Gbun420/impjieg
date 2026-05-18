import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "secondary" | "accent";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
      default: "bg-gradient-to-r from-primary/15 to-secondary/15 text-primary border-primary/10",
      success: "bg-success/10 text-success border-success/10",
      warning: "bg-warning/10 text-warning border-warning/10",
      error: "bg-error/10 text-error border-error/10",
      secondary: "bg-muted/50 text-muted-foreground border-border/50",
      accent: "bg-accent/10 text-accent border-accent/10",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors",
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
