import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FileText, LayoutGrid, PackageSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { hasValidAdminSession } from "@/lib/admin-session";

type SectionConfig = {
  title: string;
  description: string;
  summary: Array<{ label: string; value: string; note: string }>;
  highlights: Array<{ title: string; text: string }>;
};

const sectionConfigs: Record<string, SectionConfig> = {
  jobs: {
    title: "Job Management",
    description:
      "Review imported jobs, approve or reject listings, mark featured jobs, and keep public listings clean.",
    summary: [
      { label: "Live jobs", value: "—", note: "Connected after source tables are wired" },
      { label: "Pending review", value: "—", note: "Queued imports will appear here" },
      { label: "Duplicates", value: "—", note: "Duplicate candidates will be flagged here" },
    ],
    highlights: [
      { title: "Pending approvals", text: "Imported jobs that need a human check before going live." },
      { title: "Expired jobs", text: "Items to expire or remove after source or date checks." },
      { title: "Bulk actions", text: "Approve, reject, feature, and expire from one place." },
    ],
  },
  "jobs/pending": {
    title: "Pending Jobs",
    description:
      "A moderation queue for newly imported jobs that need validation before they are published.",
    summary: [
      { label: "Queue status", value: "Scaffolded", note: "Approval workflow will attach to the source tables" },
      { label: "Validation", value: "Planned", note: "Duplicate, salary, and apply-link checks come next" },
      { label: "Manual review", value: "Ready", note: "Human review is the default for new sources" },
    ],
    highlights: [
      { title: "Edit before approval", text: "Admins can normalize title, category, and company data." },
      { title: "Reject safely", text: "Rejected jobs should be logged, not silently dropped." },
      { title: "Needs review", text: "Imports remain hidden from the public board until approved." },
    ],
  },
  aggregators: {
    title: "Aggregation Console",
    description:
      "Manage source health, ingestion runs, and import quality across RSS, XML, API, ATS, and CSV sources.",
    summary: [
      { label: "Sources", value: "—", note: "Source registry is introduced in the migration" },
      { label: "Runs", value: "—", note: "Each ingest run will be recorded" },
      { label: "Errors", value: "—", note: "Broken feeds and parse failures will be logged" },
    ],
    highlights: [
      { title: "Source manager", text: "Enable or disable feeds and set per-source crawl limits." },
      { title: "Run history", text: "Track fetch/import counts, runtime, and failure patterns." },
      { title: "Health status", text: "See whether a source is healthy, degraded, or offline." },
    ],
  },
  "aggregators/sources": {
    title: "Aggregation Sources",
    description:
      "Registry for feeds, APIs, ATS endpoints, and legal scraper sources. Default to needs review until quality is proven.",
    summary: [
      { label: "Source types", value: "RSS / XML / API / ATS / CSV", note: "All supported by the foundation schema" },
      { label: "Approval mode", value: "Needs confirmation", note: "Safe default for early-stage imports" },
      { label: "Robots policy", value: "Tracked", note: "Respect for robots.txt is stored per source" },
    ],
    highlights: [
      { title: "Priority and limits", text: "Tune crawl frequency and rate limits per source." },
      { title: "Company mapping", text: "Map source company names into Impjieg employers." },
      { title: "Normalization", text: "Store the source URL, canonical URL, and external ID for dedupe." },
    ],
  },
  "aggregators/runs": {
    title: "Aggregation Runs",
    description:
      "Monitor every ingestion job with fetched, imported, rejected, duplicate, and error counts.",
    summary: [
      { label: "Run logging", value: "Enabled", note: "Runs are written to dedicated source-run rows" },
      { label: "Runtime", value: "Tracked", note: "Duration and status are persisted per run" },
      { label: "Backoff", value: "Planned", note: "Retries are part of the source model" },
    ],
    highlights: [
      { title: "Success rate", text: "Use run history to spot feed drift or parser breakage." },
      { title: "Error messages", text: "Store validation and parser errors for later triage." },
      { title: "Stale jobs", text: "Mark unseen jobs expired instead of deleting them." },
    ],
  },
  "aggregators/errors": {
    title: "Aggregation Errors",
    description:
      "Review failed imports, parse failures, validation issues, and broken source payloads.",
    summary: [
      { label: "Error log", value: "Added", note: "Failed jobs get a persistent record" },
      { label: "Payload capture", value: "Yes", note: "Raw source excerpts can be retained for triage" },
      { label: "Resolution", value: "Manual", note: "Track who resolved the issue and when" },
    ],
    highlights: [
      { title: "Source URL", text: "Capture the original source link for every failure." },
      { title: "Stack traces", text: "Persist code exceptions separately from validation failures." },
      { title: "Resolved by", text: "Record who fixed the issue and what changed." },
    ],
  },
  employers: {
    title: "Employer Management",
    description:
      "Review company profiles, verification state, claim status, and employer activity.",
    summary: [
      { label: "Verified", value: "—", note: "Verification workflow can be connected next" },
      { label: "Claimed", value: "—", note: "Company claim status should be tracked" },
      { label: "Notes", value: "—", note: "Internal moderation notes can live here" },
    ],
    highlights: [
      { title: "Merge duplicates", text: "Merge repeated company records into one canonical employer." },
      { title: "Verification", text: "Flag trusted employers for higher ranking and better trust signals." },
      { title: "Activity", text: "See company postings, featured status, and admin notes." },
    ],
  },
  companies: {
    title: "Company Directory",
    description:
      "A canonical company registry for employer branding, aliases, and Malta/iGaming presence.",
    summary: [
      { label: "Directory", value: "Scaffolded", note: "Built on the existing employers table today" },
      { label: "Aliases", value: "Planned", note: "Company aliases and source mappings belong here" },
      { label: "Verification", value: "Planned", note: "Public trust signals should stay explicit" },
    ],
    highlights: [
      { title: "Company mapping", text: "Connect imported jobs to the right canonical employer." },
      { title: "Brand assets", text: "Keep logos and cover images consistent across pages." },
      { title: "Malta presence", text: "Surface Malta office and iGaming licence notes where relevant." },
    ],
  },
  candidates: {
    title: "Candidate Directory",
    description:
      "Review users, profile completeness, saved jobs, application history, and GDPR actions.",
    summary: [
      { label: "PII", value: "Protected", note: "Only privileged admins should access candidate data" },
      { label: "Export", value: "Planned", note: "GDPR export/delete workflows should be explicit" },
      { label: "Consent", value: "Tracked", note: "Newsletter and portal consent need a clear audit trail" },
    ],
    highlights: [
      { title: "Profile completeness", text: "Spot candidates missing essential profile data." },
      { title: "Applications", text: "Review candidate applications without exposing unrelated users." },
      { title: "Data rights", text: "Support delete/export requests in a privacy-safe workflow." },
    ],
  },
  applications: {
    title: "Application Review",
    description:
      "Track applicant pipeline state, recruiter notes, scorecards, and candidate matches.",
    summary: [
      { label: "Applications", value: "Live", note: "Existing employer applications data is already in use" },
      { label: "Scorecards", value: "Supported", note: "Recruiter notes and scorecard JSON already exist" },
      { label: "Audit", value: "Needed", note: "Sensitive access should be logged next" },
    ],
    highlights: [
      { title: "Pipeline health", text: "Review backlog, shortlisted, interview, and rejection stages." },
      { title: "Recruiter notes", text: "Keep internal notes off public surfaces." },
      { title: "Access control", text: "Only the owning employer should see their applicants." },
    ],
  },
  categories: {
    title: "Category Taxonomy",
    description:
      "Manage Malta-first categories like iGaming, QA, product, data, operations, and remote-friendly roles.",
    summary: [
      { label: "Default categories", value: "Planned", note: "Migration adds the taxonomy table" },
      { label: "Sort order", value: "Supported", note: "Categories can be ranked by priority" },
      { label: "Active state", value: "Supported", note: "Disabled categories can be hidden from the public UI" },
    ],
    highlights: [
      { title: "iGaming focus", text: "Keep the taxonomy aligned to Malta hiring demand." },
      { title: "Source mapping", text: "Map source labels into Impjieg categories cleanly." },
      { title: "SEO", text: "Use consistent slugs for category pages and structured data." },
    ],
  },
  tags: {
    title: "Tag Management",
    description:
      "Maintain reusable tags for skills, tools, source labels, and Malta-specific job themes.",
    summary: [
      { label: "Tags", value: "Planned", note: "Tag table is part of the foundation migration" },
      { label: "Auto-tagging", value: "Planned", note: "Rule engine will attach tags during import" },
      { label: "Normalization", value: "Needed", note: "Keep naming consistent across sources" },
    ],
    highlights: [
      { title: "Skill tags", text: "Highlight React, Node, AML, fraud, CRM, and similar terms." },
      { title: "Source tags", text: "Annotate job provenance without cluttering public UI." },
      { title: "SEO tags", text: "Keep tag slugs clean and canonical." },
    ],
  },
  locations: {
    title: "Location Dictionary",
    description:
      "Normalize Malta cities and remote-friendly locations for search, filtering, and source mapping.",
    summary: [
      { label: "Location table", value: "Planned", note: "Migration seeds the underlying structure" },
      { label: "Malta aware", value: "Yes", note: "Mriehel, Sliema, Valletta, Birkirkara, and others can be normalized" },
      { label: "Remote flag", value: "Supported", note: "Remote and Malta-friendly remote should stay distinct" },
    ],
    highlights: [
      { title: "Canonical names", text: "Avoid duplicate spellings across public and imported jobs." },
      { title: "Country mapping", text: "Keep EUR salary and Malta geography front and center." },
      { title: "Search", text: "Power reliable filtering and SEO landing pages." },
    ],
  },
  newsletter: {
    title: "Newsletter & Digest",
    description:
      "Manage subscribers, consent, digest content, and future newsletter sponsorship slots.",
    summary: [
      { label: "Subscribers", value: "—", note: "Existing job alerts can seed the newsletter later" },
      { label: "Consent", value: "Important", note: "Unsubscribe and consent records must remain explicit" },
      { label: "Digest", value: "Planned", note: "Weekly curation and featured jobs can hook in here" },
    ],
    highlights: [
      { title: "Subscriber export", text: "Export safely without exposing private user data unnecessarily." },
      { title: "Test send", text: "Preview campaigns before sending to all subscribers." },
      { title: "Sponsorship", text: "Reserve paid placements for featured partners." },
    ],
  },
  content: {
    title: "Content & CMS",
    description:
      "Edit homepage copy, FAQs, policies, and supporting content without touching the codebase.",
    summary: [
      { label: "Homepage", value: "Planned", note: "Copy, stats, and featured blocks should be editable" },
      { label: "Policies", value: "Present", note: "Terms and privacy routes already exist" },
      { label: "Blog", value: "Present", note: "Content can be extended into a CMS later" },
    ],
    highlights: [
      { title: "Hero content", text: "Update the main conversion message without a deploy." },
      { title: "Policy pages", text: "Keep legal text separate from the application code." },
      { title: "Support content", text: "Surface contact and support information consistently." },
    ],
  },
  featured: {
    title: "Featured Jobs & Monetisation",
    description:
      "Control featured listings, promotion windows, and monetisation packages for employers.",
    summary: [
      { label: "Featured jobs", value: "Supported", note: "The jobs table already has a featured flag" },
      { label: "Pricing", value: "Present", note: "Existing payment flow can support packages" },
      { label: "Tracking", value: "Needed", note: "Clicks and impressions can be added later" },
    ],
    highlights: [
      { title: "Promotional windows", text: "Set start and end dates for featured placements." },
      { title: "Packages", text: "Bundle featured listings, boosts, and newsletter sponsorships." },
      { title: "Revenue", text: "Tie payments back to campaign records for reporting." },
    ],
  },
  payments: {
    title: "Payments & Billing",
    description:
      "Review employer payments, featured listings, subscriptions, credits, and payment health.",
    summary: [
      { label: "Payments", value: "Live", note: "Stripe-backed checkout already exists" },
      { label: "Subscriptions", value: "Planned", note: "The monetization tables are in the database" },
      { label: "Audit", value: "Needed", note: "Billing changes should be logged" },
    ],
    highlights: [
      { title: "Revenue view", text: "Show recent paid activity and outstanding payments." },
      { title: "Package controls", text: "Adjust featured and subscription entitlements safely." },
      { title: "Refunds", text: "Track refunded or failed payments with an audit trail." },
    ],
  },
  settings: {
    title: "Admin Settings",
    description:
      "Configure platform defaults, brand settings, and operational toggles for the admin team.",
    summary: [
      { label: "Site settings", value: "Planned", note: "Centralized config belongs here" },
      { label: "Audit policy", value: "Required", note: "Sensitive changes should never be silent" },
      { label: "Roles", value: "Scaffolded", note: "Admin roles table is in the schema migration" },
    ],
    highlights: [
      { title: "Feature flags", text: "Keep platform toggles in one place." },
      { title: "Brand controls", text: "Manage public branding and metadata centrally." },
      { title: "Access policy", text: "Support admin role changes and verification." },
    ],
  },
  "audit-log": {
    title: "Audit Log",
    description:
      "Every sensitive admin action should be recorded with actor, entity, before/after data, and request metadata.",
    summary: [
      { label: "Logging", value: "Added", note: "The admin_audit_logs table is now in the schema" },
      { label: "Metadata", value: "Captured", note: "IP and user-agent fields are available" },
      { label: "Retention", value: "Planned", note: "Retention policy can be layered on later" },
    ],
    highlights: [
      { title: "Who changed what", text: "Keep a clear trail for moderation and billing actions." },
      { title: "Before/after", text: "Store JSON snapshots for sensitive field changes." },
      { title: "Investigations", text: "Support post-incident review without exposing secrets." },
    ],
  },
};

