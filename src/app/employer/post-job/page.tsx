"use client";

import { useState } from "react";
import { createJob } from "@/lib/actions/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  SECTORS,
  JOB_TYPES,
  SENIORITY_LEVELS,
  REMOTE_OPTIONS,
  PRICING,
} from "@/lib/constants";
import { Sparkles, Loader2, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function PostJobPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingBias, setIsCheckingBias] = useState(false);
  const [biasResult, setBiasResult] = useState<{
    isClean: boolean;
    issues: Array<{ type: string; text: string; severity: string; explanation: string; suggestion: string }>;
    overallScore: number;
    summary: string;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await createJob(formData);
    setIsLoading(false);
    if (result?.error) {
      setError(result.error);
    }
  }

  async function generateDescription() {
    const title = (document.querySelector('[name="title"]') as HTMLInputElement)?.value;
    const sector = (document.querySelector('[name="sector"]') as HTMLSelectElement)?.value;
    const jobType = (document.querySelector('[name="jobType"]') as HTMLSelectElement)?.value;
    const seniority = (document.querySelector('[name="seniority"]') as HTMLSelectElement)?.value;
    const location = (document.querySelector('[name="location"]') as HTMLInputElement)?.value;

    if (!title) {
      setError("Please enter a job title first");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, sector, jobType, seniority, location }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate description");
        return;
      }

      const textarea = document.querySelector('[name="description"]') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = data.description;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function checkBias() {
    const title = (document.querySelector('[name="title"]') as HTMLInputElement)?.value;
    const description = (document.querySelector('[name="description"]') as HTMLTextAreaElement)?.value;
    const skills = (document.querySelector('[name="skills"]') as HTMLInputElement)?.value;
    const benefits = (document.querySelector('[name="benefits"]') as HTMLInputElement)?.value;

    const textToCheck = `${title}\n\n${description}\n\nSkills: ${skills}\n\nBenefits: ${benefits}`;

    if (!description || description.trim().length < 20) {
      setError("Please add a job description first");
      return;
    }

    setIsCheckingBias(true);
    setError(null);
    setBiasResult(null);

    try {
      const res = await fetch("/api/ai/bias-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToCheck }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to check for bias");
        return;
      }

      setBiasResult(data.analysis);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsCheckingBias(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Post a Job</h1>

      {error && (
        <div className="rounded-xl bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Job Details
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateDescription}
              isLoading={isGenerating}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI Generate
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Fill in the title and click AI Generate for a professional description
          </p>
          <div className="mt-4 space-y-4">
            <Input
              label="Job Title"
              name="title"
              placeholder="e.g. Senior Frontend Developer"
              required
            />
            <Textarea
              label="Description"
              name="description"
              placeholder="Describe the role, responsibilities, and requirements... or use AI Generate"
              required
              className="min-h-[200px]"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateDescription}
                isLoading={isGenerating}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                AI Generate
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={checkBias}
                isLoading={isCheckingBias}
              >
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                Check Bias
              </Button>
            </div>
            {biasResult && (
              <div className={`rounded-lg border p-4 ${
                biasResult.isClean
                  ? "border-success/20 bg-success/5"
                  : biasResult.overallScore >= 70
                  ? "border-warning/20 bg-warning/5"
                  : "border-error/20 bg-error/5"
              }`}>
                <div className="flex items-center gap-2">
                  {biasResult.isClean ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    Inclusivity Score: {biasResult.overallScore}/100
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{biasResult.summary}</p>
                {biasResult.issues.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {biasResult.issues.map((issue, i) => (
                      <div key={i} className="rounded-md border border-border/50 bg-background p-3">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            issue.severity === "high"
                              ? "bg-error/10 text-error"
                              : issue.severity === "medium"
                              ? "bg-warning/10 text-warning"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {issue.severity}
                          </span>
                          <span className="text-xs font-medium text-foreground">{issue.type}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          &ldquo;{issue.text}&rdquo; — {issue.explanation}
                        </p>
                        <p className="mt-1 text-xs text-success">
                          Try: &ldquo;{issue.suggestion}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Sector"
                name="sector"
                options={SECTORS.map((s) => ({ value: s, label: s }))}
                placeholder="Select sector"
                required
              />
              <Select
                label="Job Type"
                name="jobType"
                options={JOB_TYPES.map((t) => ({ value: t, label: t }))}
                placeholder="Select type"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Seniority"
                name="seniority"
                options={SENIORITY_LEVELS.map((s) => ({
                  value: s,
                  label: s,
                }))}
                placeholder="Select seniority"
              />
              <Select
                label="Remote Option"
                name="remoteType"
                options={REMOTE_OPTIONS.map((r) => ({ value: r, label: r }))}
                placeholder="Select remote option"
              />
            </div>
            <Input
              label="Location"
              name="location"
              placeholder="e.g. Sliema, Malta"
              required
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">Salary</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Minimum Salary (EUR)"
              name="salaryMin"
              type="number"
              placeholder="30000"
            />
            <Input
              label="Maximum Salary (EUR)"
              name="salaryMax"
              type="number"
              placeholder="45000"
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Skills & Benefits
          </h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Skills (comma-separated)"
              name="skills"
              placeholder="React, TypeScript, Next.js"
            />
            <Input
              label="Benefits (comma-separated)"
              name="benefits"
              placeholder="Health insurance, Remote work, Bonus"
            />
            <label className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5 text-sm backdrop-blur-sm cursor-pointer hover:border-primary/30 transition-colors">
              <input
                type="checkbox"
                name="visaFriendly"
                className="h-4 w-4 rounded border-border/60 text-primary focus:ring-primary/40"
              />
              Visa Friendly (open to work permit sponsorship)
            </label>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Application Method
          </h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Application Email"
              name="applicationEmail"
              type="email"
              placeholder="careers@company.com"
            />
            <Input
              label="Application URL"
              name="applicationUrl"
              type="url"
              placeholder="https://company.com/careers/job-123"
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Listing Type
          </h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-3 rounded-xl border border-border/60 p-4 has-[:checked]:border-primary/30 has-[:checked]:bg-primary/5 transition-all cursor-pointer">
              <input
                type="radio"
                name="listingType"
                value="standard"
                defaultChecked
                className="mt-1 h-4 w-4 border-border/60 text-primary focus:ring-primary/40"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {PRICING.standard.label}
                  </span>
                  <span className="font-mono text-lg font-bold text-foreground">
                    €{PRICING.standard.price}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {PRICING.standard.description}
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-border/60 p-4 has-[:checked]:border-primary/30 has-[:checked]:bg-primary/5 transition-all cursor-pointer">
              <input
                type="radio"
                name="listingType"
                value="featured"
                className="mt-1 h-4 w-4 border-border/60 text-primary focus:ring-primary/40"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {PRICING.featured.label}
                  </span>
                  <span className="font-mono text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    €{PRICING.featured.price}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {PRICING.featured.description}
                </p>
              </div>
            </label>
          </div>
        </Card>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          {isLoading
            ? "Creating..."
            : "Post Job"}
        </Button>
      </form>
    </div>
  );
}
