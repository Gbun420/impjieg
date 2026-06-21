import Link from "next/link";

/**
 * The impjieg.work wordmark, recreated as crisp, theme-aware text in a rounded
 * display face (Baloo 2) to match the brand logo. "impjieg" in ink, ".work" in
 * the coral accent. To use the exact artwork instead, drop it at
 * public/logo.svg and render it here with next/image.
 */
export function ImpjiegLogo({
  href = "/",
  compact = false,
  className = "",
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Impjieg — Find your next opportunity"
      style={{ fontFamily: "var(--font-logo), system-ui, sans-serif" }}
      className={`inline-flex select-none items-baseline font-extrabold leading-none tracking-[-0.01em] ${
        compact ? "text-xl" : "text-[1.7rem]"
      } ${className}`}
    >
      <span className="text-foreground">impjieg</span>
      <span className="text-primary">.work</span>
    </Link>
  );
}
