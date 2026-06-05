import Link from "next/link";
import Image from "next/image";
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
  { label: "Employer Sign in", href: "/auth/login?redirect=/employer/dashboard" },
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
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Impjieg Homepage">
              <Image src="/logo-icon.svg" alt="" width={32} height={32} className="shrink-0" aria-hidden="true" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-[1.05rem] font-semibold tracking-[-0.03em] text-foreground">
                  {SITE.name}
                </span>
                <span className="text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground">
                  {SITE.tagline}
                </span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Jobs in Malta’s tech, digital, and iGaming sectors.
            </p>
            <span className="mt-1.5 inline-flex rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[11px] font-medium tracking-[0.14em] text-muted-foreground">
              Made in Malta
            </span>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Job Seekers
            </h2>
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
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Employers
            </h2>
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
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Company
            </h2>
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

        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-foreground/80">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="text-xs">
            A project by{" "}
            <a
              href="https://mackmedia.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline hover:text-primary transition-colors"
            >
              Mack Media
            </a>
            , built by{" "}
            <a
              href="https://dopaminedigital.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline hover:text-primary transition-colors"
            >
              Dopamine Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
