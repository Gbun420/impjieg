import Link from "next/link";
import { SITE } from "@/lib/constants";

const jobSeekerLinks = [
  { label: "Browse Jobs", href: "/jobs" },
  { label: "Salary Calculator", href: "/salary-calculator" },
  { label: "Job Alerts", href: "/alerts" },
  { label: "Companies", href: "/companies" },
];

const employerLinks = [
  { label: "Post a Job", href: "/employer/post-job" },
  { label: "Pricing", href: "/pricing" },
  { label: "Dashboard", href: "/employer/dashboard" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block">
              <img src="/logo.svg" alt="Impjieg" className="h-6 dark:invert" />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              {SITE.tagline}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground/50">
              Made in Malta
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Job Seekers
            </h3>
            <ul className="mt-3 space-y-2.5">
              {jobSeekerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Employers
            </h3>
            <ul className="mt-3 space-y-2.5">
              {employerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Company
            </h3>
            <ul className="mt-3 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-muted-foreground/60">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="text-xs">
            A project by{" "}
            <a
              href="https://mackmedia.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground underline hover:text-foreground transition-colors"
            >
              Mack Media
            </a>
            , built by{" "}
            <a
              href="https://dopaminedigital.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground underline hover:text-foreground transition-colors"
            >
              Dopamine Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
