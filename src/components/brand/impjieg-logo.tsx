import Link from "next/link";

/**
 * The impjieg.work wordmark in a rounded display face (Baloo 2). "impjieg" in
 * ink (or white on dark surfaces via `onDark`), ".work" in the coral accent.
 * To use the exact artwork, drop it at public/logo.svg and render with next/image.
 */
export function ImpjiegLogo({
  href = "/",
  compact = false,
  onDark = false,
  className = "",
}: {
  href?: string;
  compact?: boolean;
  onDark?: boolean;
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
      <span className={onDark ? "text-white" : "text-foreground"}>impjieg</span>
      <span className="text-primary">.work</span>
    </Link>
  );
}
