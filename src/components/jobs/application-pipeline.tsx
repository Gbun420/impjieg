"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { updateApplicationStatus, sendCandidateEmail } from "@/lib/actions/applications";
import { deriveApplicationInsights } from "@/lib/application-insights";
import { filterApplications } from "@/lib/application-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { SCREENING_UPSELLS } from "@/lib/constants";
import {
  Mail,
  Phone,
  FileText,
  Send,
  X,
  Search,
  AlertTriangle,
  Briefcase,
  ArrowRight,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import type { Application, CandidateProfile, Json } from "@/lib/supabase/types";

const COLUMNS = [
  { id: "new", label: "New", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { id: "reviewed", label: "Reviewed", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { id: "shortlisted", label: "Shortlisted", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { id: "interview", label: "Interview", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { id: "offered", label: "Offered", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  { id: "hired", label: "Hired", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { id: "rejected", label: "Rejected", color: "bg-red-500/10 text-red-500 border-red-500/20" },
];

const EMAIL_TEMPLATES = [
  {
    id: "acknowledge",
    label: "Application Received",
    subject: "Thank you for your application - {job_title}",
    message: "Dear {candidate_name},\n\nThank you for applying for the {job_title} position at our company. We have received your application and our team is currently reviewing it.\n\nWe will get back to you within 5-7 business days regarding the next steps.\n\nBest regards,\nThe Hiring Team",
  },
  {
    id: "shortlist",
    label: "Shortlisted",
    subject: "Good news - Your application for {job_title}",
    message: "Dear {candidate_name},\n\nThank you for your interest in the {job_title} position. We were impressed by your application and would like to move forward in the hiring process.\n\nWe will be in touch shortly to discuss the next steps.\n\nBest regards,\nThe Hiring Team",
  },
  {
    id: "interview",
    label: "Interview Invitation",
    subject: "Interview Invitation - {job_title}",
    message: "Dear {candidate_name},\n\nWe would like to invite you for an interview for the {job_title} position.\n\nPlease let us know your availability for the coming week, and we will arrange a suitable time.\n\nBest regards,\nThe Hiring Team",
  },
  {
    id: "reject",
    label: "Rejection",
    subject: "Update on your application - {job_title}",
    message: "Dear {candidate_name},\n\nThank you for taking the time to apply for the {job_title} position.\n\nAfter careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.\n\nWe wish you all the best in your job search.\n\nBest regards,\nThe Hiring Team",
  },
];

const SCREENING_SERVICE_OPTIONS = [
  {
    value: "skillsAssessment",
    label: SCREENING_UPSELLS.skillsAssessment.label,
    description: "Technical validation for shortlist decisions.",
    price: `€${SCREENING_UPSELLS.skillsAssessment.price}`,
  },
  {
    value: "backgroundCheck",
    label: SCREENING_UPSELLS.backgroundCheck.label,
    description: "Use for final-stage hires where trust checks matter.",
    price: `€${SCREENING_UPSELLS.backgroundCheck.price}`,
  },
  {
    value: "referenceCheck",
    label: SCREENING_UPSELLS.referenceCheck.label,
    description: "Verify previous performance and credibility.",
    price: `€${SCREENING_UPSELLS.referenceCheck.price}`,
  },
] as const;

type AppWithJob = Application & {
  jobs: { title: string } | null;
  candidateProfile?: Pick<
    CandidateProfile,
    "headline" | "skills" | "experience_years"
  > | null;
  matchSummary?: {
    score: number;
    matchLevel: string;
    strengths: string[];
    gaps: string[];
  } | null;
  recruiterNotes?: string | null;
  scorecardData?: Json | null;
  screeningServices?: Array<{
    application_id: string;
    service_type: (typeof SCREENING_SERVICE_OPTIONS)[number]["value"];
    status: "pending" | "completed" | "failed";
    purchased_at: string;
    completed_at: string | null;
  }>;
};

function EmailModal({
  application,
  onClose,
  onSent,
}: {
  application: AppWithJob;
  onClose: () => void;
  onSent: () => void;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const subjectId = "application-email-subject";
  const messageId = "application-email-message";

  const handleTemplateSelect = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      const filledSubject = template.subject
        .replace("{job_title}", application.jobs?.title || "")
        .replace("{candidate_name}", application.candidate_name);
      const filledMessage = template.message
        .replace("{job_title}", application.jobs?.title || "")
        .replace("{candidate_name}", application.candidate_name);
      setSubject(filledSubject);
      setMessage(filledMessage);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    const mailtoUrl = `mailto:${application.candidate_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(mailtoUrl, "_blank");
    await sendCandidateEmail(application.id, subject, message);
    setIsSending(false);
    onSent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-border/50 bg-background p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Email {application.candidate_name}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted/50">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Quick Templates</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {EMAIL_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateSelect(t.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedTemplate === t.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor={subjectId} className="text-sm font-medium text-muted-foreground">
              Subject
            </label>
            <input
              id={subjectId}
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              placeholder="Email subject..."
            />
          </div>

          <div>
            <label htmlFor={messageId} className="text-sm font-medium text-muted-foreground">
              Message
            </label>
            <textarea
              id={messageId}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              placeholder="Email body..."
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              isLoading={isSending}
              disabled={!subject || !message}
              className="flex-1"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplicationCard({ app }: { app: AppWithJob }) {
  const router = useRouter();
  const [showEmail, setShowEmail] = useState(false);
  const [screeningOpen, setScreeningOpen] = useState(false);
  const [screeningType, setScreeningType] = useState<(typeof SCREENING_SERVICE_OPTIONS)[number]["value"]>(
    "skillsAssessment"
  );
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [screeningMessage, setScreeningMessage] = useState<string | null>(null);
  const [screeningError, setScreeningError] = useState<string | null>(null);
  const screeningServices = app.screeningServices ?? [];
  const selectedService =
    SCREENING_SERVICE_OPTIONS.find((option) => option.value === screeningType) ??
    SCREENING_SERVICE_OPTIONS[0];
  const hasBlockingService = screeningServices.some(
    (service) =>
      service.service_type === screeningType &&
      (service.status === "pending" || service.status === "completed")
  );

  const handleScreeningCheckout = async () => {
    setScreeningLoading(true);
    setScreeningError(null);
    setScreeningMessage(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: app.id,
          serviceType: screeningType,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to start screening checkout");
      }

      if (data?.free) {
        setScreeningMessage(data.message || "Screening request created using your credit.");
        setScreeningOpen(false);
        router.refresh();
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      throw new Error("Checkout did not return a redirect URL");
    } catch (error) {
      setScreeningError(error instanceof Error ? error.message : "Failed to start screening checkout");
    } finally {
      setScreeningLoading(false);
    }
  };

  const renderStatusBadge = (status: "pending" | "completed" | "failed") => {
    if (status === "completed") {
      return <Badge variant="success">Completed</Badge>;
    }

    if (status === "failed") {
      return <Badge variant="error">Failed</Badge>;
    }

    return <Badge variant="warning">Pending</Badge>;
  };

  return (
    <>
      <div className="group rounded-xl border border-border/50 bg-card/50 p-3 transition-all hover:border-primary/20 hover:shadow-sm">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{app.candidate_name}</p>
            <p className="text-xs text-muted-foreground truncate">{app.jobs?.title}</p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowEmail(true)}
              className="rounded-lg p-1 hover:bg-muted/50"
              title="Send email"
            >
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {app.candidate_email}
          </span>
          {app.candidate_phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {app.candidate_phone}
            </span>
          )}
        </div>

        {app.cover_letter && (
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
            {app.cover_letter}
          </p>
        )}

        {app.candidateProfile?.headline && (
          <p className="mt-2 text-xs text-foreground/80">
            {app.candidateProfile.headline}
          </p>
        )}

        {app.matchSummary && (
          <div className="mt-2 rounded-lg bg-muted/40 p-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-muted-foreground">Profile fit</span>
              <Badge
                variant={
                  app.matchSummary.matchLevel === "Excellent"
                    ? "success"
                    : app.matchSummary.matchLevel === "Good"
                      ? "default"
                      : app.matchSummary.matchLevel === "Fair"
                        ? "warning"
                        : "secondary"
                }
                className="text-[10px]"
              >
                {app.matchSummary.score}% {app.matchSummary.matchLevel}
              </Badge>
            </div>
            {app.matchSummary.strengths.length > 0 && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {app.matchSummary.strengths.slice(0, 2).join(" · ")}
              </p>
            )}
          </div>
        )}

        {app.recruiterNotes && (
          <div className="mt-2 rounded-lg bg-muted/40 p-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-muted-foreground">Recruiter Notes</span>
              <Badge variant="secondary" className="text-[10px]">
                Has Notes
              </Badge>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
              {app.recruiterNotes}
            </p>
          </div>
        )}

        <div className="mt-2 rounded-xl border border-border/60 bg-background/70 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Screening
              </p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                Attach a candidate-specific screening order to this application.
              </p>
            </div>
            <Button
              type="button"
              variant={screeningOpen ? "secondary" : "outline"}
              size="sm"
              onClick={() => setScreeningOpen((value) => !value)}
              className="shrink-0"
            >
              <ShieldCheck className="mr-1.5 h-4 w-4" />
              {screeningOpen ? "Close" : "Order screening"}
            </Button>
          </div>

          {screeningServices.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {screeningServices.map((service) => {
                const serviceLabel =
                  SCREENING_SERVICE_OPTIONS.find((option) => option.value === service.service_type)?.label ??
                  service.service_type;

                return (
                  <span
                    key={`${service.application_id}-${service.service_type}-${service.purchased_at}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-foreground"
                  >
                    {serviceLabel}
                    {renderStatusBadge(service.status)}
                  </span>
                );
              })}
            </div>
          )}

          {screeningOpen && (
            <div className="mt-4 space-y-3">
              <Select
                label="Check type"
                value={screeningType}
                onChange={(event) =>
                  setScreeningType(event.target.value as (typeof SCREENING_SERVICE_OPTIONS)[number]["value"])
                }
                options={SCREENING_SERVICE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: `${option.label} · ${option.price}`,
                }))}
              />

              <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <p className="text-sm font-semibold text-foreground">{selectedService.label}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{selectedService.description}</p>
                <p className="mt-2 text-xs font-medium text-foreground">{selectedService.price} per application</p>
              </div>

              {hasBlockingService && (
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
                  This application already has an active {selectedService.label.toLowerCase()} order.
                </div>
              )}

              {screeningMessage && (
                <div className="rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">
                  {screeningMessage}
                </div>
              )}

              {screeningError && (
                <div className="rounded-xl border border-error/20 bg-error/10 p-3 text-sm text-error">
                  {screeningError}
                </div>
              )}

              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full"
                onClick={handleScreeningCheckout}
                disabled={screeningLoading || hasBlockingService}
                isLoading={screeningLoading}
              >
                Continue to checkout
              </Button>
              <p className="text-[11px] leading-5 text-muted-foreground">
                Screening stays attached to this application so the order remains linked to the candidate record.
              </p>
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatDate(app.created_at)}
          </span>
          {app.candidate_cv_url && (
            <a
              href={app.candidate_cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
            >
              <FileText className="h-3 w-3" />
              CV
            </a>
          )}
        </div>
      </div>

      {showEmail && (
        <EmailModal
          application={app}
          onClose={() => setShowEmail(false)}
          onSent={() => setShowEmail(false)}
        />
      )}
    </>
  );
}

