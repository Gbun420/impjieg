import { Card } from "@/components/ui/card";
import {
  MapPin,
  Users,
  Building2,
  Briefcase,
  Globe,
  Clock3,
} from "lucide-react";
import { formatDate, daysAgo } from "@/lib/utils";
import type { Employer } from "@/lib/supabase/types";

type CompanySnapshotProps = {
  emp: Pick<
    Employer,
    "location" | "company_size" | "industry" | "website" | "created_at"
  >;
  activeRolesCount: number;
  latestPostingDate: string | null;
};

function SnapshotRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function CompanySnapshot({
  emp,
  activeRolesCount,
  latestPostingDate,
}: CompanySnapshotProps) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-foreground">Company snapshot</h2>
      <div className="mt-4 space-y-4">
        {emp.location && (
          <SnapshotRow icon={MapPin} label="Location" value={emp.location} />
        )}
        {emp.company_size && (
          <SnapshotRow
            icon={Users}
            label="Company size"
            value={emp.company_size}
          />
        )}
        {emp.industry && (
          <SnapshotRow
            icon={Building2}
            label="Industry"
            value={emp.industry}
          />
        )}
        <SnapshotRow
          icon={Briefcase}
          label="Active roles"
          value={`${activeRolesCount} role${activeRolesCount === 1 ? "" : "s"}`}
        />
        {emp.website && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Website</p>
              <a
                href={emp.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Visit website
              </a>
            </div>
          </div>
        )}
        {latestPostingDate && (
          <SnapshotRow
            icon={Clock3}
            label="Latest posting"
            value={`${formatDate(latestPostingDate)} (${daysAgo(latestPostingDate)})`}
          />
        )}
      </div>
    </Card>
  );
}
