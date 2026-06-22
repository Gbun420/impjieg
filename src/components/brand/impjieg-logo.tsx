import Link from "next/link";
import Image from "next/image";

/**
 * Brand logo — the actual impjieg.work artwork. Uses the white variant on dark
 * surfaces (footer) and the standard navy variant on light surfaces (header, auth).
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
      className={`inline-flex items-center ${className}`}
    >
      {onDark ? (
        // Always-dark surfaces (e.g. footer) always use the white logo.
        <Image
          src="/logo-white.png"
          alt="Impjieg — Find your next opportunity"
          width={960}
          height={306}
          priority
          className={`${compact ? "h-7" : "h-9"} w-auto`}
        />
      ) : (
        // Theme-responsive: driven by the `.dark` class via CSS so it stays
        // correct regardless of SSR/hydration (the React theme state can lag).
        <>
          <Image
            src="/logo.png"
            alt="Impjieg — Find your next opportunity"
            width={960}
            height={306}
            priority
            className={`${compact ? "h-7" : "h-9"} w-auto dark:hidden`}
          />
          <Image
            src="/logo-white.png"
            alt="Impjieg — Find your next opportunity"
            width={960}
            height={306}
            className={`${compact ? "h-7" : "h-9"} hidden w-auto dark:block`}
          />
        </>
      )}
    </Link>
  );
}