function KanbanColumn({
  column,
  applications,
  onDrop,
  emptyHint,
}: {
  column: (typeof COLUMNS)[number];
  applications: AppWithJob[];
  onDrop: (appId: string, newStatus: string) => void;
  emptyHint: string;
}) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const appId = e.dataTransfer.getData("applicationId");
      if (appId) {
        onDrop(appId, column.id);
      }
    },
    [column.id, onDrop]
  );

  return (
    <div
      className="flex min-h-[400px] flex-col rounded-2xl border border-border/30 bg-muted/10"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={`sticky top-0 rounded-t-2xl border-b border-border/30 p-3 ${column.color}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{column.label}</span>
          <Badge variant="secondary" className="text-xs">
            {applications.length}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2">
        {applications.map((app) => (
          <div
            key={app.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("applicationId", app.id);
            }}
          >
            <ApplicationCard app={app} />
          </div>
        ))}

        {applications.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-background/60 px-3 py-8 text-center text-xs text-muted-foreground">
            <ArrowUpRight className="mb-2 h-4 w-4 text-primary/60" aria-hidden="true" />
            <span className="font-medium text-foreground/80">Awaiting candidates</span>
            <span className="mt-1 max-w-[12rem] leading-relaxed">{emptyHint}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationsPage({
  applications,
}: {
  applications: AppWithJob[];
}) {
  const [apps, setApps] = useState(applications);
  const [search, setSearch] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const insights = deriveApplicationInsights(apps);
  const filteredApps = filterApplications(apps, { search, attentionOnly });

  const handleDrop = async (appId: string, newStatus: string) => {
    const result = await updateApplicationStatus(appId, newStatus);
    if (result.success) {
      setApps((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/50 bg-card/60 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Hiring pipeline
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Application Pipeline
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Drag candidates between stages to track progress through your hiring pipeline.
            </p>
            {apps.length === 0 && (
              <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Briefcase className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">No applications yet</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Post a role to start seeing candidates here, then move them through New,
                      Reviewed, Shortlisted, Interview, Offered, Hired, and Rejected as your pipeline grows.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link href="/employer/post-job">
                        <Button variant="primary" size="sm">
                          Post a Role
                        </Button>
                      </Link>
                      <Link href="/employer/jobs">
                        <Button variant="outline" size="sm">
                          View My Jobs
                          <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3 lg:min-w-[22rem] lg:text-right">
            <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{apps.length}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Stale new</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{insights.staleNewApplications}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Avg first action</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {insights.averageFirstActionHours !== null ? `${insights.averageFirstActionHours}h` : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates, emails, or job titles"
          />
        </div>
        <Button
          variant={attentionOnly ? "primary" : "outline"}
          size="sm"
          onClick={() => setAttentionOnly((value) => !value)}
        >
          <AlertTriangle className="mr-1.5 h-4 w-4" />
          {attentionOnly ? "Showing Needs Attention" : "Filter Needs Attention"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            applications={filteredApps.filter((a) => a.status === column.id)}
            onDrop={handleDrop}
            emptyHint="Applications will appear here after you post a live job."
          />
        ))}
      </div>
    </div>
  );
}
