"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { SECTORS, JOB_TYPES, REMOTE_OPTIONS } from "@/lib/constants";

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const search = formData.get("search") as string;
    const sector = formData.get("sector") as string;
    const jobType = formData.get("jobType") as string;
    const remote = formData.get("remote") as string;
    const location = formData.get("location") as string;
    const visa = formData.get("visa") as string;

    if (search) params.set("search", search);
    if (sector) params.set("sector", sector);
    if (jobType) params.set("jobType", jobType);
    if (remote) params.set("remote", remote);
    if (location) params.set("location", location);
    if (visa === "on") params.set("visa", "true");

    startTransition(() => {
      router.push(`/jobs?${params.toString()}`);
    });
  }

  const sectorOptions = SECTORS.map((s) => ({ value: s, label: s }));
  const typeOptions = JOB_TYPES.map((t) => ({ value: t, label: t }));
  const remoteOptions = REMOTE_OPTIONS.map((r) => ({ value: r, label: r }));

  const hasActiveFilters = !!(
    searchParams.get("sector") ||
    searchParams.get("jobType") ||
    searchParams.get("remote") ||
    searchParams.get("location") ||
    searchParams.get("visa")
  );

  function clearFilters() {
    const search = searchParams.get("search");
    startTransition(() => {
      router.push(search ? `/jobs?search=${search}` : "/jobs");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            name="search"
            placeholder="Search jobs, companies, skills..."
            className="pl-9"
            defaultValue={searchParams.get("search") || ""}
          />
        </div>
        <Button type="submit" variant="primary" isLoading={isPending}>
          Search
        </Button>
        <Button
          type="button"
          variant={hasActiveFilters || showFilters ? "primary" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>

      {showFilters && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5 animate-fade-in">
          <Select
            name="sector"
            options={sectorOptions}
            placeholder="All Sectors"
            defaultValue={searchParams.get("sector") || ""}
          />
          <Select
            name="jobType"
            options={typeOptions}
            placeholder="All Types"
            defaultValue={searchParams.get("jobType") || ""}
          />
          <Select
            name="remote"
            options={remoteOptions}
            placeholder="All Options"
            defaultValue={searchParams.get("remote") || ""}
          />
          <Input
            name="location"
            placeholder="Location"
            defaultValue={searchParams.get("location") || ""}
          />
          <label className="flex items-center gap-2 rounded-lg border border-border bg-transparent px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors">
            <input
              type="checkbox"
              name="visa"
              defaultChecked={searchParams.get("visa") === "true"}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            Visa Friendly
          </label>
        </div>
      )}

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-primary hover:text-primary-hover transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        </div>
      )}
    </form>
  );
}
