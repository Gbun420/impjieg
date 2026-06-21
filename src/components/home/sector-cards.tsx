import Link from "next/link";
import Image from "next/image";
import {
  Gamepad2,
  Code2,
  Landmark,
  HeartPulse,
  Megaphone,
  Scale,
  Plane,
  HardHat,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

type Sector = { name: string; slug: string; Icon: LucideIcon };

const SECTORS: Sector[] = [
  { name: "iGaming", slug: "igaming", Icon: Gamepad2 },
  { name: "Technology", slug: "technology", Icon: Code2 },
  { name: "Finance & Banking", slug: "finance-banking", Icon: Landmark },
  { name: "Healthcare", slug: "healthcare", Icon: HeartPulse },
  { name: "Marketing & Media", slug: "marketing-media", Icon: Megaphone },
  { name: "Legal & Compliance", slug: "legal-compliance", Icon: Scale },
  { name: "Tourism & Hospitality", slug: "tourism-hospitality", Icon: Plane },
  { name: "Construction", slug: "construction-engineering", Icon: HardHat },
];

/**
 * Optional background photos per sector. To enable, drop a portrait (9:16)
 * image at `public/sectors/{slug}.jpg` and add an entry below — it then
 * replaces the gradient automatically. Until then, cards use a clean navy
 * gradient + sector icon (deliberately not stock photography).
 */
const IMAGES: Record<string, string> = {
  igaming: "/sectors/igaming.jpg",
  technology: "/sectors/technology.jpg",
  "finance-banking": "/sectors/finance-banking.jpg",
  healthcare: "/sectors/healthcare.jpg",
  "marketing-media": "/sectors/marketing-media.jpg",
  "legal-compliance": "/sectors/legal-compliance.jpg",
  "tourism-hospitality": "/sectors/tourism-hospitality.jpg",
  "construction-engineering": "/sectors/construction-engineering.jpg",
};

export function SectorCards() {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {SECTORS.map(({ name, slug, Icon }) => {
        const image = IMAGES[slug];
        return (
          <Link
            key={slug}
            href={`/jobs/sector/${slug}`}
            aria-label={`${name} jobs in Malta`}
            className="group relative aspect-[9/16] w-[150px] shrink-0 snap-start overflow-hidden rounded-[1.25rem] ring-1 ring-border transition-all duration-200 hover:-translate-y-1 hover:ring-2 hover:ring-primary/40 sm:w-[176px]"
          >
            {/* base */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#173657] to-[#0B1B2E]" />
            {image && (
              <Image
                src={image}
                alt=""
                fill
                sizes="(min-width: 640px) 176px, 150px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              />
            )}
            {/* legibility scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2E] via-[#0B1B2E]/35 to-transparent" />
            {!image && (
              <Icon
                className="absolute right-4 top-4 h-9 w-9 text-white/15"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="text-[0.95rem] font-semibold leading-tight text-white">{name}</h3>
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-white/55 transition-colors group-hover:text-primary">
                View roles
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
