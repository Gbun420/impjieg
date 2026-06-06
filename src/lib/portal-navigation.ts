export type PortalNavItem = {
  href: string;
  label: string;
};

export type PortalNavGroup = {
  label: string;
  description: string;
  items: PortalNavItem[];
};

export const candidatePortalNavGroups: PortalNavGroup[] = [
  {
    label: "Overview",
    description: "Start with the main workspace and a quick view of your activity.",
    items: [{ href: "/candidate/dashboard", label: "Dashboard" }],
  },
  {
    label: "Profile",
    description: "Keep your CV, preferences, and recommendations aligned.",
    items: [
      { href: "/candidate/profile", label: "My Profile" },
      { href: "/candidate/recommendations", label: "Recommendations" },
    ],
  },
  {
    label: "Activity",
    description: "Track applications, saved jobs, and alerts in one place.",
    items: [
      { href: "/candidate/applications", label: "Applications" },
      { href: "/candidate/alerts", label: "Job Alerts" },
      { href: "/saved-jobs", label: "Saved Jobs" },
    ],
  },
  {
    label: "Jobs",
    description: "Return to live marketplace search whenever you want.",
    items: [{ href: "/jobs", label: "Browse Jobs" }],
  },
];

export const employerPortalNavGroups: PortalNavGroup[] = [
  {
    label: "Overview",
    description: "Start with the main hiring dashboard and live activity.",
    items: [{ href: "/employer/dashboard", label: "Dashboard" }],
  },
  {
    label: "Hiring",
    description: "Move between listings, posting, and applicant review.",
    items: [
      { href: "/employer/jobs", label: "My Jobs" },
      { href: "/employer/post-job", label: "Post a Role" },
      { href: "/employer/applications", label: "Applications" },
      { href: "/employer/bulk-upload", label: "Bulk Upload" },
    ],
  },
  {
    label: "Growth",
    description: "Adjust visibility, support, and repeat-hiring options.",
    items: [
      { href: "/employer-growth", label: "Growth Tools" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    label: "Account",
    description: "Handle settings and billing-adjacent preferences.",
    items: [{ href: "/employer/settings", label: "Settings" }],
  },
];
