"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, AlertCircle, ArrowRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminVerifyMfa } from "../../actions";

export default function AdminMfaForm({
  mode,
  email,
  qrCodeSvg,
  formattedSecret,
}: {
  mode: "login" | "setup";
  email: string;
  qrCodeSvg?: string;
  formattedSecret?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await adminVerifyMfa(formData);

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  async function handleCopySecret() {
    if (!formattedSecret) return;
    try {
      await navigator.clipboard.writeText(formattedSecret.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text for manual copy
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
          <Shield className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {mode === "setup" ? "Setup Admin MFA" : "Two-factor verification"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "setup"
            ? `Set up your secondary security factor for ${email}.`
            : `Enter the code from your authenticator app to access the admin console.`}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-error/20 bg-error/10 p-4 text-sm text-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="rounded-3xl border border-border/60 bg-card/90 p-6 shadow-sm backdrop-blur">
        {mode === "setup" && qrCodeSvg && (
          <div className="mb-6 space-y-4">
            <div className="rounded-2xl border border-border/60 bg-white p-4">
              <div
                className="mx-auto aspect-square w-48"
                dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
              />
            </div>
            {formattedSecret && (
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Manual setup key
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-background px-3 py-2 text-sm font-mono text-foreground break-all border border-border/60">
                    {formattedSecret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="shrink-0 rounded-lg border border-border/60 p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                    aria-label="Copy setup key to clipboard"
                  >
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Can&apos;t scan? Enter this key manually in your authenticator app.
                </p>
              </div>
            )}
            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground">
              <p className="font-semibold text-primary uppercase tracking-wider mb-1">How to set up</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open your authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>Scan the QR code or enter the secret manually</li>
                <li>Enter the 6-digit code below to verify and enable MFA</li>
              </ol>
            </div>
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <Input
            label="6-digit verification code"
            name="code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            pattern="[0-9]*"
            placeholder="000000"
            required
            autoFocus
            icon={<Lock className="h-4 w-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            {mode === "setup" ? "Enable & Sign in" : "Verify & Sign in"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
