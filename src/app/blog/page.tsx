import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog & Career Resources",
  description: "Career advice, salary guides, and hiring tips for Malta's job market.",
};

const BLOG_POSTS = [
  {
    slug: "ultimate-guide-working-malta-2026",
    title: "The Ultimate Guide to Working in Malta (2026)",
    excerpt: "Everything you need to know about finding work, visas, taxes, and living in Malta as a local or expat.",
    category: "Career Guide",
    date: "2026-05-15",
    readTime: "12 min read",
    image: "/blog/malta-work-guide.jpg",
  },
  {
    slug: "malta-salary-guide-2026",
    title: "Malta Salary Guide 2026: What You Should Earn",
    excerpt: "Comprehensive salary breakdown by sector, experience level, and location across Malta.",
    category: "Salary Guide",
    date: "2026-05-10",
    readTime: "8 min read",
    image: "/blog/salary-guide.jpg",
  },
  {
    slug: "igaming-jobs-malta-complete-guide",
    title: "iGaming Jobs in Malta: The Complete Guide",
    excerpt: "Malta is Europe's iGaming hub. Discover top companies, roles, salaries, and how to break into the industry.",
    category: "Sector Guide",
    date: "2026-05-05",
    readTime: "10 min read",
    image: "/blog/igaming-guide.jpg",
  },
  {
    slug: "work-permit-malta-expats",
    title: "How to Get a Work Permit in Malta (Third-Country Nationals)",
    excerpt: "Step-by-step guide for non-EU citizens looking to work in Malta, including visa types and application process.",
    category: "Visa Guide",
    date: "2026-04-28",
    readTime: "7 min read",
    image: "/blog/work-permit.jpg",
  },
  {
    slug: "tech-jobs-malta-2026",
    title: "Tech Jobs in Malta 2026: In-Demand Roles & Salaries",
    excerpt: "The tech sector in Malta is booming. Explore the most sought-after roles, required skills, and compensation.",
    category: "Sector Guide",
    date: "2026-04-20",
    readTime: "9 min read",
    image: "/blog/tech-jobs.jpg",
  },
  {
    slug: "interview-tips-malta",
    title: "10 Interview Tips for Landing Your Dream Job in Malta",
    excerpt: "Stand out in Malta's competitive job market with these proven interview strategies and cultural tips.",
    category: "Career Advice",
    date: "2026-04-15",
    readTime: "6 min read",
    image: "/blog/interview-tips.jpg",
  },
];

const CATEGORIES = ["All", "Career Guide", "Salary Guide", "Sector Guide", "Visa Guide", "Career Advice"];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Blog & Career Resources
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Expert advice, salary guides, and insights for Malta&apos;s job market
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Badge
            key={cat}
            variant={cat === "All" ? "default" : "secondary"}
            className="cursor-pointer px-3 py-1.5 text-sm"
          >
            {cat}
          </Badge>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="group h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
              <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10" />
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.date).toLocaleDateString("en-MT", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <h2 className="mt-3 font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
