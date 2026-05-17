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

export default function PostJobPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await createJob(formData);
    setIsLoading(false);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Post a Job</h1>

      {error && (
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Job Details
          </h2>
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
              placeholder="Describe the role, responsibilities, and requirements..."
              required
              className="min-h-[200px]"
            />
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
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="visaFriendly"
                className="h-4 w-4 rounded border-border text-secondary focus:ring-secondary"
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
            <label className="flex items-start gap-3 rounded-lg border border-border p-4 has-[:checked]:border-secondary has-[:checked]:bg-secondary/[0.02]">
              <input
                type="radio"
                name="listingType"
                value="standard"
                defaultChecked
                className="mt-1 h-4 w-4 border-border text-secondary focus:ring-secondary"
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
            <label className="flex items-start gap-3 rounded-lg border border-border p-4 has-[:checked]:border-secondary has-[:checked]:bg-secondary/[0.02]">
              <input
                type="radio"
                name="listingType"
                value="featured"
                className="mt-1 h-4 w-4 border-border text-secondary focus:ring-secondary"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {PRICING.featured.label}
                  </span>
                  <span className="font-mono text-lg font-bold text-foreground">
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
