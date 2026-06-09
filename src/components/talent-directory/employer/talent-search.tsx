"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, MapPin, Briefcase, Clock, Banknote, Eye } from "lucide-react";
import { searchTalentDirectory } from "@/lib/talent-directory/actions";
import { formatSalary } from "@/lib/utils";
import { resolveDisplayName } from "@/lib/talent-directory/resolver";
import { SECTORS, LOCATIONS, REMOTE_OPTIONS } from "@/lib/constants";
import type { EmployerTalentSearchInput } from "@/lib/talent-directory/validation";

type SearchResult = {
  id: string;
  slug: string;
  display_mode: string;
  headline: string | null;
  summary: string | null;
  location: string | null;
  skills: string[];
  sectors: string[];
  job_types: string[];
  remote_preference: string | null;
  experience_years: number | null;
  desired_salary_min: number | null;
  desired_salary_max: number | null;
  availability: string | null;
  allow_cv_requests: boolean;
  created_at: string;
};

export function TalentSearch({ employerId }: { employerId: string }) {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [message, setMessage] = useState<{ type: "error"; text: string } | null>(null);

  const [filters, setFilters] = useState({
    query: "",
    sector: "",
    location: "",
    remotePreference: "",
  });

  const handleSearch = () => {
    startTransition(async () => {
      setMessage(null);
      setHasSearched(true);

      const input: EmployerTalentSearchInput = {
        page: 1,
        limit: 20,
      };

      if (filters.query) input.query = filters.query;
      if (filters.sector) input.sectors = [filters.sector];
      if (filters.location) input.locations = [filters.location];
      if (filters.remotePreference) input.remotePreference = filters.remotePreference as any;

      const result = await searchTalentDirectory(input);
      if (result.ok && result.data) {
        setResults(result.data.profiles);
        setTotal(result.data.total);
      } else {
        setMessage({ type: "error", text: result.error ?? "An error occurred" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <Card className="p-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by headline, skills..."
              value={filters.query}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
              className="pl-9"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isPending} variant="primary">
            {isPending ? "Searching..." : "Search"}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Select
            label="Sector"
            options={SECTORS.map((s) => ({ value: s, label: s }))}
            value={filters.sector}
            onChange={(e) => setFilters((prev) => ({ ...prev, sector: e.target.value }))}
            placeholder="All sectors"
          />
          <Select
            label="Location"
            options={LOCATIONS.map((l) => ({ value: l, label: l }))}
            value={filters.location}
            onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="All locations"
          />
          <Select
            label="Remote"
            options={REMOTE_OPTIONS.map((r) => ({ value: r, label: r }))}
            value={filters.remotePreference}
            onChange={(e) => setFilters((prev) => ({ ...prev, remotePreference: e.target.value }))}
            placeholder="Any"
          />
        </div>
      </Card>

      {/* Messages */}
      {message && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {message.text}
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {total} candidate{total !== 1 ? "s" : ""} found
          </p>

          {results.length === 0 ? (
            <Card className="p-8 text-center">
              <Search className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-muted-foreground">
                No candidates match your search criteria
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((profile) => (
                <CandidateCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CandidateCard({ profile }: { profile: SearchResult }) {
  const displayName = resolveDisplayName(profile as any, null);

  return (
    <Card className="p-5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-foreground">{displayName}</p>
          {profile.headline && (
            <p className="text-sm text-muted-foreground">{profile.headline}</p>
          )}
        </div>
        <Button asChild variant="ghost" size="sm">
          <a href={`/employer/talent/${profile.slug}`}>
            <Eye className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {profile.location && (
          <Badge variant="secondary" className="text-xs">
            <MapPin className="mr-1 h-3 w-3" />
            {profile.location}
          </Badge>
        )}
        {profile.remote_preference && (
          <Badge variant="secondary" className="text-xs">
            {profile.remote_preference}
          </Badge>
        )}
        {profile.experience_years != null && (
          <Badge variant="secondary" className="text-xs">
            <Clock className="mr-1 h-3 w-3" />
            {profile.experience_years}y
          </Badge>
        )}
        {profile.desired_salary_min != null && (
          <Badge variant="secondary" className="text-xs">
            <Banknote className="mr-1 h-3 w-3" />
            {formatSalary(profile.desired_salary_min)}
            {profile.desired_salary_max ? `-${formatSalary(profile.desired_salary_max)}` : "+"}
          </Badge>
        )}
      </div>

      {profile.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {profile.skills.slice(0, 5).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {profile.skills.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{profile.skills.length - 5}
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
}
