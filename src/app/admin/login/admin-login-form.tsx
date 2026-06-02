"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminLogin } from "../actions";

export default function AdminLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        <form action={handleSubmit} className="space-y-4">
          <Input
            label="Admin password"
            name="password"
            type="password"
            placeholder="Enter internal access token"
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
