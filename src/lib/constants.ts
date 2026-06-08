export const SITE = {
  name: "Impjieg",
  title: "Impjieg — Malta's hiring signal",
  tagline: "Jobs with clearer signals.",
  description:
    "Find and hire Malta talent with clearer salary, work-mode, employer, and application signals.",
  url: process.env.NEXT_PUBLIC_URL || "https://impjieg.vercel.app",
  email: "hello@impjieg.com",
};

export const SECTORS = [
  "iGaming",
  "Technology",
  "Finance & Banking",
  "Healthcare",
  "Tourism & Hospitality",
  "Construction & Engineering",
  "Education",
  "Retail & E-commerce",
  "Legal & Compliance",
  "Marketing & Media",
  "Logistics & Transport",
  "Real Estate",
] as const;

export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
  "Temporary",
] as const;

export const SENIORITY_LEVELS = [
  "Entry Level",
  "Junior",
  "Mid Level",
  "Senior",
  "Lead",
  "Manager",
  "Director",
  "Executive",
] as const;

export const REMOTE_OPTIONS = [
  "On-site",
  "Remote",
  "Hybrid",
] as const;

export const LOCATIONS = [
  "Valletta",
  "Sliema",
  "St. Julian's",
  "Birkirkara",
  "Mosta",
  "Qormi",
  "Zabbar",
  "San Gwann",
  "Marsa",
  "Msida",
  "Attard",
  "Mgarr",
] as const;

export const PRICING = {
  standard: {
    label: "Standard",
    price: 29,
    description: "30-day listing on Impjieg",
  },
  featured: {
    label: "Featured",
    price: 59,
    description: "30-day listing + homepage feature + top of search",
  },
} as const;

// Subscription plans (monthly pricing)
export const SUBSCRIPTION_PLANS = {
  basic: {
    label: "Basic",
    price: 19, // per month
    priceAnnual: 190, // per year (2 months free)
    jobCreditsPerMonth: 2,
    features: [
      "2 job credits per month",
      "30-day active listing",
      "Visible in search results",
      "Direct candidate applications",
      "Basic analytics dashboard",
    ],
  },
  professional: {
    label: "Professional",
    price: 49, // per month
    priceAnnual: 490, // per year (2 months free)
    jobCreditsPerMonth: 5,
    features: [
      "5 job credits per month",
      "30-day active listing",
      "Visible in search results",
      "Direct candidate applications",
      "Basic analytics dashboard",
      "Priority candidate matching",
      "Social media promotion",
    ],
  },
  enterprise: {
    label: "Enterprise",
    price: 149, // per month
    priceAnnual: 1490, // per year (2 months free)
    jobCreditsPerMonth: 15,
    features: [
      "15 job credits per month",
      "30-day active listing",
      "Visible in search results",
      "Direct candidate applications",
      "Advanced analytics dashboard",
      "Priority candidate matching",
      "Social media promotion",
      "AI job description writer",
      "Bulk CSV upload",
      "PDF hiring reports",
      "Dedicated account manager",
    ],
  },
} as const;

// Credit packs (one-time purchase)
export const CREDIT_PACKS = {
  starter: {
    label: "Starter Pack",
    price: 25, // for 5 credits
    credits: 5,
    savings: "0%",
  },
  standard: {
    label: "Standard Pack",
    price: 45, // for 10 credits
    credits: 10,
    savings: "22%",
  },
  premium: {
    label: "Premium Pack",
    price: 80, // for 20 credits
    credits: 20,
    savings: "31%",
  },
} as const;

// Promotion bundles (add-ons)
export const PROMOTION_BUNDLES = {
  featuredBoost: {
    label: "Featured Boost",
    price: 15,
    description: "Get featured placement for 7 additional days",
  },
  socialPromotion: {
    label: "Social Promotion Bundle",
    price: 20,
    description: "Promote your job on LinkedIn, Twitter, and Facebook",
  },
  emailBlast: {
    label: "Email Blast",
    price: 10,
    description: "Send your job to our subscriber email list",
  },
} as const;

// Screening upsells
export const SCREENING_UPSELLS = {
  backgroundCheck: {
    label: "Background Check",
    price: 30,
    description: "Comprehensive background check for final candidates",
  },
  skillsAssessment: {
    label: "Skills Assessment",
    price: 25,
    description: "Technical skills assessment tailored to your job requirements",
  },
  referenceCheck: {
    label: "Reference Check",
    price: 20,
    description: "Professional reference verification service",
  },
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
