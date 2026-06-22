import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of Service for Impjieg. Read our terms and conditions for posting roles and using our platform.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: May 2026
      </p>

      <div className="prose prose-sm mt-6 max-w-none text-muted-foreground">
        <p>
          By accessing or using {SITE.name} (&quot;the Platform&quot;), you agree
          to be bound by these Terms of Service (&quot;Terms&quot;). These Terms
          constitute a legally binding agreement between you and {SITE.name}.
          If you do not agree to these Terms, do not use the Platform.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          1. Acceptance of Terms
        </h2>
        <p>
          By creating an account, posting a job listing, or making a purchase on
          the Platform, you electronically accept these Terms in accordance with
          Regulation (EU) No 910/2014 (eIDAS Regulation). Your electronic
          acceptance has the same legal effect as a handwritten signature.
        </p>
        <p>
          A copy of these Terms and any subsequent contracts formed through the
          Platform will be made available to you upon request and are
          automatically generated and stored upon each transaction.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          2. Services
        </h2>
        <p>
          {SITE.name} operates as an online jobs marketplace connecting
          employers with job seekers in Malta. Our services include:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Job listing publication and management</li>
          <li>Candidate application processing</li>
          <li>Employer dashboard and applicant tracking system (ATS)</li>
          <li>AI-powered job description generation</li>
          <li>Salary calculator and market insights</li>
          <li>Job alerts and notifications</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          3. Employer Obligations
        </h2>
        <p>Employers who post job listings agree to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide accurate, truthful, and non-misleading job descriptions</li>
          <li>Comply with all applicable Maltese and EU employment laws</li>
          <li>Not post discriminatory, illegal, or fraudulent listings</li>
          <li>Include salary ranges or compensation information where required by law</li>
          <li>Respond to applications in a timely and professional manner</li>
          <li>Maintain the confidentiality of candidate information</li>
        </ul>
        <p>
          We reserve the right to remove, suspend, or reject any listing that
          violates these Terms or applicable law, without refund.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          4. Candidate Obligations
        </h2>
        <p>Job seekers who use the Platform agree to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide accurate information in applications and profiles</li>
          <li>Not submit false or misleading CVs or credentials</li>
          <li>Not use the Platform for any unlawful purpose</li>
          <li>Respect the confidentiality of any information received through the Platform</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          5. Pricing and Payments
        </h2>
        <p>
          All payments are processed securely through Stripe. Current pricing is
          as displayed on our Pricing page. Prices are in EUR (€) and include VAT
          where applicable.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Standard listing (€39):</strong> 30-day listing on the Platform.
          </li>
          <li>
            <strong>Featured listing (€69):</strong> 30-day listing with homepage
            placement and priority positioning.
          </li>
        </ul>
        <p>
          All purchases are final and non-refundable once the listing is
          activated. In the event of a technical error resulting in duplicate
          charges, contact us for a refund.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          6. Electronic Contracts (eIDAS)
        </h2>
        <p>
          In compliance with Regulation (EU) No 910/2014 (eIDAS), contracts
          formed through the Platform are legally binding electronic contracts.
          Your actions of clicking &quot;Accept&quot;, &quot;Purchase&quot;, or
          &quot;Post Role&quot; constitute your electronic signature and
          acceptance of these Terms.
        </p>
        <p>
          Each transaction generates an automatic contract record containing:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Timestamp of acceptance</li>
          <li>IP address of the accepting party</li>
          <li>Details of the service purchased</li>
          <li>Applicable Terms version at the time of acceptance</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          7. User Accounts
        </h2>
        <p>
          You are responsible for maintaining the security of your account
          credentials. Notify us immediately at{" "}
          <a href={`mailto:${SITE.email}`} className="text-indigo-600 hover:underline">
            {SITE.email}
          </a>{" "}
          of any unauthorised access or security breach.
        </p>
        <p>
          We reserve the right to suspend or terminate accounts that violate
          these Terms or engage in fraudulent activity.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          8. Intellectual Property
        </h2>
        <p>
          The Platform, including its design, code, logos, and content, is the
          intellectual property of {SITE.name}. You may not reproduce, modify,
          or distribute any part of the Platform without prior written consent.
        </p>
        <p>
          Content you submit (job listings, CVs, profiles) remains your
          intellectual property. By submitting content, you grant us a
          non-exclusive license to display and distribute it on the Platform.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          9. Limitation of Liability
        </h2>
        <p>
          {SITE.name} is a platform connecting employers and job seekers. We do
          not:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Guarantee employment outcomes or hiring success</li>
          <li>Verify the accuracy of user-submitted content</li>
          <li>Act as an employer, recruiter, or employment agency</li>
          <li>Guarantee the suitability of candidates or job listings</li>
        </ul>
        <p>
          To the maximum extent permitted by law, {SITE.name} shall not be
          liable for any indirect, incidental, special, or consequential damages
          arising from your use of the Platform.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          10. Dispute Resolution
        </h2>
        <p>
          These Terms are governed by the laws of Malta. Any disputes arising
          from these Terms shall be subject to the exclusive jurisdiction of the
          courts of Malta.
        </p>
        <p>
          Consumers retain their rights under Maltese consumer protection law.
          Nothing in these Terms limits or excludes your statutory rights.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          11. Changes to Terms
        </h2>
        <p>
          We may update these Terms from time to time. Material changes will be
          communicated via email or a prominent notice on the Platform.
          Continued use of the Platform after changes constitutes acceptance of
          the updated Terms.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          12. Contact
        </h2>
        <p>
          For questions about these Terms, contact us at{" "}
          <a href={`mailto:${SITE.email}`} className="text-indigo-600 hover:underline">
            {SITE.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
