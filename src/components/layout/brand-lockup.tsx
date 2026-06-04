import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";

const sizes = {
  sm: {
    icon: "h-8 w-8",
    text: "text-[1.1rem]",
  },
  md: {
    icon: "h-10 w-10",
    text: "text-xl",
  },
  lg: {
    icon: "h-12 w-12",
    text: "text-2xl",
  },
} as const;

type BrandLockupProps = {
  className?: string;
  href?: string;
  size?: keyof typeof sizes;
};

export function BrandLockup({
  className,
  href = "/",
  size = "sm",
}: BrandLockupProps) {
  const brandSize = sizes[size];

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-3", className)}
      aria-label={`${SITE.name} homepage`}
    >
      <img
        src="/logo-icon.svg"
        alt=""
        className={cn(brandSize.icon, "shrink-0")}
        aria-hidden="true"
      />
      <span
        className={cn(
          "font-display font-semibold tracking-[-0.04em] text-foreground",
          brandSize.text
        )}
      >
        {SITE.name}
      </span>
    </Link>
  );
}
