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
          committed to protecting your privacy. This Privacy Policy explains how we
          collect, use, disclose, and safeguard your personal data in accordance
          with the EU General Data Protection Regulation (GDPR) (Regulation (EU)
          2016/679) and the Maltese Data Protection Act (Chapter 586 of the Laws
          of Malta).
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          1. Data Controller
        </h2>
        <p>
          The data controller responsible for your personal data is {SITE.name}.
          You can contact us at{" "}
          <a href={`mailto:${SITE.email}`} className="text-indigo-600 hover:underline">
            {SITE.email}
          </a>
          .
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          2. Information We Collect
        </h2>
        <p>We collect the following categories of personal data:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Account data:</strong> Name, email address, password (hashed),
            company name, and company details when you create an account.
          </li>
          <li>
            <strong>Profile data:</strong> CV/resume, cover letter, skills, work
            history, and preferences when you apply for jobs or create a candidate
            profile.
          </li>
          <li>
            <strong>Job listing data:</strong> Job descriptions, salary ranges,
            company information, and employer contact details.
          </li>
          <li>
            <strong>Payment data:</strong> Billing information processed securely
            through Stripe. We do not store full credit card numbers.
          </li>
          <li>
            <strong>Usage data:</strong> IP address, browser type, device
            information, pages visited, and interaction data collected via cookies
            and similar technologies (only with your explicit consent).
          </li>
          <li>
            <strong>Communication data:</strong> Messages, support requests, and
            email correspondence.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          3. Legal Basis for Processing
        </h2>
        <p>We process your personal data on the following legal bases:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Contract performance:</strong> To provide our services,
            process job applications, and manage employer listings.
          </li>
          <li>
            <strong>Legitimate interests:</strong> To improve our platform,
            prevent fraud, and ensure security.
          </li>
          <li>
            <strong>Consent:</strong> For marketing communications, analytics
            cookies, and any optional features you opt into.
          </li>
          <li>
            <strong>Legal obligation:</strong> To comply with applicable laws,
            including tax and employment regulations in Malta and the EU.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          4. How We Use Your Information
        </h2>
        <p>We use your data for the following purposes:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Creating and managing your account</li>
          <li>Processing job applications and connecting candidates with employers</li>
          <li>Publishing and managing job listings</li>
          <li>Processing payments through Stripe</li>
          <li>Sending job alerts and notifications (with your consent)</li>
          <li>Improving our services and user experience</li>
          <li>Complying with legal obligations</li>
          <li>Detecting and preventing fraud</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          5. Data Sharing and Third Parties
        </h2>
        <p>
          We do not sell your personal information. We may share data with the
          following categories of recipients:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Supabase:</strong> Database hosting and authentication
            (EU-hosted, GDPR-compliant).
          </li>
          <li>
            <strong>Stripe:</strong> Payment processing (PCI DSS compliant).
          </li>
          <li>
            <strong>Resend:</strong> Email delivery service.
          </li>
          <li>
            <strong>Groq:</strong> AI-powered job description generation
            (data is not used for model training).
          </li>
          <li>
            <strong>Vercel:</strong> Application hosting (GDPR-compliant).
          </li>
        </ul>
        <p>
          All third-party processors are bound by Data Processing Agreements (DPAs)
          and are required to process data only for the purposes specified by us.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          6. Data Retention
        </h2>
        <p>We retain your personal data for the following periods:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Account data:</strong> Retained until you delete your account
            or request erasure.
          </li>
          <li>
            <strong>Job listings:</strong> Retained for 30 days after listing
            expiry, then anonymised.
          </li>
          <li>
            <strong>Application data:</strong> Retained for 12 months after the
            application date, unless the candidate requests earlier deletion.
          </li>
          <li>
            <strong>Payment records:</strong> Retained for 7 years as required by
            Maltese tax law.
          </li>
          <li>
            <strong>Analytics data:</strong> Retained for 26 months, then
            automatically deleted.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          7. Your Rights Under GDPR
        </h2>
        <p>You have the following rights regarding your personal data:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Right of access:</strong> Request a copy of your personal data.
          </li>
          <li>
            <strong>Right to rectification:</strong> Request correction of
            inaccurate or incomplete data.
          </li>
          <li>
            <strong>Right to erasure:</strong> Request deletion of your personal
            data (&quot;right to be forgotten&quot;).
          </li>
          <li>
            <strong>Right to restrict processing:</strong> Request that we limit
            how we use your data.
          </li>
          <li>
            <strong>Right to data portability:</strong> Receive your data in a
            structured, machine-readable format.
          </li>
          <li>
            <strong>Right to object:</strong> Object to processing based on
            legitimate interests or direct marketing.
          </li>
          <li>
            <strong>Right to withdraw consent:</strong> Withdraw consent at any
            time where processing is based on consent.
          </li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href={`mailto:${SITE.email}`} className="text-indigo-600 hover:underline">
            {SITE.email}
          </a>
          . We will respond within 30 days.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          8. Cookies
        </h2>
        <p>
          We use cookies and similar technologies on our platform. Essential
          cookies are required for the site to function. Analytics and marketing
          cookies are only placed with your explicit consent. You can manage your
          cookie preferences at any time using our cookie consent banner or by
          visiting our{" "}
          <a href="/cookies" className="text-indigo-600 hover:underline">
            Cookie Preferences
          </a>{" "}
          page.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          9. International Data Transfers
        </h2>
        <p>
          Your data is primarily hosted within the European Union (EU). If any
          data is transferred outside the EU, we ensure appropriate safeguards
          are in place through Standard Contractual Clauses (SCCs) approved by
          the European Commission.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          10. Data Security
        </h2>
        <p>
          We implement appropriate technical and organisational measures to
          protect your personal data against unauthorised access, alteration,
          disclosure, or destruction. These include encryption, access controls,
          and regular security assessments.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          11. Supervisory Authority
        </h2>
        <p>
          You have the right to lodge a complaint with the Maltese Information
          and Data Protection Commissioner (IDPC) at{" "}
          <a
            href="https://idpc.org.mt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            idpc.org.mt
          </a>{" "}
          if you believe your data protection rights have been violated.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          12. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes
          will be communicated via email or a prominent notice on our platform.
          Continued use of our services after changes constitutes acceptance of
          the updated policy.
        </p>
      </div>
    </div>
  );
}
