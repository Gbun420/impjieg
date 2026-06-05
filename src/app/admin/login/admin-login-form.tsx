"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminLogin, adminVerifyMfa } from "../actions";

type AdminMfaChallengeState =
  | {
      mode: "setup";
      setupSecret: string;
      otpauthUri: string;
    }
  | {
      mode: "verify";
    };

export default function AdminLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMfaLoading, setIsMfaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaChallenge, setMfaChallenge] = useState<AdminMfaChallengeState | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await adminLogin(formData);

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    if (result?.requiresMfa) {
      if (result.mfaMode === "setup") {
        setMfaChallenge({
          mode: "setup",
          setupSecret: result.setupSecret,
          otpauthUri: result.otpauthUri,
        });
      } else {
        setMfaChallenge({ mode: "verify" });
      }
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  async function handleMfaSubmit(formData: FormData) {
    setIsMfaLoading(true);
    setError(null);

    const result = await adminVerifyMfa(formData);

    setIsMfaLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
          <Shield className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Admin console
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Restricted access for internal operations and platform oversight.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-error/20 bg-error/10 p-4 text-sm text-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="rounded-3xl border border-border/60 bg-card/90 p-6 shadow-sm backdrop-blur">
        {!mfaChallenge ? (
          <form action={handleSubmit} className="space-y-4">
            <Input
              label="Admin email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              autoComplete="email"
              icon={<Shield className="h-4 w-4" />}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your admin password"
              required
              autoComplete="current-password"
              icon={<Lock className="h-4 w-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Sign in to admin
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        ) : (
          <form action={handleMfaSubmit} className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {mfaChallenge.mode === "setup"
                  ? "Set up two-factor authentication"
                  : "Enter your authentication code"}
              </p>
              <p className="mt-1 leading-6">
                {mfaChallenge.mode === "setup"
                  ? "Add this secret to your authenticator app, then enter the 6-digit code it generates."
                  : "Use the authenticator app linked to this admin account and enter the current 6-digit code."}
              </p>
              {mfaChallenge.mode === "setup" && (
                <div className="mt-3 space-y-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Manual secret
                    </p>
                    <p className="mt-1 break-all rounded-xl border border-border/50 bg-background px-3 py-2 font-mono text-xs text-foreground">
                      {mfaChallenge.setupSecret}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      otpauth URI
                    </p>
                    <p className="mt-1 break-all rounded-xl border border-border/50 bg-background px-3 py-2 font-mono text-[11px] text-foreground">
                      {mfaChallenge.otpauthUri}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Authentication code"
              name="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="123456"
              required
              autoComplete="one-time-code"
              icon={<Lock className="h-4 w-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isMfaLoading}
            >
              Verify and continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        )}

        <div className="mt-6 rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Need the public site instead?</p>
          <p className="mt-1">
            <Link href="/" className="text-primary hover:underline">
              Return to Impjieg
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
