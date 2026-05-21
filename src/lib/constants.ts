export const SITE = {
  name: "Impjieg",
  tagline: "Your next role, sorted.",
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

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
