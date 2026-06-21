import Link from "next/link";
import Image from "next/image";

/**
 * Brand logo. On light surfaces (header, auth) renders the actual impjieg.work
 * artwork. On dark surfaces (footer) the navy artwork would disappear, so it
 * falls back to a white wordmark in the rounded brand face.
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
  if (onDark) {
    return (
      <Link
        href={href}
        aria-label="Impjieg — Find your next opportunity"
        style={{ fontFamily: "var(--font-logo), system-ui, sans-serif" }}
        className={`inline-flex select-none items-baseline font-extrabold leading-none tracking-[-0.01em] ${
          compact ? "text-xl" : "text-[1.6rem]"
        } ${className}`}
      >
        <span className="text-white">impjieg</span>
        <span className="text-primary">.work</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label="Impjieg — Find your next opportunity"
      className={`inline-flex items-center ${className}`}
    >
      <Image
        src="/logo.png"
        alt="Impjieg — Find your next opportunity"
        width={1931}
        height={617}
        priority
        className={`${compact ? "h-7" : "h-9"} w-auto`}
      />
    </Link>
  );
}
