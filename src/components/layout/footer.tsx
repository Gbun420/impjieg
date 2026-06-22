import Link from "next/link";
import { SITE } from "@/lib/constants";
import { ImpjiegLogo } from "@/components/brand";

const jobSeekerLinks = [
  { label: "Browse Jobs", href: "/jobs" },
  { label: "Salary Calculator", href: "/salary-calculator" },
  { label: "Salary Guide", href: "/salaries" },
  { label: "Work Permit Checker", href: "/work-permit-checker" },
  { label: "Job Alerts", href: "/alerts" },
  { label: "Companies", href: "/companies" },
];

const employerLinks = [
  { label: "Post a Role", href: "/employer/post-job" },
  { label: "Pricing", href: "/pricing" },
  { label: "Employer Sign in", href: "/auth/login?redirect=/employer/dashboard" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-[#14110D] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <ImpjiegLogo onDark />
            <p className="mt-3 text-sm leading-6 text-white/64">
              Malta&apos;s hiring marketplace for salary, work-mode, and employer clarity.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/45">
              Job Seekers
            </h2>
            <ul className="mt-3 space-y-2.5">
              {jobSeekerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/62 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/45">
              Employers
            </h2>
            <ul className="mt-3 space-y-2.5">
              {employerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/62 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/45">
              Company
            </h2>
            <ul className="mt-3 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/62 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-white/58 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="text-xs text-white/45">Find your next opportunity.</p>
        </div>
      </div>
    </footer>
  );
}
