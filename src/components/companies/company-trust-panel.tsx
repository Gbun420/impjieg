import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Briefcase, Banknote, Clock3, BarChart3 } from "lucide-react";
import type { CompanyProfileDisplay } from "@/lib/company-profile-display";

type CompanyTrustPanelProps = {
  display: CompanyProfileDisplay;
};

export default function CompanyTrustPanel({
  display,
}: CompanyTrustPanelProps) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-foreground">
        Candidate information
      </h2>
      <div className="mt-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Employer verification</p>
            <Badge variant={display.verificationVariant} className="mt-1">
              {display.verificationLabel}
            </Badge>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Hiring activity</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {display.hiringActivityLabel}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Salary transparency</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {display.salaryTransparencyDetail}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
            <Clock3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Response signal</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {display.responseLabel}
            </p>
            <p className="text-xs text-muted-foreground">
              {display.responseDetail}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Profile detail</p>
            <Badge variant={display.profileDetailVariant} className="mt-1">
              {display.profileDetailLabel}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
