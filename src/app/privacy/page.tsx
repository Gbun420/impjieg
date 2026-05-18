import { SITE } from "@/lib/constants";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: May 2026
      </p>

      <div className="prose prose-sm mt-6 max-w-none text-muted-foreground">
        <p>
          {SITE.name} (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is
          committed to protecting your privacy. This policy explains how we
          collect, use, and share your personal information.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Information We Collect
        </h2>
        <p>
          We collect information you provide directly, such as your name, email
          address, and company details when you create an account or submit a job
          listing. We also collect usage data through cookies and similar
          technologies.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          How We Use Your Information
        </h2>
        <p>
          We use your information to provide and improve our services, process
          payments, send job alerts, and communicate with you about your account.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Data Sharing
        </h2>
        <p>
          We do not sell your personal information. We may share data with
          service providers (Supabase, Stripe, Resend) strictly for operational
          purposes.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Your Rights
        </h2>
        <p>
          You have the right to access, correct, or delete your personal data.
          Contact us at {SITE.email} to exercise these rights.
        </p>
      </div>
    </div>
  );
}
