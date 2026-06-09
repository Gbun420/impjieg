import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      asChild = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const baseStyles =
      "inline-flex items-center justify-center font-medium tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 rounded-xl active:scale-[0.98]";

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-[linear-gradient(135deg,var(--primary)_0%,var(--primary-hover)_100%)] text-primary-foreground shadow-[0_12px_28px_rgba(30,99,255,0.22)] hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(30,99,255,0.28)]",
      secondary:
        "border border-secondary/25 bg-secondary/10 text-secondary hover:border-secondary/35 hover:bg-secondary/18",
      outline:
        "border border-border bg-surface/90 text-foreground shadow-[0_8px_20px_rgba(11,18,32,0.04)] hover:border-border-hover hover:bg-muted/60",
      ghost: "text-foreground hover:bg-muted/60 hover:text-primary",
      danger: "bg-error/10 text-error hover:bg-error/20 border border-error/20",
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    if (asChild) {
      return (
        <Slot
          className={cn(
            baseStyles,
            variants[variant],
            sizes[size],
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
