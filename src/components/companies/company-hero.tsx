import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Building2, Globe, ShieldCheck } from "lucide-react";
import type { Employer } from "@/lib/supabase/types";

type CompanyHeroProps = {
  emp: Pick<
    Employer,
    | "name"
    | "slug"
    | "description"
    | "logo_url"
    | "cover_image_url"
    | "location"
    | "company_size"
    | "industry"
    | "website"
    | "is_verified"
  >;
  activeJobsCount: number;
  heroCtaLabel: string;
  heroCtaHref: string;
  heroSecondaryLabel: string | null;
  heroSecondaryHref: string | null;
  heroTagline: string;
};

export default function CompanyHero({
  emp,
  activeJobsCount,
  heroCtaLabel,
  heroCtaHref,
  heroSecondaryLabel,
  heroSecondaryHref,
  heroTagline,
}: CompanyHeroProps) {
  const initials = emp.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="overflow-hidden border-border/70 bg-card/95">
      <div className="relative h-36 w-full overflow-hidden sm:h-44">
        {emp.cover_image_url ? (
          <Image
            src={emp.cover_image_url}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#08111F] via-[#0C2240] to-[#1A3A5C]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="relative px-6 pb-6 sm:px-8">
        <div
          className={`-mt-10 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-background bg-background shadow-lg`}
          role="img"
          aria-label={
            emp.logo_url
              ? `${emp.name} logo`
              : `${emp.name} logo placeholder`
          }
        >
          {emp.logo_url ? (
            <Image
              src={emp.logo_url}
              alt={`${emp.name} logo`}
              width={56}
              height={56}
              className="rounded-xl object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="text-2xl font-bold text-muted-foreground"
            >
              {initials}
            </span>
          )}
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {emp.name}
            </h1>
            {emp.is_verified && (
              <Badge variant="success" className="gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </Badge>
            )}
          </div>

          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {heroTagline}
          </p>

          {emp.description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {emp.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {emp.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" />
                {emp.location}
              </span>
            )}
            {emp.company_size && (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 shrink-0" />
                {emp.company_size}
              </span>
            )}
            {emp.industry && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 shrink-0" />
                {emp.industry}
              </span>
            )}
            {emp.website && (
              <a
                href={emp.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
              >
                <Globe className="h-4 w-4 shrink-0" />
                Website
              </a>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={heroCtaHref}>{heroCtaLabel}</Link>
            </Button>
            {heroSecondaryLabel && heroSecondaryHref && (
              <Button asChild variant="outline" size="lg">
                <a
                  href={heroSecondaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {heroSecondaryLabel}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
