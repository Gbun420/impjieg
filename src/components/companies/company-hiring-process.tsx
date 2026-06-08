import { Card } from "@/components/ui/card";
import { Clock3 } from "lucide-react";
import type { Employer } from "@/lib/supabase/types";

type CompanyHiringProcessProps = {
  emp: Pick<Employer, "hiring_process" | "response_time_days">;
};

export default function CompanyHiringProcess({
  emp,
}: CompanyHiringProcessProps) {
  const hasContent = emp.hiring_process || emp.response_time_days;

  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold text-foreground">
        Hiring process
      </h2>
      {hasContent ? (
        <>
          {emp.hiring_process && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {emp.hiring_process}
            </p>
          )}
          {emp.response_time_days && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4 shrink-0" />
              Expected response time:{" "}
              <span className="font-medium text-foreground">
                {emp.response_time_days} day
                {emp.response_time_days === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Hiring process details have not been added yet.
        </p>
      )}
    </Card>
  );
}
