import crypto from "node:crypto";

export const DEMO_SEED_PASSWORD = "DemoImpjieg!2026";

export function stableUuid(input: string) {
  const hash = crypto.createHash("sha256").update(input).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

export type DemoUserSeed = {
  key: string;
  email: string;
  password: string;
  accountType: "candidate" | "employer";
  userMetadata: {
    accountType: "candidate" | "employer";
    fullName?: string;
    companyName?: string;
  };
};

export type DemoEmployerSeed = {
  key: string;
  userKey: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  logoUrl: string;
  coverImageUrl: string | null;
  location: string;
  companySize: string;
  industry: string;
  cultureSummary: string;
  hiringProcess: string;
  workplaceHighlights: string[];
  responseTimeDays: number;
  isVerified: boolean;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  whatsappNumber: string | null;
};

export type DemoCandidateSeed = {
  key: string;
  userKey: string;
  profile: {
    full_name: string;
    headline: string;
    bio: string;
    phone: string;
    location: string;
    website: string;
    linkedin_url: string;
    skills: string[];
    experience_years: number;
    desired_salary_min: number;
    desired_salary_max: number;
    job_types: string[];
    sectors: string[];
    remote_preference: string;
    is_open_to_work: boolean;
  };
  cvFileName: string;
  cvFileUrl: string;
};

export type DemoJobSeed = {
  key: string;
  employerKey: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  sector: string;
  job_type: string;
  seniority: string;
  remote_type: string;
  salary_min: number;
  salary_max: number;
  skills: string[];
  benefits: string[];
  visa_friendly: boolean;
  is_featured: boolean;
  status: "active";
  expires_at: string;
  application_email: string;
  application_url: string | null;
  views: number;
  applications_count: number;
};

export type DemoApplicationSeed = {
  key: string;
  jobKey: string;
  employerKey: string;
  candidateKey: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  candidate_cv_url: string;
  cover_letter: string;
  status: "new" | "pending" | "reviewed" | "shortlisted" | "interview" | "offered" | "rejected" | "hired";
  recruiter_notes: string;
  scorecard_data: {
    matchScore: number;
    strengths: string[];
    concerns: string[];
  };
};

export type DemoCandidateApplicationSeed = {
  key: string;
  candidateKey: string;
  jobKey: string;
  applicationKey: string;
  status: "applied" | "viewed" | "shortlisted" | "interview" | "offered" | "rejected" | "withdrawn";
  notes: string;
};

export type DemoSavedJobSeed = {
  key: string;
  candidateKey: string;
  jobKey: string;
};

export type DemoAlertSeed = {
  key: string;
  email: string;
  sectors: string[];
  job_type: string | null;
  remote_type: string | null;
  salary_min: number | null;
  notification_method: "email" | "whatsapp";
  whatsapp_number: string | null;
  is_active: boolean;
};

export type DemoPaymentSeed = {
  key: string;
  employerKey: string;
  jobKey: string | null;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  stripe_payment_intent_id: string;
  stripe_checkout_session_id: string;
  listing_type: "standard" | "featured";
};

export const DEMO_USERS: DemoUserSeed[] = [
  {
    key: "employer-azure-crest",
    email: "careers@gig.com",
    password: DEMO_SEED_PASSWORD,
    accountType: "employer",
    userMetadata: { accountType: "employer", companyName: "Azure Crest Gaming" },
  },
  {
    key: "employer-harborgrid",
    email: "careers@bmit.com.mt",
    password: DEMO_SEED_PASSWORD,
    accountType: "employer",
    userMetadata: { accountType: "employer", companyName: "HarborGrid Labs" },
  },
  {
    key: "employer-northline",
    email: "careers@bov.com",
    password: DEMO_SEED_PASSWORD,
    accountType: "employer",
    userMetadata: { accountType: "employer", companyName: "Northline Capital" },
  },
  {
    key: "employer-sunstone",
    email: "careers@med-tech.world",
    password: DEMO_SEED_PASSWORD,
    accountType: "employer",
    userMetadata: { accountType: "employer", companyName: "Sunstone Health" },
  },
  {
    key: "employer-bluefin",
    email: "careers@melita.com",
    password: DEMO_SEED_PASSWORD,
    accountType: "employer",
    userMetadata: { accountType: "employer", companyName: "Bluefin Media" },
  },
  {
    key: "employer-terra-motion",
    email: "careers@maltapost.com",
    password: DEMO_SEED_PASSWORD,
    accountType: "employer",
    userMetadata: { accountType: "employer", companyName: "Terra Motion Logistics" },
  },
  {
    key: "candidate-lara",
    email: "lara.camilleri@impjieg.test",
    password: DEMO_SEED_PASSWORD,
    accountType: "candidate",
    userMetadata: { accountType: "candidate", fullName: "Lara Camilleri" },
  },
  {
    key: "candidate-jason",
    email: "jason.borg@impjieg.test",
    password: DEMO_SEED_PASSWORD,
    accountType: "candidate",
    userMetadata: { accountType: "candidate", fullName: "Jason Borg" },
  },
  {
    key: "candidate-priya",
    email: "priya.shah@impjieg.test",
    password: DEMO_SEED_PASSWORD,
    accountType: "candidate",
    userMetadata: { accountType: "candidate", fullName: "Priya Shah" },
  },
  {
    key: "candidate-omar",
    email: "omar.attard@impjieg.test",
    password: DEMO_SEED_PASSWORD,
    accountType: "candidate",
    userMetadata: { accountType: "candidate", fullName: "Omar Attard" },
  },
  {
    key: "candidate-mia",
    email: "mia.vella@impjieg.test",
    password: DEMO_SEED_PASSWORD,
    accountType: "candidate",
    userMetadata: { accountType: "candidate", fullName: "Mia Vella" },
  },
];

export const DEMO_EMPLOYERS: DemoEmployerSeed[] = [
  {
    key: "azure-crest-gaming",
    userKey: "employer-azure-crest",
    name: "Gaming Innovation Group",
    slug: "gaming-innovation-group",
    description:
      "A Malta-based iGaming technology company building platform and sportsbook solutions for regulated markets.",
    website: "https://www.gig.com/",
    logoUrl: "/demo-logos/azure-crest-gaming.svg",
    coverImageUrl: null,
    location: "St Julian's, Malta",
    companySize: "201-500",
    industry: "iGaming",
    cultureSummary:
      "Global team with a strong Malta presence, product ownership, and a focus on regulated-market delivery.",
    hiringProcess:
      "Initial recruiter screen, technical interview, and a final team conversation.",
    workplaceHighlights: [
      "Malta HQ",
      "Hybrid flexibility",
      "International product exposure",
    ],
    responseTimeDays: 2,
    isVerified: true,
    emailNotifications: true,
    whatsappNotifications: false,
    whatsappNumber: null,
  },
  {
    key: "harborgrid-labs",
    userKey: "employer-harborgrid",
    name: "BMIT Technologies",
    slug: "bmit-technologies",
    description:
      "Malta's leading data centre, cloud, and managed services provider supporting digital businesses and regulated operators.",
    website: "https://www.bmit.com.mt/",
    logoUrl: "/demo-logos/harborgrid-labs.svg",
    coverImageUrl: null,
    location: "Pembroke, Malta",
    companySize: "51-200",
    industry: "Technology",
    cultureSummary:
      "Infrastructure-first culture with strong technical ownership and an emphasis on reliable delivery.",
    hiringProcess:
      "Hiring manager conversation, technical review, and team fit interview.",
    workplaceHighlights: [
      "Malta-based infrastructure",
      "Hybrid working",
      "High-trust engineering environment",
    ],
    responseTimeDays: 1,
    isVerified: true,
    emailNotifications: true,
    whatsappNotifications: false,
    whatsappNumber: null,
  },
  {
    key: "northline-capital",
    userKey: "employer-northline",
    name: "Bank of Valletta",
    slug: "bank-of-valletta",
    description:
      "Malta's leading and oldest established bank, headquartered in Santa Venera and serving retail, business, and corporate customers.",
    website: "https://www.bov.com/",
    logoUrl: "/demo-logos/northline-capital.svg",
    coverImageUrl: null,
    location: "Santa Venera, Malta",
    companySize: "1000+",
    industry: "Finance & Banking",
    cultureSummary:
      "Structured, compliance-led environment with clear progression and significant cross-functional coordination.",
    hiringProcess:
      "Recruiter screen, manager interview, and a final case study presentation.",
    workplaceHighlights: [
      "Large-scale impact",
      "Structured career paths",
      "Hybrid schedules",
    ],
    responseTimeDays: 3,
    isVerified: false,
    emailNotifications: true,
    whatsappNotifications: true,
    whatsappNumber: "+35699110010",
  },
  {
    key: "sunstone-health",
    userKey: "employer-sunstone",
    name: "MedTech World",
    slug: "medtech-world",
    description:
      "A Malta-based medtech community and events company connecting healthcare innovators, providers, and digital health teams.",
    website: "https://med-tech.world/",
    logoUrl: "/demo-logos/sunstone-health.svg",
    coverImageUrl: null,
    location: "Valletta, Malta",
    companySize: "11-50",
    industry: "Healthcare",
    cultureSummary:
      "Mission-driven organization with a strong event-led brand and close relationships across the health-tech ecosystem.",
    hiringProcess:
      "Application review, interview with the team lead, and a practical exercise where relevant.",
    workplaceHighlights: [
      "Healthcare ecosystem exposure",
      "Regional event work",
      "Flexible collaboration",
    ],
    responseTimeDays: 4,
    isVerified: true,
    emailNotifications: true,
    whatsappNotifications: false,
    whatsappNumber: null,
  },
  {
    key: "bluefin-media",
    userKey: "employer-bluefin",
    name: "Melita",
    slug: "melita",
    description:
      "Malta's superfast home internet, TV, mobile, and telephony provider with a strong consumer and business footprint.",
    website: "https://www.melita.com/",
    logoUrl: "/demo-logos/bluefin-media.svg",
    coverImageUrl: null,
    location: "Birkirkara, Malta",
    companySize: "501-1000",
    industry: "Telecom & Media",
    cultureSummary:
      "Large-scale commercial team with fast-moving digital products and strong customer focus.",
    hiringProcess:
      "Structured screening, role-specific interview, and a final team conversation.",
    workplaceHighlights: [
      "Nationwide consumer reach",
      "Digital product exposure",
      "Hybrid flexibility",
    ],
    responseTimeDays: 2,
    isVerified: false,
    emailNotifications: true,
    whatsappNotifications: false,
    whatsappNumber: null,
  },
  {
    key: "terra-motion-logistics",
    userKey: "employer-terra-motion",
    name: "MaltaPost",
    slug: "maltapost",
    description:
      "Malta's national postal operator with a growing logistics and parcel network across the islands.",
    website: "https://www.maltapost.com/",
    logoUrl: "/demo-logos/terra-motion-logistics.svg",
    coverImageUrl: null,
    location: "Marsa, Malta",
    companySize: "501-1000",
    industry: "Logistics & Transport",
    cultureSummary:
      "Operations-heavy organisation focused on service reliability, network coverage, and customer communication.",
    hiringProcess:
      "Application screen, functional interview, and a service-focused team discussion.",
    workplaceHighlights: [
      "Island-wide reach",
      "Operational stability",
      "Service-focused work",
    ],
    responseTimeDays: 3,
    isVerified: false,
    emailNotifications: true,
    whatsappNotifications: true,
    whatsappNumber: "+35699110011",
  },
];

export const DEMO_CANDIDATES: DemoCandidateSeed[] = [
  {
    key: "candidate-lara",
    userKey: "candidate-lara",
    profile: {
      full_name: "Lara Camilleri",
      headline: "Frontend Engineer focused on polished product experiences",
      bio:
        "Lara builds accessible React interfaces with a strong eye for UX details, performance, and conversion-focused product flows.",
      phone: "+356 9911 0041",
      location: "Valletta, Malta",
      website: "https://lara-camilleri.example",
      linkedin_url: "https://www.linkedin.com/in/lara-camilleri",
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Accessibility", "Design Systems"],
      experience_years: 6,
      desired_salary_min: 38000,
      desired_salary_max: 48000,
      job_types: ["Full-time", "Contract"],
      sectors: ["Technology", "Marketing & Media"],
      remote_preference: "Hybrid",
      is_open_to_work: true,
    },
    cvFileName: "lara-camilleri-cv.html",
    cvFileUrl: "/demo-cvs/lara-camilleri.html",
  },
  {
    key: "candidate-jason",
    userKey: "candidate-jason",
    profile: {
      full_name: "Jason Borg",
      headline: "Product designer building cleaner user journeys",
      bio:
        "Jason leads product design from research to prototypes and ships pragmatic interfaces that are easy to engineer and easy to use.",
      phone: "+356 9911 0042",
      location: "Sliema, Malta",
      website: "https://jason-borg.example",
      linkedin_url: "https://www.linkedin.com/in/jason-borg",
      skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Information Architecture", "Motion"],
      experience_years: 8,
      desired_salary_min: 45000,
      desired_salary_max: 58000,
      job_types: ["Full-time", "Contract"],
      sectors: ["Technology", "Marketing & Media", "iGaming"],
      remote_preference: "Hybrid",
      is_open_to_work: true,
    },
    cvFileName: "jason-borg-cv.html",
    cvFileUrl: "/demo-cvs/jason-borg.html",
  },
  {
    key: "candidate-priya",
    userKey: "candidate-priya",
    profile: {
      full_name: "Priya Shah",
      headline: "Data analyst turning messy data into decisions",
      bio:
        "Priya builds reports, dashboards, and SQL workflows that help teams understand growth, retention, and hiring performance.",
      phone: "+356 9911 0043",
      location: "Msida, Malta",
      website: "https://priya-shah.example",
      linkedin_url: "https://www.linkedin.com/in/priya-shah",
      skills: ["SQL", "Python", "dbt", "Looker", "Excel", "A/B Analysis"],
      experience_years: 5,
      desired_salary_min: 32000,
      desired_salary_max: 42000,
      job_types: ["Full-time", "Contract"],
      sectors: ["Finance & Banking", "Technology"],
      remote_preference: "Hybrid",
      is_open_to_work: true,
    },
    cvFileName: "priya-shah-cv.html",
    cvFileUrl: "/demo-cvs/priya-shah.html",
  },
  {
    key: "candidate-omar",
    userKey: "candidate-omar",
    profile: {
      full_name: "Omar Attard",
      headline: "DevOps engineer focused on delivery and reliability",
      bio:
        "Omar improves release speed, observability, and cloud reliability with a practical approach to infrastructure and automation.",
      phone: "+356 9911 0044",
      location: "Birkirkara, Malta",
      website: "https://omar-attard.example",
      linkedin_url: "https://www.linkedin.com/in/omar-attard",
      skills: ["AWS", "Terraform", "Docker", "Kubernetes", "PostgreSQL", "GitHub Actions"],
      experience_years: 7,
      desired_salary_min: 50000,
      desired_salary_max: 65000,
      job_types: ["Full-time"],
      sectors: ["Technology", "iGaming"],
      remote_preference: "Hybrid",
      is_open_to_work: true,
    },
    cvFileName: "omar-attard-cv.html",
    cvFileUrl: "/demo-cvs/omar-attard.html",
  },
  {
    key: "candidate-mia",
    userKey: "candidate-mia",
    profile: {
      full_name: "Mia Vella",
      headline: "Compliance specialist in regulated digital businesses",
      bio:
        "Mia supports AML, KYC, and risk workflows with a clear writing style and a strong sense of operational discipline.",
      phone: "+356 9911 0045",
      location: "San Gwann, Malta",
      website: "https://mia-vella.example",
      linkedin_url: "https://www.linkedin.com/in/mia-vella",
      skills: ["AML", "KYC", "Policy Writing", "Audit Prep", "Risk Reviews", "Operations"],
      experience_years: 4,
      desired_salary_min: 30000,
      desired_salary_max: 42000,
      job_types: ["Full-time", "Contract"],
      sectors: ["Finance & Banking", "iGaming", "Legal & Compliance"],
      remote_preference: "On-site",
      is_open_to_work: true,
    },
    cvFileName: "mia-vella-cv.html",
    cvFileUrl: "/demo-cvs/mia-vella.html",
  },
];

export const DEMO_JOBS: DemoJobSeed[] = [
  {
    key: "job-harborgrid-frontend",
    employerKey: "harborgrid-labs",
    title: "Senior Frontend Engineer",
    slug: "senior-frontend-engineer",
    description:
      "Build and maintain the product surfaces for a B2B SaaS platform used by operations teams across Europe. You will shape design system components, collaborate with product and design, and improve app performance across the full customer journey.",
    location: "Sliema, Malta",
    sector: "Technology",
    job_type: "Full-time",
    seniority: "Senior",
    remote_type: "Hybrid",
    salary_min: 42000,
    salary_max: 58000,
    skills: ["React", "TypeScript", "Next.js", "Accessibility", "Design Systems"],
    benefits: ["Hybrid schedule", "Learning budget", "Private health insurance"],
    visa_friendly: true,
    is_featured: true,
    status: "active",
    expires_at: "2026-08-15T00:00:00Z",
    application_email: "careers@harborgridlabs.test",
    application_url: null,
    views: 421,
    applications_count: 12,
  },
  {
    key: "job-bluefin-designer",
    employerKey: "bluefin-media",
    title: "Product Designer",
    slug: "product-designer",
    description:
      "Design growth-focused marketing and SaaS experiences that turn complex journeys into clear, high-converting user flows. Work closely with founders and engineers to keep the product crisp and visually strong.",
    location: "Gzira, Malta",
    sector: "Marketing & Media",
    job_type: "Full-time",
    seniority: "Mid-level",
    remote_type: "Hybrid",
    salary_min: 36000,
    salary_max: 48000,
    skills: ["Figma", "User Research", "Design Systems", "Prototyping"],
    benefits: ["Hybrid schedule", "Creative ownership", "Training budget"],
    visa_friendly: false,
    is_featured: false,
    status: "active",
    expires_at: "2026-08-20T00:00:00Z",
    application_email: "opportunities@bluefinmedia.test",
    application_url: null,
    views: 286,
    applications_count: 9,
  },
  {
    key: "job-northline-data-analyst",
    employerKey: "northline-capital",
    title: "Data Analyst",
    slug: "data-analyst",
    description:
      "Own reporting, cohort analysis, and process dashboards for a regulated finance team. This role suits someone who likes SQL, structured thinking, and turning noisy operational data into clean decisions.",
    location: "St Julian's, Malta",
    sector: "Finance & Banking",
    job_type: "Full-time",
    seniority: "Mid-level",
    remote_type: "Hybrid",
    salary_min: 34000,
    salary_max: 45000,
    skills: ["SQL", "Python", "Looker", "Excel", "Data Quality"],
    benefits: ["Training support", "Hybrid options", "Annual review cycle"],
    visa_friendly: false,
    is_featured: false,
    status: "active",
    expires_at: "2026-08-12T00:00:00Z",
    application_email: "talent@northlinecapital.test",
    application_url: null,
    views: 197,
    applications_count: 7,
  },
  {
    key: "job-azure-crest-devops",
    employerKey: "azure-crest-gaming",
    title: "DevOps Engineer",
    slug: "devops-engineer",
    description:
      "Improve release reliability, observability, and infrastructure hygiene for a fast-moving iGaming platform. You will help shape deployment pipelines, Terraform modules, and production monitoring practices.",
    location: "Valletta, Malta",
    sector: "iGaming",
    job_type: "Full-time",
    seniority: "Senior",
    remote_type: "Hybrid",
    salary_min: 50000,
    salary_max: 68000,
    skills: ["AWS", "Terraform", "Docker", "Kubernetes", "PostgreSQL"],
    benefits: ["Quarterly offsites", "Strong bonus structure", "Hybrid flexibility"],
    visa_friendly: true,
    is_featured: true,
    status: "active",
    expires_at: "2026-08-22T00:00:00Z",
    application_email: "careers@azurecrestgaming.test",
    application_url: null,
    views: 612,
    applications_count: 15,
  },
  {
    key: "job-azure-crest-crm",
    employerKey: "azure-crest-gaming",
    title: "CRM Manager",
    slug: "crm-manager",
    description:
      "Lead lifecycle messaging, segmentation, and campaign execution for player retention across email and onsite channels. The role sits between data, product, and marketing and needs strong ownership.",
    location: "Valletta, Malta",
    sector: "iGaming",
    job_type: "Full-time",
    seniority: "Mid-level",
    remote_type: "Hybrid",
    salary_min: 39000,
    salary_max: 52000,
    skills: ["Lifecycle Marketing", "CRM", "Analytics", "Segmentation", "A/B Testing"],
    benefits: ["Performance bonus", "Hybrid schedule", "Modern tooling"],
    visa_friendly: true,
    is_featured: false,
    status: "active",
    expires_at: "2026-08-25T00:00:00Z",
    application_email: "careers@azurecrestgaming.test",
    application_url: null,
    views: 254,
    applications_count: 6,
  },
  {
    key: "job-sunstone-operations",
    employerKey: "sunstone-health",
    title: "Clinical Operations Manager",
    slug: "clinical-operations-manager",
    description:
      "Coordinate scheduling, service quality, and workflow improvements across a digital healthcare platform serving clinics and patients. You will balance operational detail with a clear service mindset.",
    location: "Birkirkara, Malta",
    sector: "Healthcare",
    job_type: "Full-time",
    seniority: "Senior",
    remote_type: "On-site",
    salary_min: 45000,
    salary_max: 60000,
    skills: ["Operations", "Process Improvement", "Scheduling", "Stakeholder Management"],
    benefits: ["Healthcare mission", "Stable hours", "Private health support"],
    visa_friendly: false,
    is_featured: false,
    status: "active",
    expires_at: "2026-08-18T00:00:00Z",
    application_email: "hiring@sunstonehealth.test",
    application_url: null,
    views: 188,
    applications_count: 5,
  },
  {
    key: "job-northline-compliance",
    employerKey: "northline-capital",
    title: "Compliance Analyst",
    slug: "compliance-analyst",
    description:
      "Support AML and policy operations across customer onboarding, transaction reviews, and regulatory reporting. This is a strong fit for someone who likes structured processes and careful documentation.",
    location: "St Julian's, Malta",
    sector: "Legal & Compliance",
    job_type: "Full-time",
    seniority: "Mid-level",
    remote_type: "On-site",
    salary_min: 37000,
    salary_max: 49000,
    skills: ["AML", "KYC", "Policy Writing", "Risk Reviews", "Reporting"],
    benefits: ["Career path", "Compliance tooling", "Training support"],
    visa_friendly: false,
    is_featured: false,
    status: "active",
    expires_at: "2026-08-18T00:00:00Z",
    application_email: "talent@northlinecapital.test",
    application_url: null,
    views: 163,
    applications_count: 4,
  },
  {
    key: "job-terra-motion-logistics",
    employerKey: "terra-motion-logistics",
    title: "Logistics Systems Coordinator",
    slug: "logistics-systems-coordinator",
    description:
      "Coordinate fleet workflows, customer updates, and system changes inside a transport operations team. The role suits someone who can keep detail, timelines, and communication tightly aligned.",
    location: "Marsa, Malta",
    sector: "Logistics & Transport",
    job_type: "Full-time",
    seniority: "Mid-level",
    remote_type: "On-site",
    salary_min: 32000,
    salary_max: 42000,
    skills: ["Operations", "Systems Coordination", "Customer Service", "Reporting"],
    benefits: ["Stable weekday hours", "Operational ownership", "Growth opportunity"],
    visa_friendly: false,
    is_featured: false,
    status: "active",
    expires_at: "2026-08-30T00:00:00Z",
    application_email: "hiring@terramotionlogistics.test",
    application_url: null,
    views: 144,
    applications_count: 3,
  },
  {
    key: "job-bluefin-content",
    employerKey: "bluefin-media",
    title: "Content Strategist",
    slug: "content-strategist",
    description:
      "Plan and write content that supports SEO, brand positioning, and lifecycle messaging for SaaS clients. You will work across campaign pages, blog content, and long-form editorial planning.",
    location: "Gzira, Malta",
    sector: "Marketing & Media",
    job_type: "Contract",
    seniority: "Mid-level",
    remote_type: "Remote",
    salary_min: 30000,
    salary_max: 42000,
    skills: ["Content Strategy", "SEO", "Copywriting", "Editorial Planning"],
    benefits: ["Remote flexibility", "Editorial ownership", "Fast feedback loop"],
    visa_friendly: false,
    is_featured: false,
    status: "active",
    expires_at: "2026-08-28T00:00:00Z",
    application_email: "opportunities@bluefinmedia.test",
    application_url: null,
    views: 172,
    applications_count: 5,
  },
  {
    key: "job-harborgrid-product",
    employerKey: "harborgrid-labs",
    title: "Platform Product Manager",
    slug: "platform-product-manager",
    description:
      "Own product discovery, roadmap planning, and release prioritisation for a growing SaaS platform. The role needs a strong grasp of customer needs, data, and delivery trade-offs.",
    location: "Sliema, Malta",
    sector: "Technology",
    job_type: "Full-time",
    seniority: "Senior",
    remote_type: "Hybrid",
    salary_min: 52000,
    salary_max: 70000,
    skills: ["Product Strategy", "Roadmapping", "Analytics", "Stakeholder Management"],
    benefits: ["High autonomy", "Hybrid model", "Direct founder access"],
    visa_friendly: true,
    is_featured: true,
    status: "active",
    expires_at: "2026-08-24T00:00:00Z",
    application_email: "jobs@harborgridlabs.test",
    application_url: null,
    views: 389,
    applications_count: 10,
  },
];

export const DEMO_APPLICATIONS: DemoApplicationSeed[] = [
  {
    key: "application-lara-front-end",
    jobKey: "job-harborgrid-frontend",
    employerKey: "harborgrid-labs",
    candidateKey: "candidate-lara",
    candidate_name: "Lara Camilleri",
    candidate_email: "lara.camilleri@impjieg.test",
    candidate_phone: "+356 9911 0041",
    candidate_cv_url: "/demo-cvs/lara-camilleri.html",
    cover_letter:
      "I enjoy building high-quality product surfaces and would love to help HarborGrid make complex workflows feel simple.",
    status: "shortlisted",
    recruiter_notes: "Strong design system instincts and excellent accessibility mindset.",
    scorecard_data: {
      matchScore: 92,
      strengths: ["React depth", "Accessibility", "Product thinking"],
      concerns: ["No direct B2B SaaS ownership yet"],
    },
  },
  {
    key: "application-jason-designer",
    jobKey: "job-bluefin-designer",
    employerKey: "bluefin-media",
    candidateKey: "candidate-jason",
    candidate_name: "Jason Borg",
    candidate_email: "jason.borg@impjieg.test",
    candidate_phone: "+356 9911 0042",
    candidate_cv_url: "/demo-cvs/jason-borg.html",
    cover_letter:
      "Bluefin's mix of creative work and product rigor fits the way I like to design: practical, collaborative, and conversion-aware.",
    status: "reviewed",
    recruiter_notes: "Portfolio shows strong systems thinking and solid presentation work.",
    scorecard_data: {
      matchScore: 88,
      strengths: ["Portfolio quality", "Systems thinking", "Stakeholder communication"],
      concerns: ["Needs deeper marketing analytics exposure"],
    },
  },
  {
    key: "application-priya-data",
    jobKey: "job-northline-data-analyst",
    employerKey: "northline-capital",
    candidateKey: "candidate-priya",
    candidate_name: "Priya Shah",
    candidate_email: "priya.shah@impjieg.test",
    candidate_phone: "+356 9911 0043",
    candidate_cv_url: "/demo-cvs/priya-shah.html",
    cover_letter:
      "I enjoy turning operational data into decisions, and Northline's structured environment is exactly the kind of context where I can add value quickly.",
    status: "interview",
    recruiter_notes: "Very strong SQL and reporting fundamentals.",
    scorecard_data: {
      matchScore: 90,
      strengths: ["SQL", "Dashboards", "Clear communication"],
      concerns: ["Would benefit from more regulated-finance exposure"],
    },
  },
  {
    key: "application-omar-devops",
    jobKey: "job-azure-crest-devops",
    employerKey: "azure-crest-gaming",
    candidateKey: "candidate-omar",
    candidate_name: "Omar Attard",
    candidate_email: "omar.attard@impjieg.test",
    candidate_phone: "+356 9911 0044",
    candidate_cv_url: "/demo-cvs/omar-attard.html",
    cover_letter:
      "I like modernising release pipelines and observability, and Azure Crest looks like a team that ships with high standards.",
    status: "offered",
    recruiter_notes: "Excellent infra background and clear ownership of production delivery.",
    scorecard_data: {
      matchScore: 95,
      strengths: ["AWS", "Terraform", "Delivery speed"],
      concerns: ["Compensation needs are at the top end of the range"],
    },
  },
  {
    key: "application-mia-compliance",
    jobKey: "job-northline-compliance",
    employerKey: "northline-capital",
    candidateKey: "candidate-mia",
    candidate_name: "Mia Vella",
    candidate_email: "mia.vella@impjieg.test",
    candidate_phone: "+356 9911 0045",
    candidate_cv_url: "/demo-cvs/mia-vella.html",
    cover_letter:
      "I enjoy compliance work that is practical, well documented, and aligned with operational reality instead of policy for policy's sake.",
    status: "pending",
    recruiter_notes: "Strong fit for policy and risk workflows.",
    scorecard_data: {
      matchScore: 87,
      strengths: ["AML", "KYC", "Documentation"],
      concerns: ["On-site preference may limit flexibility"],
    },
  },
  {
    key: "application-lara-content",
    jobKey: "job-bluefin-content",
    employerKey: "bluefin-media",
    candidateKey: "candidate-lara",
    candidate_name: "Lara Camilleri",
    candidate_email: "lara.camilleri@impjieg.test",
    candidate_phone: "+356 9911 0041",
    candidate_cv_url: "/demo-cvs/lara-camilleri.html",
    cover_letter:
      "I can translate product positioning into clear web content and work closely with design and engineering to keep it practical.",
    status: "new",
    recruiter_notes: "Good blend of frontend and content skills.",
    scorecard_data: {
      matchScore: 84,
      strengths: ["Web content", "Technical fluency", "Conversion focus"],
      concerns: ["Has not led a pure content strategy program yet"],
    },
  },
];

export const DEMO_CANDIDATE_APPLICATIONS: DemoCandidateApplicationSeed[] = [
  {
    key: "candidate-app-lara-front-end",
    candidateKey: "candidate-lara",
    jobKey: "job-harborgrid-frontend",
    applicationKey: "application-lara-front-end",
    status: "shortlisted",
    notes: "Strong match on frontend stack and accessibility.",
  },
  {
    key: "candidate-app-jason-designer",
    candidateKey: "candidate-jason",
    jobKey: "job-bluefin-designer",
    applicationKey: "application-jason-designer",
    status: "interview",
    notes: "Portfolio and design systems work stand out.",
  },
  {
    key: "candidate-app-priya-data",
    candidateKey: "candidate-priya",
    jobKey: "job-northline-data-analyst",
    applicationKey: "application-priya-data",
    status: "interview",
    notes: "Excellent reporting and SQL fundamentals.",
  },
  {
    key: "candidate-app-omar-devops",
    candidateKey: "candidate-omar",
    jobKey: "job-azure-crest-devops",
    applicationKey: "application-omar-devops",
    status: "offered",
    notes: "High confidence hire for infra reliability work.",
  },
  {
    key: "candidate-app-mia-compliance",
    candidateKey: "candidate-mia",
    jobKey: "job-northline-compliance",
    applicationKey: "application-mia-compliance",
    status: "applied",
    notes: "Needs on-site but otherwise a strong fit.",
  },
];

export const DEMO_SAVED_JOBS: DemoSavedJobSeed[] = [
  { key: "saved-lara-frontend", candidateKey: "candidate-lara", jobKey: "job-harborgrid-frontend" },
  { key: "saved-lara-content", candidateKey: "candidate-lara", jobKey: "job-bluefin-content" },
  { key: "saved-jason-designer", candidateKey: "candidate-jason", jobKey: "job-bluefin-designer" },
  { key: "saved-priya-data", candidateKey: "candidate-priya", jobKey: "job-northline-data-analyst" },
  { key: "saved-omar-devops", candidateKey: "candidate-omar", jobKey: "job-azure-crest-devops" },
  { key: "saved-mia-compliance", candidateKey: "candidate-mia", jobKey: "job-northline-compliance" },
];

export const DEMO_ALERTS: DemoAlertSeed[] = [
  {
    key: "alert-tech-hybrid",
    email: "tech-hybrid-alerts@impjieg.test",
    sectors: ["Technology"],
    job_type: "Full-time",
    remote_type: "Hybrid",
    salary_min: 40000,
    notification_method: "email",
    whatsapp_number: null,
    is_active: true,
  },
  {
    key: "alert-finance-data",
    email: "finance-data-alerts@impjieg.test",
    sectors: ["Finance & Banking"],
    job_type: "Full-time",
    remote_type: "Hybrid",
    salary_min: 33000,
    notification_method: "email",
    whatsapp_number: null,
    is_active: true,
  },
  {
    key: "alert-igaming-whatsapp",
    email: "igaming-whatsapp-alerts@impjieg.test",
    sectors: ["iGaming"],
    job_type: "Full-time",
    remote_type: "Hybrid",
    salary_min: 45000,
    notification_method: "whatsapp",
    whatsapp_number: "+35699119999",
    is_active: true,
  },
];

export const DEMO_PAYMENTS: DemoPaymentSeed[] = [
  {
    key: "payment-azure-featured",
    employerKey: "azure-crest-gaming",
    jobKey: "job-azure-crest-devops",
    amount: 5900,
    status: "completed",
    stripe_payment_intent_id: "pi_demo_azure_featured",
    stripe_checkout_session_id: "cs_demo_azure_featured",
    listing_type: "featured",
  },
  {
    key: "payment-harborgrid-standard",
    employerKey: "harborgrid-labs",
    jobKey: "job-harborgrid-frontend",
    amount: 2900,
    status: "completed",
    stripe_payment_intent_id: "pi_demo_harborgrid_standard",
    stripe_checkout_session_id: "cs_demo_harborgrid_standard",
    listing_type: "standard",
  },
  {
    key: "payment-bluefin-featured",
    employerKey: "bluefin-media",
    jobKey: "job-bluefin-designer",
    amount: 5900,
    status: "pending",
    stripe_payment_intent_id: "pi_demo_bluefin_featured",
    stripe_checkout_session_id: "cs_demo_bluefin_featured",
    listing_type: "featured",
  },
];
