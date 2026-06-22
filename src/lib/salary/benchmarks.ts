/**
 * Approximate Malta salary benchmarks per role, powering the /salaries hub and
 * the programmatic "{Role} Salary in Malta" pages.
 *
 * ⚠️ ILLUSTRATIVE ONLY. Ranges are typical approximate gross annual figures for
 * Malta in 2026, anchored to the published sector salary guides — they are NOT
 * official statistics and vary widely by employer, experience, and skills. They
 * must always be presented as approximate, with a link to official sources for
 * tax/visa specifics.
 *
 * `low`  ≈ entry / junior gross annual (€)
 * `mid`  ≈ typical mid-level gross annual (€)
 * `high` ≈ experienced / senior gross annual (€)
 */

export interface SalaryBenchmark {
  slug: string;
  role: string;
  /** Proper-cased sector label (matches SECTORS in constants.ts). */
  sector: string;
  /** Sector slug for linking to /jobs/sector/{slug}. */
  sectorSlug: string;
  low: number;
  mid: number;
  high: number;
  /** 1–2 sentence, role-specific intro (also used as the meta description seed). */
  blurb: string;
  /** Common skills / sub-areas employers ask for. */
  skills: string[];
}

export const SALARY_BENCHMARKS: SalaryBenchmark[] = [
  // ---- Technology ----
  {
    slug: "software-engineer",
    role: "Software Engineer",
    sector: "Technology",
    sectorSlug: "technology",
    low: 28000,
    mid: 48000,
    high: 80000,
    blurb:
      "Software engineers are among Malta's most in-demand professionals, recruited heavily by iGaming, fintech, and product companies. English-first workplaces and a structural skills gap mean specialist experience is well rewarded.",
    skills: ["JavaScript / TypeScript", "Python or Java/.NET", "Cloud (AWS/GCP/Azure)", "APIs & databases", "CI/CD"],
  },
  {
    slug: "frontend-developer",
    role: "Frontend Developer",
    sector: "Technology",
    sectorSlug: "technology",
    low: 28000,
    mid: 45000,
    high: 70000,
    blurb:
      "Frontend developers build the player-facing and product interfaces that Malta's gaming and SaaS firms depend on. React and modern tooling skills command the upper end of the range.",
    skills: ["React / Vue", "TypeScript", "HTML & CSS", "Accessibility", "Testing"],
  },
  {
    slug: "backend-developer",
    role: "Backend Developer",
    sector: "Technology",
    sectorSlug: "technology",
    low: 32000,
    mid: 52000,
    high: 78000,
    blurb:
      "Backend developers power the real-time platforms, payments, and data systems behind Malta's gaming and fintech sectors. Experience with scale, concurrency, and security pushes pay higher.",
    skills: ["Java / .NET / Node", "Databases (SQL & NoSQL)", "System design", "Message queues", "Security"],
  },
  {
    slug: "devops-engineer",
    role: "DevOps Engineer",
    sector: "Technology",
    sectorSlug: "technology",
    low: 40000,
    mid: 58000,
    high: 85000,
    blurb:
      "DevOps and cloud engineers are consistently among the hardest roles to fill in Malta, keeping compensation strong across gaming, fintech, and regulated firms.",
    skills: ["AWS / GCP / Azure", "Kubernetes & Docker", "Terraform / IaC", "CI/CD", "Observability"],
  },
  {
    slug: "data-analyst",
    role: "Data Analyst",
    sector: "Technology",
    sectorSlug: "technology",
    low: 28000,
    mid: 42000,
    high: 65000,
    blurb:
      "Data analysts turn player, customer, and financial data into decisions across Malta's gaming and finance employers. SQL fluency and BI tooling are the baseline expectations.",
    skills: ["SQL", "Power BI / Tableau / Looker", "Python or R", "Data modelling", "Statistics"],
  },
  {
    slug: "qa-engineer",
    role: "QA Engineer",
    sector: "Technology",
    sectorSlug: "technology",
    low: 26000,
    mid: 40000,
    high: 60000,
    blurb:
      "QA and test-automation engineers safeguard the fast-moving release cycles common at Malta's gaming and product companies, with automation skills lifting pay above manual testing.",
    skills: ["Test automation", "Selenium / Cypress / Playwright", "API testing", "CI pipelines", "Test strategy"],
  },
  {
    slug: "it-support-technician",
    role: "IT Support Technician",
    sector: "Technology",
    sectorSlug: "technology",
    low: 20000,
    mid: 30000,
    high: 45000,
    blurb:
      "IT support and systems roles are a reliable entry point into Malta's tech economy, with progression into systems administration and infrastructure over time.",
    skills: ["Windows & macOS support", "Networking basics", "Active Directory / M365", "Ticketing systems", "Troubleshooting"],
  },
  {
    slug: "cybersecurity-analyst",
    role: "Cybersecurity Analyst",
    sector: "Technology",
    sectorSlug: "technology",
    low: 38000,
    mid: 55000,
    high: 85000,
    blurb:
      "Financial-services regulation and the gaming sector drive steady demand for cybersecurity talent in Malta, with cloud-security and SOC experience at the top of the range.",
    skills: ["SIEM / SOC", "Cloud security", "Incident response", "Risk & compliance", "Penetration testing"],
  },
  {
    slug: "product-manager",
    role: "Product Manager",
    sector: "Technology",
    sectorSlug: "technology",
    low: 40000,
    mid: 60000,
    high: 90000,
    blurb:
      "Product managers are increasingly central at Malta's gaming and SaaS firms, owning roadmaps that balance commercial, compliance, and engineering priorities.",
    skills: ["Roadmapping", "Discovery & research", "Data-informed decisions", "Stakeholder management", "Agile delivery"],
  },

  // ---- iGaming ----
  {
    slug: "customer-support-agent",
    role: "Customer Support Agent",
    sector: "iGaming",
    sectorSlug: "igaming",
    low: 18000,
    mid: 24000,
    high: 32000,
    blurb:
      "Multilingual customer support is the classic entry point into Malta's iGaming industry. A sought-after language (Nordic, German, Japanese) typically adds a few thousand euro to the base.",
    skills: ["A second language", "Customer service", "CRM tools", "Responsible gaming", "Shift flexibility"],
  },
  {
    slug: "compliance-officer",
    role: "Compliance Officer",
    sector: "iGaming",
    sectorSlug: "igaming",
    low: 30000,
    mid: 48000,
    high: 75000,
    blurb:
      "Compliance has become one of Malta's best-paid non-technical career tracks as regulation tightened across gaming and financial services. Senior compliance leaders can earn comparably to commercial heads.",
    skills: ["MGA / regulatory frameworks", "AML / KYC", "Responsible gaming", "Policy & reporting", "Risk assessment"],
  },
  {
    slug: "aml-analyst",
    role: "AML Analyst",
    sector: "iGaming",
    sectorSlug: "igaming",
    low: 28000,
    mid: 42000,
    high: 65000,
    blurb:
      "Anti-money-laundering analysts are in persistent demand across Malta's gaming, payments, and banking sectors, with experience and certifications driving pay upward.",
    skills: ["Transaction monitoring", "KYC / CDD", "Sanctions screening", "Case investigation", "Regulatory reporting"],
  },
  {
    slug: "crm-manager",
    role: "CRM Manager",
    sector: "iGaming",
    sectorSlug: "igaming",
    low: 35000,
    mid: 50000,
    high: 75000,
    blurb:
      "CRM and retention managers own player lifecycle value at Malta's operators — a commercially critical, well-compensated role that blends marketing, data, and automation.",
    skills: ["CRM platforms", "Segmentation & automation", "Retention analytics", "A/B testing", "Campaign management"],
  },
  {
    slug: "affiliate-manager",
    role: "Affiliate Manager",
    sector: "iGaming",
    sectorSlug: "igaming",
    low: 30000,
    mid: 45000,
    high: 70000,
    blurb:
      "Affiliate managers drive a major acquisition channel for Malta's gaming operators, with strong performers earning commission and bonuses on top of base pay.",
    skills: ["Affiliate networks", "Negotiation", "Performance marketing", "Analytics", "Relationship management"],
  },

  // ---- Finance & Banking ----
  {
    slug: "accountant",
    role: "Accountant",
    sector: "Finance & Banking",
    sectorSlug: "finance-banking",
    low: 26000,
    mid: 40000,
    high: 60000,
    blurb:
      "Accountants are consistently in demand across Malta's financial-services, gaming, and corporate-services firms. ACCA qualification and industry experience lift pay toward the upper range.",
    skills: ["ACCA / ACA", "Financial reporting", "Management accounts", "VAT & tax", "ERP systems"],
  },
  {
    slug: "auditor",
    role: "Auditor",
    sector: "Finance & Banking",
    sectorSlug: "finance-banking",
    low: 28000,
    mid: 45000,
    high: 70000,
    blurb:
      "Audit professionals find steady opportunities across Malta's Big Four and boutique firms, with qualified seniors and managers commanding the higher end.",
    skills: ["External / internal audit", "IFRS", "Risk assessment", "ACCA / ACA", "Stakeholder reporting"],
  },
  {
    slug: "financial-analyst",
    role: "Financial Analyst",
    sector: "Finance & Banking",
    sectorSlug: "finance-banking",
    low: 30000,
    mid: 48000,
    high: 75000,
    blurb:
      "Financial analysts support investment, treasury, and FP&A functions across Malta's banks, funds, and larger operators, with modelling skills and qualifications rewarded.",
    skills: ["Financial modelling", "FP&A", "Excel / BI", "Valuation", "Reporting"],
  },
  {
    slug: "fund-administrator",
    role: "Fund Administrator",
    sector: "Finance & Banking",
    sectorSlug: "finance-banking",
    low: 26000,
    mid: 40000,
    high: 62000,
    blurb:
      "Fund administration is a cornerstone of Malta's financial-services sector, offering a clear progression path from administrator to senior and managerial roles.",
    skills: ["NAV calculation", "Fund accounting", "Reconciliations", "Investor reporting", "Regulatory knowledge"],
  },

  // ---- Marketing & Media ----
  {
    slug: "digital-marketing-manager",
    role: "Digital Marketing Manager",
    sector: "Marketing & Media",
    sectorSlug: "marketing-media",
    low: 30000,
    mid: 45000,
    high: 68000,
    blurb:
      "Digital marketing managers are in strong demand thanks to Malta's gaming and tech employers, who reward performance-marketing and multi-channel experience.",
    skills: ["Paid acquisition", "Analytics (GA4)", "SEO / content", "CRM & email", "Budget management"],
  },
  {
    slug: "seo-specialist",
    role: "SEO Specialist",
    sector: "Marketing & Media",
    sectorSlug: "marketing-media",
    low: 26000,
    mid: 40000,
    high: 60000,
    blurb:
      "SEO specialists are highly valued in Malta's competitive gaming and affiliate space, where organic visibility is a core acquisition channel.",
    skills: ["Technical SEO", "Content strategy", "Link building", "Analytics", "Keyword research"],
  },
  {
    slug: "content-writer",
    role: "Content Writer",
    sector: "Marketing & Media",
    sectorSlug: "marketing-media",
    low: 22000,
    mid: 32000,
    high: 48000,
    blurb:
      "Content writers and copywriters support marketing across Malta's international, English-first teams, with SEO and specialist-niche writing earning more.",
    skills: ["Copywriting", "SEO writing", "Editing", "Content strategy", "CMS tools"],
  },
  {
    slug: "social-media-manager",
    role: "Social Media Manager",
    sector: "Marketing & Media",
    sectorSlug: "marketing-media",
    low: 24000,
    mid: 36000,
    high: 55000,
    blurb:
      "Social media managers own brand presence and community for Malta's consumer, gaming, and hospitality brands, blending creative and analytical skills.",
    skills: ["Content creation", "Community management", "Paid social", "Analytics", "Brand voice"],
  },

  // ---- Healthcare ----
  {
    slug: "nurse",
    role: "Nurse",
    sector: "Healthcare",
    sectorSlug: "healthcare",
    low: 22000,
    mid: 30000,
    high: 42000,
    blurb:
      "Malta recruits nurses for both public and private providers, with demand persistently high. Qualifications usually need local recognition, so factor that into your relocation timeline.",
    skills: ["Registered nursing qualification", "Patient care", "Local registration", "Specialisation", "English proficiency"],
  },
  {
    slug: "doctor",
    role: "Doctor",
    sector: "Healthcare",
    sectorSlug: "healthcare",
    low: 35000,
    mid: 60000,
    high: 100000,
    blurb:
      "Doctors and specialists are in steady demand across Malta's public and private healthcare systems, with pay varying widely by specialty, seniority, and setting.",
    skills: ["Medical qualification", "Local registration", "Specialty training", "Clinical experience", "English proficiency"],
  },
  {
    slug: "care-worker",
    role: "Care Worker",
    sector: "Healthcare",
    sectorSlug: "healthcare",
    low: 16000,
    mid: 22000,
    high: 30000,
    blurb:
      "Care workers and carers are recruited across Malta's residential and home-care providers, offering an accessible route into the healthcare sector.",
    skills: ["Personal care", "Patient support", "Empathy & communication", "Basic clinical tasks", "Reliability"],
  },
  {
    slug: "pharmacist",
    role: "Pharmacist",
    sector: "Healthcare",
    sectorSlug: "healthcare",
    low: 28000,
    mid: 40000,
    high: 58000,
    blurb:
      "Pharmacists work across Malta's community pharmacies, hospitals, and the island's notable pharmaceutical industry, with industry roles often paying more than retail.",
    skills: ["Pharmacy qualification", "Local registration", "Dispensing", "Regulatory knowledge", "Patient counselling"],
  },

  // ---- Legal & Compliance ----
  {
    slug: "lawyer",
    role: "Lawyer",
    sector: "Legal & Compliance",
    sectorSlug: "legal-compliance",
    low: 30000,
    mid: 50000,
    high: 90000,
    blurb:
      "Lawyers are core to Malta's regulated economy, especially in corporate, financial-services, gaming, and tax law. Specialisation and a strong firm lift pay considerably.",
    skills: ["Maltese / EU law", "Corporate & commercial", "Regulatory", "Drafting & negotiation", "Warrant to practise"],
  },
  {
    slug: "legal-counsel",
    role: "Legal Counsel",
    sector: "Legal & Compliance",
    sectorSlug: "legal-compliance",
    low: 40000,
    mid: 65000,
    high: 100000,
    blurb:
      "In-house legal counsel are sought by Malta's larger gaming, fintech, and corporate-services firms, commanding premiums for regulatory and commercial expertise.",
    skills: ["Commercial contracts", "Regulatory advice", "Risk management", "Corporate governance", "Negotiation"],
  },

  // ---- Tourism & Hospitality ----
  {
    slug: "chef",
    role: "Chef",
    sector: "Tourism & Hospitality",
    sectorSlug: "tourism-hospitality",
    low: 20000,
    mid: 32000,
    high: 55000,
    blurb:
      "Chefs are in year-round demand across Malta's hotels and restaurants, with head chefs and roles at higher-end properties earning well above entry level.",
    skills: ["Culinary training", "Menu development", "Kitchen management", "Food safety (HACCP)", "Team leadership"],
  },
  {
    slug: "hotel-manager",
    role: "Hotel Manager",
    sector: "Tourism & Hospitality",
    sectorSlug: "tourism-hospitality",
    low: 30000,
    mid: 48000,
    high: 75000,
    blurb:
      "Hotel and operations managers run a core part of Malta's tourism economy, with pay scaling by property size, brand, and seasonality of the role.",
    skills: ["Operations management", "Revenue & budgeting", "Guest experience", "Team leadership", "PMS systems"],
  },
  {
    slug: "waiter",
    role: "Waiter / Front of House",
    sector: "Tourism & Hospitality",
    sectorSlug: "tourism-hospitality",
    low: 15000,
    mid: 20000,
    high: 28000,
    blurb:
      "Front-of-house roles are among the most accessible jobs in Malta, with tips and higher-end venues lifting take-home above the headline base.",
    skills: ["Customer service", "POS systems", "Food & drink knowledge", "Multitasking", "Languages"],
  },

  // ---- Construction & Engineering ----
  {
    slug: "civil-engineer",
    role: "Civil Engineer",
    sector: "Construction & Engineering",
    sectorSlug: "construction-engineering",
    low: 26000,
    mid: 42000,
    high: 68000,
    blurb:
      "Civil engineers stay busy across Malta's active residential and commercial construction sector, with chartered status and project experience rewarded.",
    skills: ["Structural design", "Project documentation", "AutoCAD", "Site supervision", "Warrant / chartership"],
  },
  {
    slug: "construction-project-manager",
    role: "Construction Project Manager",
    sector: "Construction & Engineering",
    sectorSlug: "construction-engineering",
    low: 32000,
    mid: 52000,
    high: 80000,
    blurb:
      "Project managers coordinate Malta's larger construction and development projects, with proven delivery on complex builds commanding the upper range.",
    skills: ["Project planning", "Budget & cost control", "Contractor management", "Health & safety", "Scheduling"],
  },
  {
    slug: "architect",
    role: "Architect",
    sector: "Construction & Engineering",
    sectorSlug: "construction-engineering",
    low: 28000,
    mid: 45000,
    high: 72000,
    blurb:
      "Architects (periti) are central to Malta's development pipeline, with the local warrant and a strong portfolio key to reaching senior pay.",
    skills: ["Architectural design", "AutoCAD / Revit", "Planning regulations", "Perit warrant", "Project delivery"],
  },
];

