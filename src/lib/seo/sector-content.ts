/**
 * Unique, keyword-rich editorial content per sector for the /jobs/sector/{slug}
 * landing pages. Avoids thin/duplicate content (every page shared one template)
 * so each can rank for "{sector} jobs Malta". Facts are kept general/hedged.
 * Keyed by the sector slug (labelToSlug of the SECTORS label).
 */

export interface SectorContent {
  /** 1–2 sentence unique intro (also used as the meta description). */
  intro: string;
  /** Common roles in this sector in Malta. */
  roles: string[];
}

export const SECTOR_CONTENT: Record<string, SectorContent> = {
  igaming: {
    intro:
      "Malta is one of the world's leading iGaming hubs, home to hundreds of MGA-licensed operators and B2B suppliers clustered around Sliema, St Julian's and Gzira. iGaming jobs in Malta span software, compliance, customer support, marketing and product — and many roles are open to relocating, multilingual talent.",
    roles: [
      "Compliance & AML officers",
      "Multilingual customer support",
      "Backend & platform engineers",
      "CRM & affiliate marketing",
      "Product managers",
      "Sportsbook & casino operations",
    ],
  },
  technology: {
    intro:
      "Malta's technology sector spans iGaming platforms, fintech, SaaS and IT services, with English-language workplaces and a growing startup scene. Demand is steady for software engineers, data and DevOps specialists, and IT support across the island.",
    roles: [
      "Software engineers (frontend & backend)",
      "DevOps & cloud engineers",
      "Data engineers & analysts",
      "QA & test engineers",
      "IT support & systems",
      "Cybersecurity specialists",
    ],
  },
  "finance-banking": {
    intro:
      "Malta's financial-services sector covers banking, fund administration, insurance, accountancy and a fast-growing fintech scene. Compliance, AML and audit roles are in particular demand across the island's licensed institutions.",
    roles: [
      "Accountants & auditors",
      "Compliance & AML officers",
      "Fund administrators",
      "Risk & financial analysts",
      "Fintech & payments specialists",
      "Insurance professionals",
    ],
  },
  healthcare: {
    intro:
      "Malta recruits healthcare professionals for both public and private providers, from nurses and carers to doctors and allied-health roles. Qualifications usually need local recognition, so factor that into your relocation timeline.",
    roles: [
      "Nurses",
      "Doctors & specialists",
      "Care workers",
      "Allied health (physiotherapy, radiography)",
      "Pharmacy",
      "Healthcare administration",
    ],
  },
  "marketing-media": {
    intro:
      "Malta's marketing and media scene is powered by its iGaming and tech employers, with strong demand for performance marketers, SEO, content, CRM and creative roles — often in multilingual, international teams.",
    roles: [
      "Performance & digital marketing",
      "SEO & content",
      "CRM & retention",
      "Affiliate marketing",
      "Brand & creative",
      "Social media",
    ],
  },
  "legal-compliance": {
    intro:
      "Legal and compliance is a cornerstone of Malta's regulated economy, especially across iGaming, financial services and corporate services. Demand is steady for lawyers, compliance officers and regulatory specialists.",
    roles: [
      "Compliance officers",
      "Lawyers & legal counsel",
      "Regulatory & licensing",
      "Corporate services",
      "Data protection (GDPR)",
      "AML / KYC analysts",
    ],
  },
  "tourism-hospitality": {
    intro:
      "Tourism is one of Malta's largest industries, driving year-round and seasonal hiring across hotels, restaurants, events and travel. Roles range from front-of-house and culinary to management and guest experience.",
    roles: [
      "Hotel & front office",
      "Chefs & culinary",
      "Restaurant & bar",
      "Events & guest experience",
      "Travel & tour operations",
      "Hospitality management",
    ],
  },
  "construction-engineering": {
    intro:
      "Malta's construction and engineering sector stays active across residential and commercial projects, with demand for civil, mechanical and electrical engineers, site managers, surveyors and skilled trades.",
    roles: [
      "Civil engineers",
      "Mechanical & electrical engineers",
      "Site & project managers",
      "Quantity surveyors",
      "Architects",
      "Skilled trades",
    ],
  },
};

export function getSectorContent(slug: string): SectorContent | null {
  return SECTOR_CONTENT[slug] ?? null;
}
