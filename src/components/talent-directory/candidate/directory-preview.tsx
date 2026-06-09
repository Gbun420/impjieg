import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Clock, Banknote, Eye } from "lucide-react";
import { formatSalary } from "@/lib/utils";
import { resolveDisplayName } from "@/lib/talent-directory/resolver";

type DirectoryProfile = {
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
} | null;

type CandidateProfile = {
  full_name: string | null;
} | null;

export function DirectoryPreview({
  directoryProfile,
  candidateProfile,
}: {
  directoryProfile: DirectoryProfile;
  candidateProfile: CandidateProfile;
}) {
  const displayName = directoryProfile
    ? resolveDisplayName(
        { ...directoryProfile, id: "", slug: "", created_at: "" } as any,
        candidateProfile?.full_name
      )
    : "Candidate";

  const hasData =
    directoryProfile?.headline ||
    directoryProfile?.summary ||
    (directoryProfile?.skills?.length ?? 0) > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Employer Preview</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        This is exactly what paid employers will see
      </p>

      {!hasData ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <Eye className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            No profile data yet. Fill in your settings to preview.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Name */}
          <div>
            <p className="text-lg font-semibold text-foreground">{displayName}</p>
            {directoryProfile?.headline && (
              <p className="text-sm text-muted-foreground">{directoryProfile.headline}</p>
            )}
          </div>

          {/* Summary */}
          {directoryProfile?.summary && (
            <p className="text-sm text-foreground">{directoryProfile.summary}</p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {directoryProfile?.location && (
              <Badge variant="secondary" className="text-xs">
                <MapPin className="mr-1 h-3 w-3" />
                {directoryProfile.location}
              </Badge>
            )}
            {directoryProfile?.remote_preference && (
              <Badge variant="secondary" className="text-xs">
                {directoryProfile.remote_preference}
              </Badge>
            )}
            {directoryProfile?.experience_years != null && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="mr-1 h-3 w-3" />
                {directoryProfile.experience_years} years
              </Badge>
            )}
            {directoryProfile?.desired_salary_min != null && (
              <Badge variant="secondary" className="text-xs">
                <Banknote className="mr-1 h-3 w-3" />
                {formatSalary(directoryProfile.desired_salary_min)}
                {directoryProfile.desired_salary_max
                  ? ` - ${formatSalary(directoryProfile.desired_salary_max)}`
                  : "+"}
              </Badge>
            )}
          </div>

          {/* Skills */}
          {directoryProfile?.skills && directoryProfile.skills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Skills</p>
              <div className="flex flex-wrap gap-1">
                {directoryProfile.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sectors */}
          {directoryProfile?.sectors && directoryProfile.sectors.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Sectors</p>
              <div className="flex flex-wrap gap-1">
                {directoryProfile.sectors.map((sector) => (
                  <Badge key={sector} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Job Types */}
          {directoryProfile?.job_types && directoryProfile.job_types.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Job Types</p>
              <div className="flex flex-wrap gap-1">
                {directoryProfile.job_types.map((jt) => (
                  <Badge key={jt} variant="outline" className="text-xs">
                    <Briefcase className="mr-1 h-3 w-3" />
                    {jt}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {directoryProfile?.availability && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Availability</p>
              <p className="text-sm text-foreground">{directoryProfile.availability}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
