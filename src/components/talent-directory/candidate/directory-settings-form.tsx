"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  Pause,
  Save,
  AlertTriangle,
} from "lucide-react";
import {
  optInToDirectory,
  pauseDirectory,
  leaveDirectory,
} from "@/lib/talent-directory/actions";
import {
  DISPLAY_MODES,
  TALENT_DIRECTORY_CONSENT_VERSION,
  type DisplayMode,
} from "@/lib/talent-directory/constants";
import { SECTORS, JOB_TYPES, LOCATIONS, REMOTE_OPTIONS } from "@/lib/constants";

type DirectoryProfile = {
  id: string;
  visibility_status: string;
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
  allow_contact_requests: boolean;
  allow_cv_requests: boolean;
  allow_direct_cv_download: boolean;
} | null;

type CandidateProfile = {
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  skills: string[];
  sectors: string[];
  job_types: string[];
  remote_preference: string | null;
  experience_years: number | null;
  desired_salary_min: number | null;
  desired_salary_max: number | null;
  location: string | null;
} | null;

export function DirectorySettingsForm({
  directoryProfile,
  candidateProfile,
}: {
  directoryProfile: DirectoryProfile;
  candidateProfile: CandidateProfile;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  const isSearchable = directoryProfile?.visibility_status === "searchable";

  const [form, setForm] = useState({
    displayMode: (directoryProfile?.display_mode ?? "anonymous") as DisplayMode,
    headline: directoryProfile?.headline ?? candidateProfile?.headline ?? "",
    summary: directoryProfile?.summary ?? candidateProfile?.bio ?? "",
    skills: directoryProfile?.skills ?? candidateProfile?.skills ?? [],
    sectors: directoryProfile?.sectors ?? candidateProfile?.sectors ?? [],
    jobTypes: directoryProfile?.job_types ?? candidateProfile?.job_types ?? [],
    remotePreference: directoryProfile?.remote_preference ?? candidateProfile?.remote_preference ?? "",
    experienceYears: directoryProfile?.experience_years ?? candidateProfile?.experience_years ?? null,
    desiredSalaryMin: directoryProfile?.desired_salary_min ?? candidateProfile?.desired_salary_min ?? null,
    desiredSalaryMax: directoryProfile?.desired_salary_max ?? candidateProfile?.desired_salary_max ?? null,
    availability: directoryProfile?.availability ?? "",
    allowContactRequests: directoryProfile?.allow_contact_requests ?? true,
    allowCvRequests: directoryProfile?.allow_cv_requests ?? false,
    allowDirectCvDownload: directoryProfile?.allow_direct_cv_download ?? false,
    consentToDirectory: isSearchable,
  });

  const handleOptIn = () => {
    startTransition(async () => {
      setMessage(null);
      const result = await optInToDirectory({
        ...form,
        consentToDirectory: true as const,
      });
      if (result.ok) {
        setMessage({ type: "success", text: result.message ?? "Opted in successfully" });
        setForm((prev) => ({ ...prev, consentToDirectory: true }));
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  const handlePause = () => {
    startTransition(async () => {
      setMessage(null);
      const result = await pauseDirectory();
      if (result.ok) {
        setMessage({ type: "success", text: result.message ?? "Paused" });
        setForm((prev) => ({ ...prev, consentToDirectory: false }));
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  const handleLeave = () => {
    startTransition(async () => {
      setMessage(null);
      const result = await leaveDirectory();
      if (result.ok) {
        setMessage({ type: "success", text: result.message ?? "Left directory" });
        setForm((prev) => ({ ...prev, consentToDirectory: false }));
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Directory Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure what employers can see about you
        </p>

        <div className="mt-6 space-y-5">
          {/* Display Mode */}
          <div>
            <label className="text-sm font-medium text-foreground">Display Mode</label>
            <Select
              value={form.displayMode}
              onValueChange={(v) => setForm((prev) => ({ ...prev, displayMode: v as DisplayMode }))}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anonymous">Anonymous (hidden name)</SelectItem>
                <SelectItem value="first_name">First name only</SelectItem>
                <SelectItem value="full_name">Full name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Headline */}
          <div>
            <label className="text-sm font-medium text-foreground">Headline</label>
            <Input
              className="mt-1.5"
              placeholder="e.g. Senior Frontend Developer"
              value={form.headline}
              onChange={(e) => setForm((prev) => ({ ...prev, headline: e.target.value }))}
              maxLength={140}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {form.headline.length}/140
            </p>
          </div>

          {/* Summary */}
          <div>
            <label className="text-sm font-medium text-foreground">Summary</label>
            <Textarea
              className="mt-1.5"
              placeholder="Brief description of your experience and what you're looking for..."
              value={form.summary}
              onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
              rows={4}
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {form.summary.length}/1000
            </p>
          </div>

          {/* Contact Controls */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Contact Permissions</label>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Allow contact requests</p>
                <p className="text-xs text-muted-foreground">Employers can send you contact requests</p>
              </div>
              <Switch
                checked={form.allowContactRequests}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, allowContactRequests: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Allow CV requests</p>
                <p className="text-xs text-muted-foreground">Employers can request your CV after contact</p>
              </div>
              <Switch
                checked={form.allowCvRequests}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, allowCvRequests: checked }))
                }
              />
            </div>
          </div>

          {/* Consent */}
          {!isSearchable && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Switch
                  checked={form.consentToDirectory}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, consentToDirectory: checked }))
                  }
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    I consent to be listed in the Talent Directory
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Version {TALENT_DIRECTORY_CONSENT_VERSION}. Your email, phone, and CV are never shared unless you allow it.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {message && (
            <div
              className={`rounded-lg p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!isSearchable ? (
              <Button
                onClick={handleOptIn}
                disabled={isPending || !form.consentToDirectory}
                variant="primary"
              >
                <Eye className="mr-2 h-4 w-4" />
                {isPending ? "Saving..." : "Join Directory"}
              </Button>
            ) : (
              <>
                <Button onClick={handlePause} disabled={isPending} variant="outline">
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
                {!showConfirmLeave ? (
                  <Button
                    onClick={() => setShowConfirmLeave(true)}
                    disabled={isPending}
                    variant="destructive"
                  >
                    Leave Directory
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <Button onClick={handleLeave} disabled={isPending} variant="destructive" size="sm">
                      Confirm Leave
                    </Button>
                    <Button onClick={() => setShowConfirmLeave(false)} variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
