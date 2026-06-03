"use client";

import { useState } from "react";
import { signup } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, User, Briefcase, AlertCircle, Loader2 } from "lucide-react";

type AccountType = "candidate" | "employer";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<AccountType>("employer");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await signup(formData);
    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    if (result?.success) {
      router.push(result.redirectTo || "/auth/login?message=signed-up");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          One sign-up for job seekers and employers
        </p>
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
