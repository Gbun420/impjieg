import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Search, CreditCard } from "lucide-react";
import Link from "next/link";
import { TALENT_DIRECTORY_PLANS } from "@/lib/talent-directory/constants";

export function TalentAccessGate({ employerId }: { employerId: string }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Talent Directory
        </h1>
        <p className="mt-2 text-muted-foreground">
          Unlock Malta&apos;s opt-in talent pool
        </p>
      </div>

      {/* Upsell Card */}
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <Lock className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Talent Directory Access Required
        </h2>
        <p className="mt-2 text-muted-foreground">
          Subscribe to a Talent Directory plan to search candidates who have chosen to be discoverable.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Object.entries(TALENT_DIRECTORY_PLANS).map(([key, plan]) => (
            <Card key={key} className="p-5 text-left">
              <h3 className="font-semibold text-foreground">{plan.label}</h3>
              <p className="mt-1 text-2xl font-bold text-primary">
                €{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CreditCard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="primary" className="mt-4 w-full">
                <Link href={`/employer/talent/checkout?plan=${key}`}>
                  Get Started
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </Card>

      {/* Sample Cards */}
      <div>
        <h3 className="text-center text-sm font-medium text-muted-foreground mb-4">
          Sample of discoverable candidates
        </h3>
        <div className="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
          {[
            { name: "Candidate A", headline: "Senior Developer", skills: ["React", "Node.js"] },
            { name: "Candidate B", headline: "Product Manager", skills: ["Agile", "Strategy"] },
            { name: "Candidate C", headline: "Data Analyst", skills: ["Python", "SQL"] },
          ].map((c) => (
            <Card key={c.name} className="p-4 opacity-60">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
                  <span className="text-sm font-bold text-muted-foreground">
                    {c.name.charAt(c.name.length - 1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.headline}</p>
                </div>
              </div>
              <div className="mt-2 flex gap-1">
                {c.skills.map((s) => (
                  <span key={s} className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <Search className="h-3 w-3" />
                <span className="blur-sm">Search to reveal</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
