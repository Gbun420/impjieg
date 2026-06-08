"use client";

import { useState } from "react";
import { resetPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await resetPassword(formData);
    setIsLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {success ? (
        <div className="rounded-xl bg-success/10 p-6 text-center">
          <p className="font-medium text-success">Check your email</p>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ve sent you a password reset link. It may take a few minutes to arrive.
          </p>
          <Button asChild variant="outline">
            <Link href="/auth/login" className="mt-4 inline-block">
              Back to Sign In
            </Link>
          </Button>
        </div>
      ) : (
        <form action={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@company.com"
            required
            autoComplete="email"
          />
          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
            Send Reset Link
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
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
