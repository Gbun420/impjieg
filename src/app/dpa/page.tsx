import { SITE } from "@/lib/constants";

export default function DpaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Data Processing Agreement
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: May 2026
      </p>

      <div className="prose prose-sm mt-6 max-w-none text-muted-foreground">
        <p>
          This Data Processing Agreement (&quot;DPA&quot;) forms part of the
          Terms of Service between {SITE.name} (&quot;Data Controller&quot;) and
          employers/candidates using the Platform (&quot;Data Processor&quot; or
          &quot;Data Subject&quot; as applicable). It complies with Article 28
          of the EU General Data Protection Regulation (GDPR) (Regulation (EU)
          2016/679).
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          1. Definitions
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>&quot;Personal Data&quot;</strong> has the meaning given in
            Article 4(1) of the GDPR.
          </li>
          <li>
            <strong>&quot;Processing&quot;</strong> has the meaning given in
            Article 4(2) of the GDPR.
          </li>
          <li>
            <strong>&quot;Data Subject&quot;</strong> means an identified or
            identifiable natural person.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          2. Scope and Purpose
        </h2>
        <p>
          This DPA applies where {SITE.name} processes Personal Data on behalf
          of employers who post job listings and receive candidate applications.
          The purpose of Processing is to facilitate job matching, application
          management, and communication between employers and candidates.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          3. Categories of Data Subjects
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Job seekers / candidates applying for positions</li>
          <li>Employer representatives managing job listings</li>
          <li>Website visitors and users</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          4. Types of Personal Data Processed
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Identity data:</strong> Name, email address, phone number
          </li>
          <li>
            <strong>Professional data:</strong> CV/resume, work history, skills,
            qualifications, cover letters
          </li>
          <li>
            <strong>Account data:</strong> User ID, authentication credentials,
            account preferences
          </li>
          <li>
            <strong>Communication data:</strong> Messages, application notes,
            interview scheduling
          </li>
          <li>
            <strong>Technical data:</strong> IP address, device information,
            browser type (with consent)
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          5. Obligations of the Data Controller (Employer)
        </h2>
        <p>
          The employer (Data Controller) shall:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Ensure they have a lawful basis for providing Personal Data to the
            Platform
          </li>
          <li>
            Provide accurate and up-to-date information
          </li>
          <li>
            Respond to Data Subject requests (access, rectification, erasure)
            within 30 days
          </li>
          <li>
            Comply with all applicable data protection laws, including the GDPR
            and Maltese Data Protection Act
          </li>
          <li>
            Not use candidate data for purposes unrelated to the recruitment
            process
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          6. Obligations of {SITE.name}
        </h2>
        <p>
          {SITE.name} shall:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Process Personal Data only on documented instructions from the Data
            Controller
          </li>
          <li>
            Ensure persons authorised to process Personal Data are committed to
            confidentiality
          </li>
          <li>
            Implement appropriate technical and organisational security measures
          </li>
          <li>
            Assist the Data Controller in responding to Data Subject requests
          </li>
          <li>
            Notify the Data Controller of any Personal Data breach without
            undue delay
          </li>
          <li>
            Delete or return all Personal Data upon termination of services,
            unless retention is required by law
          </li>
          <li>
            Make available all information necessary to demonstrate compliance
            with this DPA
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          7. Sub-processors
        </h2>
        <p>
          {SITE.name} engages the following sub-processors to deliver its
          services:
        </p>
        <table className="mt-4 w-full border-collapse border border-border text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="border border-border px-3 py-2 text-left">
                Sub-processor
              </th>
              <th className="border border-border px-3 py-2 text-left">
                Purpose
              </th>
              <th className="border border-border px-3 py-2 text-left">
                Location
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border px-3 py-2">Supabase</td>
              <td className="border border-border px-3 py-2">
                Database & authentication
              </td>
              <td className="border border-border px-3 py-2">EU (Frankfurt)</td>
            </tr>
            <tr>
              <td className="border border-border px-3 py-2">Stripe</td>
              <td className="border border-border px-3 py-2">
                Payment processing
              </td>
              <td className="border border-border px-3 py-2">EU / Global</td>
            </tr>
            <tr>
              <td className="border border-border px-3 py-2">Resend</td>
              <td className="border border-border px-3 py-2">
                Email delivery
              </td>
              <td className="border border-border px-3 py-2">US (SCCs)</td>
            </tr>
            <tr>
              <td className="border border-border px-3 py-2">Groq</td>
              <td className="border border-border px-3 py-2">
                AI job description generation
              </td>
              <td className="border border-border px-3 py-2">US (SCCs)</td>
            </tr>
            <tr>
              <td className="border border-border px-3 py-2">Vercel</td>
              <td className="border border-border px-3 py-2">
                Application hosting
              </td>
              <td className="border border-border px-3 py-2">EU</td>
            </tr>
          </tbody>
        </table>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          8. International Transfers
        </h2>
        <p>
          Where Personal Data is transferred outside the European Economic Area
          (EEA), {SITE.name} ensures appropriate safeguards are in place through
          Standard Contractual Clauses (SCCs) adopted by the European Commission
          or an adequacy decision.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          9. Data Breach Notification
        </h2>
        <p>
          In the event of a Personal Data breach, {SITE.name} will notify the
          affected Data Controller without undue delay and, in any case, within
          72 hours of becoming aware of the breach.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          10. Audit Rights
        </h2>
        <p>
          The Data Controller has the right to audit {SITE.name}&apos;s
          compliance with this DPA, subject to reasonable notice and during
          normal business hours. Audits shall not unreasonably interfere with
          {SITE.name}&apos;s operations.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          11. Term and Termination
        </h2>
        <p>
          This DPA remains in effect for as long as {SITE.name} processes
          Personal Data on behalf of the Data Controller. Upon termination,
          {SITE.name} will, at the Data Controller&apos;s choice, delete or
          return all Personal Data, unless EU or Member State law requires
          retention.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          12. Governing Law
        </h2>
        <p>
          This DPA is governed by the laws of Malta. Any disputes shall be
          subject to the exclusive jurisdiction of the courts of Malta.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Contact
        </h2>
        <p>
          For questions about this DPA or to exercise your data protection
          rights, contact us at{" "}
          <a href={`mailto:${SITE.email}`} className="text-indigo-600 hover:underline">
            {SITE.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
