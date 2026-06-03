"use client";

import { useState, Suspense } from "react";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get("message");
  const redirectUrl = searchParams.get("redirect");

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await login(formData);
    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      router.push(redirectUrl || result.redirectTo || "/candidate/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to access your candidate, employer, or admin portal
        </p>
      </div>

      {message === "signed-up" && (
        <div className="flex items-start gap-3 rounded-xl bg-success/10 p-4 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Account created successfully</p>
            <p className="mt-1 text-success/80">
              You can now sign in with your credentials.
            </p>
          </div>
        </div>
      )}

      {message === "check-email" && (
        <div className="flex items-start gap-3 rounded-xl bg-success/10 p-4 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Check your email</p>
            <p className="mt-1 text-success/80">
              Click the confirmation link we sent to activate your account.
            </p>
          </div>
        </div>
      )}

      {message === "reset-sent" && (
        <div className="flex items-start gap-3 rounded-xl bg-success/10 p-4 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Reset email sent</p>
            <p className="mt-1 text-success/80">
              Check your inbox for the password reset link.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-error/10 p-4 text-sm text-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
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
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          icon={<Lock className="h-4 w-4" />}
        />
        <div className="flex justify-end">
          <Link
            href="/auth/reset-password"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
