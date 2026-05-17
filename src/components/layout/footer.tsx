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
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block">
              <img src="/logo.svg" alt="Impjieg" className="h-7 brightness-0 invert" />
            </Link>
            <p className="mt-4 text-sm text-primary-foreground/70">
              {SITE.tagline}
            </p>
            <p className="mt-2 text-xs text-primary-foreground/50">
              Made in Malta
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/70">
              Job Seekers
            </h3>
            <ul className="mt-4 space-y-3">
              {jobSeekerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/70">
              Employers
            </h3>
            <ul className="mt-4 space-y-3">
              {employerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/70">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/10 pt-8 text-center text-sm text-primary-foreground/50">
          &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
