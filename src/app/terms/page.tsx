import { SITE } from "@/lib/constants";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: May 2026
      </p>

      <div className="prose prose-sm mt-6 max-w-none text-muted-foreground">
        <p>
          By using {SITE.name}, you agree to these terms. Please read them
          carefully.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Job Listings
        </h2>
        <p>
          Employers are responsible for the accuracy of their job listings.
          Listings must not contain discriminatory, misleading, or illegal
          content. We reserve the right to remove any listing that violates these
          terms.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Payments
        </h2>
        <p>
          All payments are processed through Stripe. Listings are non-refundable
          once activated. Featured listings receive homepage placement and
          priority positioning for 30 days.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          User Accounts
        </h2>
        <p>
          You are responsible for maintaining the security of your account.
          Notify us immediately of any unauthorized access.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Limitation of Liability
        </h2>
        <p>
          {SITE.name} is a platform connecting employers and job seekers. We do
          not guarantee employment outcomes or the accuracy of user-submitted
          content.
        </p>
      </div>
    </div>
  );
}
