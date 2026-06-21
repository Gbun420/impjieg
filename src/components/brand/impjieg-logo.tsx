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
      <Image
        src={onDark ? "/logo-white.png" : "/logo.png"}
        alt="Impjieg — Find your next opportunity"
        width={960}
        height={306}
        priority
        className={`${compact ? "h-7" : "h-9"} w-auto`}
      />
    </Link>
  );
}
