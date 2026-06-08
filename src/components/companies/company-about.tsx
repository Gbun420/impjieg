import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Employer } from "@/lib/supabase/types";

type CompanyAboutProps = {
  emp: Pick<
    Employer,
    "description" | "culture_summary" | "workplace_highlights"
  >;
};

export default function CompanyAbout({ emp }: CompanyAboutProps) {
  const hasContent =
    emp.description || emp.culture_summary || emp.workplace_highlights?.length;

  if (!hasContent) {
    return (
      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">
          About this employer
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This employer has not added a full company description yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold text-foreground">
        About this employer
      </h2>
      {emp.description && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {emp.description}
        </p>
      )}

      {emp.culture_summary && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-foreground">
            Culture & team
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {emp.culture_summary}
          </p>
        </div>
      )}

      {emp.workplace_highlights && emp.workplace_highlights.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {emp.workplace_highlights.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