export function getAllBenchmarks(): SalaryBenchmark[] {
  return [...SALARY_BENCHMARKS].sort((a, b) => a.role.localeCompare(b.role));
}

export function getBenchmark(slug: string): SalaryBenchmark | undefined {
  return SALARY_BENCHMARKS.find((b) => b.slug === slug);
}

export function getBenchmarksBySector(): { sector: string; sectorSlug: string; roles: SalaryBenchmark[] }[] {
  const order = [
    "Technology",
    "iGaming",
    "Finance & Banking",
    "Marketing & Media",
    "Healthcare",
    "Legal & Compliance",
    "Tourism & Hospitality",
    "Construction & Engineering",
  ];
  return order
    .map((sector) => {
      const roles = SALARY_BENCHMARKS.filter((b) => b.sector === sector).sort((a, b) => a.role.localeCompare(b.role));
      return { sector, sectorSlug: roles[0]?.sectorSlug ?? "", roles };
    })
    .filter((g) => g.roles.length > 0);
}

/** Related roles in the same sector (excluding the given slug). */
export function getRelatedBenchmarks(slug: string, limit = 4): SalaryBenchmark[] {
  const current = getBenchmark(slug);
  if (!current) return [];
  return SALARY_BENCHMARKS.filter((b) => b.sector === current.sector && b.slug !== slug).slice(0, limit);
}
