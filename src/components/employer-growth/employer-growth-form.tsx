"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";

const INITIAL_STATE = {
  name: "",
  email: "",
  company: "",
  hiringFocus: "",
  message: "",
};

export default function EmployerGrowthForm() {
  const [form, setForm] = useState(INITIAL_STATE);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSent(false);

    if (!form.name.trim() || !form.email.trim() || !form.company.trim() || !form.message.trim()) {
      setError("Please complete the required fields before sending");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: `Employer growth sprint request - ${form.company}`,
          message: [
            `Company: ${form.company}`,
            `Hiring focus: ${form.hiringFocus || "Not specified"}`,
            "",
            form.message,
          ].join("\n"),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error || "We could not send your request");
        return;
      }

      setSent(true);
      setForm(INITIAL_STATE);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-success/20 bg-success/5 p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h3 className="mt-3 text-xl font-semibold text-foreground">Request sent</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          We&apos;ve received your growth request and will reply with the next step.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-error/20 bg-error/10 p-4 text-sm text-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Your name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Glenn Bundy"
          required
        />
        <Input
          label="Email address"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="you@company.com"
          required
        />
      </div>

      <Input
        label="Company"
        value={form.company}
        onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
        placeholder="Company name"
        required
      />

      <Input
        label="Hiring focus"
        value={form.hiringFocus}
        onChange={(e) => setForm((prev) => ({ ...prev, hiringFocus: e.target.value }))}
        placeholder="e.g. iGaming operations, digital marketing, product"
      />

      <Textarea
        label="What do you want to grow?"
        value={form.message}
        onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
        placeholder="Tell us which roles, sectors, or employer pages you want to turn into a lead channel."
        className="min-h-[180px]"
        required
      />

      <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSending}>
        <Send className="mr-2 h-4 w-4" />
        Request a Growth Sprint
      </Button>
    </form>
  );
}
