import Link from "next/link";
import { ImpjiegMark } from "./impjieg-mark";
import { SITE } from "@/lib/constants";

export function ImpjiegLogo({
  href = "/",
  compact = false,
  className = "",
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <ImpjiegMark size={compact ? 34 : 42} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-xl font-semibold tracking-[-0.04em] text-foreground">
            {SITE.name}
          </span>
          <span className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Hiring signal
          </span>
        </span>
      )}
    </span>
  );

  return (
    <Link href={href} aria-label="Impjieg homepage">
      {content}
    </Link>
  );
}
