import { SITE } from "@/lib/constants";

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Cookie Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: May 2026
      </p>

      <div className="prose prose-sm mt-6 max-w-none text-muted-foreground">
        <p>
          This Cookie Policy explains how {SITE.name} uses cookies and similar
          technologies. It complies with the EU ePrivacy Directive (2002/58/EC
          as amended) and the GDPR requirement for explicit, informed consent.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          What Are Cookies?
        </h2>
        <p>
          Cookies are small text files stored on your device when you visit a
          website. They help the site remember your preferences, understand how
          you use the site, and enable certain features.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Types of Cookies We Use
        </h2>

        <h3 className="mt-6 text-lg font-semibold text-foreground">
          1. Necessary Cookies (Always Active)
        </h3>
        <p>
          These cookies are essential for the Platform to function. They enable
          core features such as authentication, session management, and security.
          These cookies do not require your consent under the ePrivacy Directive.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Authentication cookies:</strong> Keep you logged in and
            secure your session (Supabase auth).
          </li>
          <li>
            <strong>CSRF tokens:</strong> Protect against cross-site request
            forgery attacks.
          </li>
          <li>
            <strong>Theme preference:</strong> Remembers your light/dark mode
            selection.
          </li>
        </ul>

        <h3 className="mt-6 text-lg font-semibold text-foreground">
          2. Preference Cookies
        </h3>
        <p>
          These cookies remember your settings and preferences to provide a more
          personalised experience.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Language preference:</strong> Remembers your selected
            language.
          </li>
          <li>
            <strong>Search filters:</strong> Remembers your last search criteria.
          </li>
          <li>
            <strong>Cookie consent:</strong> Stores your cookie preferences so
            you are not asked repeatedly.
          </li>
        </ul>

        <h3 className="mt-6 text-lg font-semibold text-foreground">
          3. Analytics Cookies
        </h3>
        <p>
          These cookies help us understand how visitors interact with the
          Platform by collecting anonymous, aggregated data. This information
          is used to improve the user experience.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Page views:</strong> Which pages are visited most frequently.
          </li>
          <li>
            <strong>Session duration:</strong> How long visitors spend on the
            Platform.
          </li>
          <li>
            <strong>Referral source:</strong> How visitors found the Platform.
          </li>
        </ul>

        <h3 className="mt-6 text-lg font-semibold text-foreground">
          4. Marketing Cookies
        </h3>
        <p>
          These cookies are used to deliver relevant advertisements and measure
          the effectiveness of our marketing campaigns. They may be set by our
          advertising partners.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Ad performance:</strong> Track which ads lead to conversions.
          </li>
          <li>
            <strong>Retargeting:</strong> Show relevant ads to previous visitors
            on other websites.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Managing Your Cookie Preferences
        </h2>
        <p>
          You can manage your cookie preferences at any time:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Use the cookie consent banner that appears when you first visit the
            Platform.
          </li>
          <li>
            Adjust your preferences through your browser settings. Note that
            blocking necessary cookies may prevent the Platform from functioning
            correctly.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Third-Party Cookies
        </h2>
        <p>
          Some cookies are set by third-party services we use, including:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Stripe:</strong> Payment processing cookies (see{" "}
            <a
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              Stripe Privacy Policy
            </a>
            ).
          </li>
          <li>
            <strong>Vercel:</strong> Hosting and analytics cookies (see{" "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              Vercel Privacy Policy
            </a>
            ).
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Cookie Retention
        </h2>
        <p>
          Cookie retention periods vary:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Session cookies:</strong> Deleted when you close your browser.
          </li>
          <li>
            <strong>Persistent cookies:</strong> Retained for up to 12 months,
            unless you delete them earlier.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Contact
        </h2>
        <p>
          For questions about our use of cookies, contact us at{" "}
          <a href={`mailto:${SITE.email}`} className="text-indigo-600 hover:underline">
            {SITE.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
