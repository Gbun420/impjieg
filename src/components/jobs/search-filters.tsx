"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { SECTORS } from "@/lib/constants";

const WORK_TYPES = ["Full-time", "Part-time", "Remote", "Hybrid", "On-site"] as const;
const EXPERIENCE_LEVELS = ["Entry", "Mid", "Senior"] as const;
const SALARY_MIN = 20000;
const SALARY_MAX = 150000;

function parseList(value: string | null) {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function buildQuery(params: {
  query: string;
  sector: string;
  location: string;
  workTypes: string[];
  experience: string[];
  salaryMin: number;
  salaryMax: number;
  visaFriendly: boolean;
}) {
  const searchParams = new URLSearchParams();

  if (params.query.trim()) {
    searchParams.set("q", params.query.trim());
  }
  if (params.sector) {
    searchParams.set("sector", params.sector);
  }
  if (params.location.trim()) {
    searchParams.set("location", params.location.trim());
  }
  if (params.workTypes.length > 0) {
    searchParams.set("workType", params.workTypes.join(","));
  }
  if (params.experience.length > 0) {
    searchParams.set("experience", params.experience.join(","));
  }
  if (params.salaryMin !== SALARY_MIN || params.salaryMax !== SALARY_MAX) {
    searchParams.set("salaryMin", String(params.salaryMin));
    searchParams.set("salaryMax", String(params.salaryMax));
  }
  if (params.visaFriendly) {
    searchParams.set("visa", "true");
  }

  searchParams.delete("page");
  searchParams.delete("pageSize");

  return searchParams.toString();
}

export default function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const syncTimer = useRef<number | null>(null);

  const initial = useMemo(
    () => ({
      query: searchParams.get("q") ?? searchParams.get("search") ?? "",
      sector: searchParams.get("sector") ?? "",
      location: searchParams.get("location") ?? "",
      workTypes: parseList(searchParams.get("workType")),
      experience: parseList(searchParams.get("experience")),
      salaryMin: Number(searchParams.get("salaryMin") ?? SALARY_MIN),
      salaryMax: Number(searchParams.get("salaryMax") ?? SALARY_MAX),
      visaFriendly: searchParams.get("visa") === "true",
    }),
    [searchParams]
  );

  const [query, setQuery] = useState(initial.query);
  const [sector, setSector] = useState(initial.sector);
  const [location, setLocation] = useState(initial.location);
  const [workTypes, setWorkTypes] = useState<string[]>(initial.workTypes);
  const [experience, setExperience] = useState<string[]>(initial.experience);
  const [salaryMin, setSalaryMin] = useState(
    Number.isFinite(initial.salaryMin) ? initial.salaryMin : SALARY_MIN
  );
  const [salaryMax, setSalaryMax] = useState(
    Number.isFinite(initial.salaryMax) ? initial.salaryMax : SALARY_MAX
  );
  const [visaFriendly, setVisaFriendly] = useState(initial.visaFriendly);
  const initialHasFilters = Boolean(
    initial.query ||
      initial.sector ||
      initial.location ||
      initial.workTypes.length ||
      initial.experience.length ||
      initial.visaFriendly ||
      initial.salaryMin !== SALARY_MIN ||
      initial.salaryMax !== SALARY_MAX
  );
  const hasActiveFilters = !!(
    query.trim() ||
    sector ||
    location.trim() ||
    workTypes.length ||
    experience.length ||
    visaFriendly ||
    salaryMin !== SALARY_MIN ||
    salaryMax !== SALARY_MAX
  );
  const [showFilters, setShowFilters] = useState(initialHasFilters);

  useEffect(() => {
    if (syncTimer.current) {
      window.clearTimeout(syncTimer.current);
    }

    syncTimer.current = window.setTimeout(() => {
      const nextQuery = buildQuery({
        query,
        sector,
        location,
        workTypes,
        experience,
        salaryMin,
        salaryMax,
        visaFriendly,
      });
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

      if (nextUrl === currentUrl) {
        return;
      }

      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    }, 250);

    return () => {
      if (syncTimer.current) {
        window.clearTimeout(syncTimer.current);
      }
    };
  }, [query, sector, location, workTypes, experience, salaryMin, salaryMax, visaFriendly, pathname, router, searchParams, startTransition]);

  function toggleValue(value: string, current: string[], setter: (values: string[]) => void) {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function clearFilters() {
    startTransition(() => {
      setQuery("");
      setSector("");
      setLocation("");
      setWorkTypes([]);
      setExperience([]);
      setSalaryMin(SALARY_MIN);
      setSalaryMax(SALARY_MAX);
      setVisaFriendly(false);
      router.replace(pathname, { scroll: false });
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium text-foreground">Search jobs</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search jobs by title, company, or description"
              placeholder="Search by keyword, title, company, or skill"
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={showFilters || hasActiveFilters ? "secondary" : "outline"}
            onClick={() => setShowFilters((value) => !value)}
          >
            <SlidersHorizontal className="mr-1.5 h-4 w-4" />
            Filters
          </Button>
          {hasActiveFilters && (
            <Button type="button" variant="ghost" onClick={clearFilters}>
              <X className="mr-1.5 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="space-y-5 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="grid gap-4 lg:grid-cols-2">
            <Select
              label="Sector"
              options={SECTORS.map((value) => ({ value, label: value }))}
              placeholder="All sectors"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
            />
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Valletta, Sliema, remote..."
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">Employment type</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {WORK_TYPES.map((option) => {
                  const checked = workTypes.includes(option);
                  return (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                        checked
                          ? "border-primary/40 bg-primary/5 text-foreground"
                          : "border-border/60 bg-background/50 text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleValue(option, workTypes, setWorkTypes)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">Experience level</legend>
              <div className="grid grid-cols-3 gap-2">
                {EXPERIENCE_LEVELS.map((option) => {
                  const checked = experience.includes(option);
                  return (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                        checked
                          ? "border-primary/40 bg-primary/5 text-foreground"
                          : "border-border/60 bg-background/50 text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleValue(option, experience, setExperience)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-foreground">Salary range</label>
              <span className="text-xs text-muted-foreground">
                €{salaryMin.toLocaleString()} - €{salaryMax.toLocaleString()}
              </span>
            </div>
            <div className="space-y-3">
              <input
                type="range"
                min={SALARY_MIN}
                max={SALARY_MAX}
                step={1000}
                value={salaryMin}
                onChange={(e) => {
                  const next = Math.min(Number(e.target.value), salaryMax - 1000);
                  setSalaryMin(Math.max(SALARY_MIN, next));
                }}
                className="w-full accent-primary"
                aria-label="Minimum salary"
              />
              <input
                type="range"
                min={SALARY_MIN}
                max={SALARY_MAX}
                step={1000}
                value={salaryMax}
                onChange={(e) => {
                  const next = Math.max(Number(e.target.value), salaryMin + 1000);
                  setSalaryMax(Math.min(SALARY_MAX, next));
                }}
                className="w-full accent-primary"
                aria-label="Maximum salary"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-3 py-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={visaFriendly}
              onChange={(e) => setVisaFriendly(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            Visa friendly only
          </label>
        </div>
      )}
    </div>
  );
}
