"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search jobs, companies, skills..."
            className="pl-10"
            defaultValue={searchParams.get("search") || ""}
          />
        </div>
        <Button type="submit" variant="primary" isLoading={isPending}>
          Search
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
          <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <input
              type="checkbox"
              name="visa"
              defaultChecked={searchParams.get("visa") === "true"}
              className="h-4 w-4 rounded border-border text-secondary focus:ring-secondary"
            />
            Visa Friendly
          </label>
        </div>
      )}
    </form>
  );
}
