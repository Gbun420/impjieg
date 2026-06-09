"use client";

import { useState } from "react";
import { submitApplication } from "@/lib/actions/apply";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LegalAcknowledgementCheckboxes } from "@/components/legal/legal-acknowledgement-checkboxes";
import { CheckCircle2 } from "lucide-react";

export default function ApplyForm({
  jobId,
  employerId,
  jobTitle,
}: {
  jobId: string;
  employerId: string;
  jobTitle: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationProcessingAccepted, setApplicationProcessingAccepted] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    formData.append("jobId", jobId);
    formData.append("employerId", employerId);

    const result = await submitApplication(formData);

    setIsSubmitting(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
        <h3 className="mt-3 font-semibold text-foreground">Application Sent!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your application for {jobTitle} has been submitted successfully.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-error/10 p-3 text-sm text-error">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Full Name"
          name="candidateName"
          placeholder="John Doe"
          required
        />
        <Input
          label="Email"
          name="candidateEmail"
          type="email"
          placeholder="john@example.com"
          required
        />
      </div>

      <Input
        label="Phone (optional)"
        name="candidatePhone"
        type="tel"
        placeholder="+356 7900 0000"
      />

      <Input
        label="CV / Resume URL (optional)"
        name="cvUrl"
        type="url"
        placeholder="https://drive.google.com/..."
      />

      <Textarea
        label="Cover Letter (optional)"
        name="coverLetter"
        placeholder="Tell us why you&apos;re a great fit for this role..."
        className="min-h-[120px]"
      />

      <LegalAcknowledgementCheckboxes
        audience="applicant"
        requireApplicationProcessing
        onApplicationProcessingChange={setApplicationProcessingAccepted}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={isSubmitting}
        disabled={!applicationProcessingAccepted}
      >
        {isSubmitting ? (
          "Submitting..."
        ) : (
          "Submit Application"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Your application will be sent directly to the employer
      </p>
    </form>
  );
}
