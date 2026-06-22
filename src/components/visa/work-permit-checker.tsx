"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, X, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSalary } from "@/lib/utils";
import { checkEligibility, type Nationality, type RoleType, type Pathway } from "@/lib/visa/eligibility";

const ROLE_TYPES: { value: RoleType; label: string }[] = [
  { value: "managerial-technical", label: "Managerial / highly technical" },
  { value: "highly-qualified", label: "Highly qualified (degree-level)" },
  { value: "other-skilled", label: "Other skilled role" },
];

function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="flex rounded-full border border-border bg-muted/50 p-1" role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            value === o.value ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{children}</label>;
}

function PathwayCard({ pathway, recommended }: { pathway: Pathway; recommended?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        recommended ? "border-accent/50 bg-gradient-to-b from-accent/[0.08] to-card" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {recommended && (
            <span className="mb-1.5 inline-block rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
              Most likely route
            </span>
          )}
          <h3 className="text-lg font-bold text-foreground">{pathway.name}</h3>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            pathway.eligible ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
          }`}
        >
          {pathway.eligible ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          {pathway.eligible ? "Likely fits" : "Doesn't fit"}
        </span>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{pathway.summary}</p>

      {recommended && (
        <ul className="mt-3 space-y-1.5">
          {pathway.requirements.map((req) => (
            <li key={req} className="flex items-start gap-2 text-sm text-foreground/80">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7a25]" aria-hidden="true" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span><strong className="font-semibold text-foreground">Timeline:</strong> {pathway.timeline}</span>
        <span><strong className="font-semibold text-foreground">Govt fee:</strong> {pathway.fee}</span>
      </div>
      <a
        href={pathway.officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-primary"
      >
        Official details on Identità <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

export default function WorkPermitChecker() {
  const [nationality, setNationality] = useState<Nationality>("non-eu");
  const [hasOffer, setHasOffer] = useState(true);
  const [grossAnnual, setGrossAnnual] = useState(45000);
  const [roleType, setRoleType] = useState<RoleType>("managerial-technical");

  const result = useMemo(
    () => checkEligibility({ nationality, hasOffer, grossAnnual, roleType }),
    [nationality, hasOffer, grossAnnual, roleType],
  );

  const showOffer = nationality === "non-eu";
  const showDetails = nationality === "non-eu" && hasOffer;

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(26,22,19,0.04),0_18px_44px_-22px_rgba(26,22,19,0.18)] sm:p-7">
          <div>
            <Label>Your nationality</Label>
            <div className="mt-2">
              <Segmented
                ariaLabel="Nationality"
                value={nationality}
                onChange={setNationality}
                options={[
                  { value: "eu", label: "EU / EEA / Swiss" },
                  { value: "non-eu", label: "Non-EU" },
                ]}
              />
            </div>
          </div>

          {showOffer && (
            <div>
              <Label>Do you have a Malta job offer?</Label>
              <div className="mt-2">
                <Segmented
                  ariaLabel="Job offer"
                  value={hasOffer ? "yes" : "no"}
                  onChange={(v) => setHasOffer(v === "yes")}
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "Not yet" },
                  ]}
                />
              </div>
            </div>
          )}

          {showDetails && (
            <>
              <div>
                <Label>Gross annual salary (the offer)</Label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3">
                  <span className="text-xl font-bold text-muted-foreground">€</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={150000}
                    value={grossAnnual}
                    onChange={(e) => setGrossAnnual(Math.max(0, Math.min(150000, Number(e.target.value) || 0)))}
                    className="w-full bg-transparent font-mono text-xl font-bold text-foreground outline-none"
                    aria-label="Gross annual salary"
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={120000}
                  step={1000}
                  value={Math.min(grossAnnual, 120000)}
                  onChange={(e) => setGrossAnnual(Number(e.target.value))}
                  className="mt-4 w-full accent-[#FFC400]"
                  aria-label="Salary slider"
                />
              </div>

              <div>
                <Label>Role type</Label>
                <select
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value as RoleType)}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-accent"
                  aria-label="Role type"
                >
                  {ROLE_TYPES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Result */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(26,22,19,0.04),0_18px_44px_-22px_rgba(26,22,19,0.18)] sm:p-7">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{result.headline}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.detail}</p>

          {result.pathways.length > 0 && (
            <div className="mt-5 space-y-3">
              {result.pathways.map((p, i) => (
                <PathwayCard key={p.id} pathway={p} recommended={i === 0} />
              ))}
            </div>
          )}

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Your next steps</p>
            <ol className="mt-2 space-y-1.5">
              {result.nextSteps.map((step, i) => (
                <li key={step} className="flex gap-2.5 text-sm text-foreground/80">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-[#141210]">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {!result.needsPermit ? null : !showDetails ? (
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="primary" size="md"><Link href="/jobs">Browse jobs</Link></Button>
              <Button asChild variant="outline" size="md"><Link href="/alerts">Set a job alert</Link></Button>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="primary" size="md" className="gap-1.5">
                <Link href="/blog/work-permit-malta-expats">Full work-permit guide <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-4xl rounded-2xl border border-warning/30 bg-warning/10 px-5 py-4 text-xs leading-relaxed text-foreground/80">
        This is approximate guidance, not legal or immigration advice. Maltese immigration rules, salary thresholds, fees,
        and processing times change frequently. Always confirm the current requirements with the official sources —{" "}
        <a href="https://identita.gov.mt" target="_blank" rel="noopener noreferrer" className="font-medium underline">Identità</a> and{" "}
        <a href="https://jobsplus.gov.mt" target="_blank" rel="noopener noreferrer" className="font-medium underline">Jobsplus</a> — before acting.
      </p>
    </section>
  );
}
