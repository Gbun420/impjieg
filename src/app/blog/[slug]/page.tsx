import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | Impjieg Blog`,
    description: post.excerpt,
  };
}

const BLOG_POSTS = [
  {
    slug: "ultimate-guide-working-malta-2026",
    title: "The Ultimate Guide to Working in Malta (2026)",
    excerpt: "Everything you need to know about finding work, visas, taxes, and living in Malta as a local or expat.",
    category: "Career Guide",
    date: "2026-05-15",
    readTime: "12 min read",
    content: `
## Why Work in Malta?

Malta has become one of the most attractive destinations for professionals in Europe. With its strategic location in the Mediterranean, English as an official language, and a thriving economy, the island offers unique opportunities for both locals and expats.

### Key Benefits

- **Tax advantages**: Malta offers attractive tax schemes for expats, including the Highly Qualified Persons Rules and the 15% tax cap for certain roles
- **Quality of life**: 300+ days of sunshine, crystal-clear waters, and a rich cultural heritage
- **Growing economy**: Strong sectors include iGaming, finance, technology, and blockchain
- **EU membership**: Freedom of movement within the European Union
- **English language**: No language barrier for English speakers

## The Malta Job Market in 2026

Malta's unemployment rate remains among the lowest in the EU at around 3%. The demand for skilled professionals continues to grow, particularly in:

### iGaming & Gaming

Malta is known as the "iGaming Island" and hosts over 300 gaming companies. Roles in high demand include:

- Game developers (Unity, Unreal Engine)
- Customer support (multilingual)
- Compliance officers
- Marketing specialists
- Payment processing experts

Average salaries range from €25,000 for entry-level to €80,000+ for senior management positions.

### Technology & IT

The tech sector is booming with startups and established companies alike seeking:

- Software engineers (React, Node.js, Python)
- DevOps engineers
- Cybersecurity specialists
- Data scientists
- Cloud architects

Tech salaries in Malta typically range from €30,000 to €70,000, with senior roles commanding €80,000+.

### Financial Services

Malta's financial sector is well-established and growing:

- Accountants and auditors
- Compliance and risk professionals
- Fund administrators
- Insurance specialists
- Fintech developers

## Work Permits & Visas

### EU/EEA Citizens

If you're an EU/EEA citizen, you have the right to work in Malta without a permit. You'll need to register with Identity Malta if staying longer than 3 months.

### Third-Country Nationals (Non-EU)

Non-EU citizens need a work permit. The process involves:

1. **Job offer**: You must have a confirmed job offer from a Maltese employer
2. **Single Permit application**: Your employer applies on your behalf through Identity Malta
3. **Key Worker Initiative**: Fast-track process for certain sectors (iGaming, finance, tech)
4. **Highly Qualified Persons Rules**: Special 15% tax rate for qualifying roles

Processing times are typically 4-8 weeks for standard applications and 2-3 weeks for Key Worker applications.

## Cost of Living

Malta's cost of living is moderate compared to Western Europe:

| Category | Monthly Cost (EUR) |
|----------|-------------------|
| Rent (1-bed, central) | €800-€1,200 |
| Rent (1-bed, outside) | €600-€900 |
| Utilities | €100-€150 |
| Groceries | €250-€400 |
| Transport | €26 (Tallinja card) |
| Internet | €30-€50 |

## Healthcare

Malta has an excellent public healthcare system. EU citizens can use the European Health Insurance Card (EHIC). Residents contribute to social security and have access to free public healthcare.

Private health insurance is available from €50-€150/month and provides faster access to specialists.

## Getting Started

1. **Update your CV**: Tailor it to the Malta market (include photo, keep it to 2 pages)
2. **Register on Impjieg**: Browse and apply for jobs directly
3. **Network**: Join expat groups on Facebook and attend industry events
4. **Prepare for interviews**: Research the company and practice common questions
5. **Sort accommodation**: Start looking before you arrive if relocating

---

*Last updated: May 2026. For the latest information, visit [Identity Malta](https://identitymalta.com) and [JobsPlus](https://jobsplus.gov.mt).*
    `,
  },
];

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/blog"
        className="group mb-8 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Blog
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.date).toLocaleDateString("en-MT", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>
      </header>

      <div className="prose prose-sm max-w-none text-muted-foreground">
        {post.content.split("\n").map((line, i) => {
          if (line.startsWith("## ")) {
            return <h2 key={i} className="mt-8 mb-4 text-xl font-bold text-foreground">{line.replace("## ", "")}</h2>;
          }
          if (line.startsWith("### ")) {
            return <h3 key={i} className="mt-6 mb-3 text-lg font-semibold text-foreground">{line.replace("### ", "")}</h3>;
          }
          if (line.startsWith("- **")) {
            const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
            if (match) {
              return (
                <li key={i} className="ml-4">
                  <strong className="text-foreground">{match[1]}</strong>
                  {match[2] && <span> {match[2]}</span>}
                </li>
              );
            }
          }
          if (line.startsWith("- ")) {
            return <li key={i} className="ml-4">{line.replace("- ", "")}</li>;
          }
          if (line.startsWith("|")) {
            return null;
          }
          if (line.trim() === "") {
            return <br key={i} />;
          }
          return <p key={i} className="mb-3">{line}</p>;
        })}
      </div>

      <div className="mt-10 border-t border-border/50 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Share this article</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-1.5 h-3.5 w-3.5" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-foreground">Related Articles</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {relatedPosts.map((related) => (
            <Link key={related.slug} href={`/blog/${related.slug}`}>
              <Card className="h-full p-4 transition-all hover:shadow-sm">
                <Badge variant="secondary" className="text-xs">{related.category}</Badge>
                <h3 className="mt-2 text-sm font-medium text-foreground line-clamp-2">{related.title}</h3>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