function getSectionKey(section?: string[]) {
  if (!section || section.length === 0) {
    return "jobs";
  }

  return section.join("/");
}

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  if (!(await hasValidAdminSession())) {
    redirect("/admin/login");
  }

  const resolved = await params;
  const sectionKey = getSectionKey(resolved.section);
  const config = sectionConfigs[sectionKey] ?? {
    title: "Admin Section",
    description:
      "This section is scaffolded and protected. Connect it to the live data model in the next iteration.",
    summary: [
      { label: "Status", value: "Scaffolded", note: "Route exists and is protected" },
      { label: "Data wiring", value: "Planned", note: "Hook this page to the new schema tables" },
      { label: "Action", value: "Next", note: "Add the actual table queries and CRUD" },
    ],
    highlights: [
      { title: "Protected route", text: "Only internal admins can view this section." },
      { title: "Role-specific UI", text: "Each section should evolve into a task-focused console." },
      { title: "Production ready path", text: "The foundation is in place for the next pass." },
    ],
  };

  return (
    <AdminSectionShell
      title={config.title}
      description={config.description}
      activePath={`/admin/${sectionKey}`}
      eyebrow="Super admin"
    >
      <section className="grid gap-4 md:grid-cols-3">
        {config.summary.map((item) => (
          <Card key={item.label} className="p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{item.note}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">What this section will do</h2>
              <p className="text-sm text-muted-foreground">
                The UI shell exists now. The next pass should connect it to the live schema.
              </p>
            </div>
            <Badge variant="secondary">Foundation</Badge>
          </div>

          <div className="mt-5 space-y-3">
            {config.highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <PackageSearch className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Next actions</h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              Connect the matching Supabase tables to this route.
            </li>
            <li className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              Add CRUD and bulk actions once the data model is wired.
            </li>
            <li className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              Add charts and run history for source and moderation workflows.
            </li>
          </ul>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/admin/dashboard">
              <Button variant="primary" size="sm">
                Back to overview
              </Button>
            </Link>
            <Link href="/admin/jobs/pending">
              <Button variant="outline" size="sm">
                Review pending jobs
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Core navigation</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            This route shares the same protected admin shell used throughout the super-admin area.
          </p>
        </Card>
        <Card className="p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Audit trail ready</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            The new schema adds admin_audit_logs so future CRUD actions can be captured safely.
          </p>
        </Card>
      </section>

      {sectionKey === "jobs" ? (
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Approval queue</p>
            <p className="mt-1 text-xl font-semibold text-foreground">Pending review</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Show imported jobs, validation warnings, and duplicate candidates here.
            </p>
          </Card>
          <Card className="p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Featured control</p>
            <p className="mt-1 text-xl font-semibold text-foreground">Monetisation ready</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Use the jobs table to manage featured listings and premium placements.
            </p>
          </Card>
          <Card className="p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Quality control</p>
            <p className="mt-1 text-xl font-semibold text-foreground">Broken links</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add apply-link checks and stale-job cleanup in a later pass.
            </p>
          </Card>
        </section>
      ) : null}
    </AdminSectionShell>
  );
}
