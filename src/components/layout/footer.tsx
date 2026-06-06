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
    <footer className="border-t border-border bg-[#08111F] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Impjieg Homepage">
              <Image src="/logo-icon.svg" alt="" width={32} height={32} className="shrink-0" aria-hidden="true" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-[1.05rem] font-semibold tracking-[-0.03em] text-white">
                  {SITE.name}
                </span>
                <span className="text-[0.68rem] font-medium tracking-[0.18em] text-white/55">
                  {SITE.tagline}
                </span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-6 text-white/64">
              Malta&apos;s modern jobs marketplace for tech, digital, and iGaming talent.
            </p>
            <span className="mt-3 inline-flex rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#46D1BE]">
              Malta hiring signal
            </span>
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
          <p className="text-xs text-white/45">Premium hiring signals for Malta&apos;s growth sectors.</p>
        </div>
      </div>
    </footer>
  );
}
