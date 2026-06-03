"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Bell, CheckCircle2 } from "lucide-react";
import { SECTORS, JOB_TYPES, REMOTE_OPTIONS } from "@/lib/constants";

export default function JobAlertsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const form = new FormData(e.currentTarget);

    const response = await fetch("/api/job-alerts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.get("email"),
        sector: form.get("sector"),
        jobType: form.get("jobType"),
        remote: form.get("remote"),
        salaryMin: form.get("salaryMin"),
      }),
    });

    setIsLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error || "Failed to create alert");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
        <Card className="p-8 text-center border-primary/20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground">
            Alert Created
          </h1>
          <p className="mt-2 text-muted-foreground">
            We&apos;ll notify you when new jobs match your preferences.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Job Alerts</h1>
          <p className="text-muted-foreground">
            Get notified when new jobs match your criteria
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-xl bg-error/10 p-4 text-sm text-error">
            {error}
          </div>
        )}
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
        <Select
          label="Sector"
          name="sector"
          options={SECTORS.map((s) => ({ value: s, label: s }))}
          placeholder="Any sector"
        />
        <Select
          label="Job Type"
          name="jobType"
          options={JOB_TYPES.map((t) => ({ value: t, label: t }))}
          placeholder="Any type"
        />
        <Select
          label="Remote Option"
          name="remote"
          options={REMOTE_OPTIONS.map((r) => ({ value: r, label: r }))}
          placeholder="Any option"
        />
        <Input
          label="Minimum Salary (EUR)"
          name="salaryMin"
          type="number"
          placeholder="30000"
          min="0"
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Create Alert
        </Button>
      </form>
    </div>
  );
}
