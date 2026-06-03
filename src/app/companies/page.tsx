import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companies",
  description: "Browse companies hiring in Malta. Discover company culture, workplace highlights, and open job roles.",
};
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin } from "lucide-react";
import type { Employer } from "@/lib/supabase/types";

type EmployerWithJobRef = Employer & { jobs: { id: string }[] };

export default async function CompaniesPage() {
  const supabase = await createClient();

  const { data: employers } = await supabase
    .from("employers")
    .select(
      `*,
      jobs!inner(id)`
    )
    .order("name");

  const employerCounts = new Map<string, number>();
  if (employers) {
    (employers as EmployerWithJobRef[]).forEach((emp) => {
      if (!employerCounts.has(emp.id)) {
        employerCounts.set(emp.id, 0);
      }
      employerCounts.set(emp.id, employerCounts.get(emp.id)! + 1);
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Companies
      </h1>

      {!employers || employers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/50 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-lg font-medium text-foreground">
            No companies yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Companies will appear here once they post jobs
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(employers as EmployerWithJobRef[]).map((employer) => (
            <Link key={employer.id} href={`/companies/${employer.slug}`}>
              <Card className="group h-full p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted/50 group-hover:bg-gradient-to-br group-hover:from-primary/20 group-hover:to-secondary/20 transition-all">
                    {employer.logo_url ? (
                      <img
                        src={employer.logo_url}
                        alt={employer.name}
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground group-hover:text-primary transition-colors">
                        {employer.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {employer.name}
                    </h2>
                    {employer.location && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {employer.location}
                      </p>
                    )}
                    <Badge className="mt-2" variant="secondary">
                      {employerCounts.get(employer.id) ?? 0} open role
                      {(employerCounts.get(employer.id) ?? 0) !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
