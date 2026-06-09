"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signup } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, User, Briefcase, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { LegalAcknowledgementCheckboxes } from "@/components/legal/legal-acknowledgement-checkboxes";

type AccountType = "candidate" | "employer";

function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<AccountType>("employer");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await signup(formData);
    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    if (result?.needsConfirmation) {
      setNeedsConfirmation(true);
      setConfirmedEmail(result.email || "");
      return;
    }

    if (result?.success) {
      const loginTarget = new URL("/auth/login", window.location.origin);
      loginTarget.searchParams.set("message", "signed-up");
      if (redirectUrl) {
        loginTarget.searchParams.set("redirect", redirectUrl);
      } else if (result.redirectTo) {
        loginTarget.searchParams.set("redirect", result.redirectTo);
      }
      router.push(`${loginTarget.pathname}${loginTarget.search}`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {needsConfirmation && (
        <div className="flex items-start gap-3 rounded-xl bg-success/10 p-5 text-sm border border-success/20">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="font-semibold text-success">Account created — check your email</p>
            <p className="mt-1 text-muted-foreground">
              We sent a confirmation link to <strong>{confirmedEmail}</strong>.
              Please check your inbox and click the link to sign in.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Your legal consent has been recorded. A receipt will be sent to your email.
            </p>
          </div>
        </div>
      )}
      <div className="rounded-[1.75rem] border border-border/70 bg-[linear-gradient(135deg,#0B1220_0%,#121A2B_55%,#0F172A_100%)] p-5 text-white shadow-[0_20px_60px_rgba(11,18,32,0.14)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
              <Briefcase className="h-3.5 w-3.5" />
              Employer ready
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/75">
              Candidate friendly
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-white/55">
              Account setup
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
              Create your account
            </h1>
            <p className="max-w-xl text-sm leading-6 text-white/72">
              One sign-up for job seekers and employers, with the right workspace routing after login.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-error/10 p-4 text-sm text-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Account type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAccountType("employer")}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                accountType === "employer"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Briefcase className="mb-2 h-4 w-4" />
              Employer
            </button>
            <button
              type="button"
              onClick={() => setAccountType("candidate")}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                accountType === "candidate"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="mb-2 h-4 w-4" />
              Job seeker
            </button>
          </div>
          <input type="hidden" name="accountType" value={accountType} />
        </div>

        {accountType === "employer" ? (
          <Input
            label="Company Name"
            name="companyName"
            type="text"
            placeholder="Acme Ltd"
            required
            icon={<Building2 className="h-4 w-4" />}
          />
        ) : (
          <Input
            label="Full Name"
            name="fullName"
            type="text"
            placeholder="Jane Doe"
            required
            icon={<User className="h-4 w-4" />}
          />
        )}

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          icon={<Mail className="h-4 w-4" />}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
          icon={<Lock className="h-4 w-4" />}
          error={undefined}
        />
        <div className="-mt-2">
          <p className="text-xs text-muted-foreground">
            At least 8 characters with uppercase, lowercase, number, and special character.
          </p>
        </div>
        <LegalAcknowledgementCheckboxes
          audience={accountType === "candidate" ? "candidate" : "employer"}
          requireTerms
          requirePrivacyNotice
          allowMarketingConsent
          onTermsChange={setTermsAccepted}
          onPrivacyChange={setPrivacyAccepted}
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading || !termsAccepted || !privacyAccepted}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <Card className="border-border/70 bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Choose the right account type</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Employers get posting and hiring tools. Candidates get profiles, alerts, and saved jobs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-xs font-medium text-foreground">
              Employer dashboard
            </span>
            <span className="rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-xs font-medium text-foreground">
              Candidate dashboard
            </span>
          </div>
        </div>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Sign in
        </Link>
        {" "}or{" "}
        <Link
          href="/admin/login"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          admin login
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-border/70 bg-[linear-gradient(135deg,#0B1220_0%,#121A2B_55%,#0F172A_100%)] p-5 text-white shadow-[0_20px_60px_rgba(11,18,32,0.14)]">
            <div className="h-6 w-40 rounded bg-white/10" />
            <div className="mt-4 h-4 w-full max-w-lg rounded bg-white/10" />
          </div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
