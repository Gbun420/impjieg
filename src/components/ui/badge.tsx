import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "secondary" | "accent" | "info" | "outline";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
      default: "bg-primary/10 text-primary border-primary/20",
      success: "bg-success/10 text-success border-success/20",
      warning: "bg-warning/15 text-foreground border-warning/20",
      error: "bg-error/10 text-error border-error/20",
      secondary: "bg-muted text-foreground/80 border-border",
      accent: "bg-secondary/10 text-secondary border-secondary/20",
      info: "bg-primary/10 text-primary border-primary/20",
      outline: "bg-background/70 text-muted-foreground border-border/70",
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
