"use client";

import { useState } from "react";
import { signup } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await signup(formData);
    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setEmail(formData.get("email") as string);
      if (result.needsConfirmation) {
        setNeedsConfirmation(true);
      } else {
        router.push("/auth/login?message=signed-up");
      }
    }
  }

  if (needsConfirmation) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <Mail className="h-6 w-6 text-success" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ve sent a confirmation link to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click the link to activate your account and start posting jobs.
          </p>
        </div>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/auth/login")}
          >
            Back to Sign In
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <Link
              href="/auth/signup"
              className="text-primary hover:underline"
            >
              try again
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start posting jobs on Impjieg in minutes
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-error/10 p-4 text-sm text-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <Input
          label="Company Name"
          name="companyName"
          type="text"
          placeholder="Acme Ltd"
          required
          icon={<Building2 className="h-4 w-4" />}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@company.com"
          required
          autoComplete="email"
          icon={<Mail className="h-4 w-4" />}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="At least 6 characters"
          required
          minLength={6}
          autoComplete="new-password"
          icon={<Lock className="h-4 w-4" />}
          error={undefined}
        />
        <div className="-mt-2">
          <p className="text-xs text-muted-foreground">
            Must be at least 6 characters long
          </p>
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading}
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

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
