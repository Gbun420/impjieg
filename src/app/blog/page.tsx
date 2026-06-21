import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { getAllPosts, BLOG_CATEGORIES } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog & Career Resources",
  description:
    "Salary guides, sector deep-dives, visa help, and interview tips for working in Malta.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Career resources</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Malta job-market guides
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Salary guides, sector deep-dives, visa help, and interview tips — everything for finding work in Malta.
        </p>
      </header>

      <div className="mb-8 mt-8 flex flex-wrap gap-2">
        {BLOG_CATEGORIES.map((cat) => (
          <span
            key={cat}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              cat === "All"
                ? "border-transparent bg-foreground text-background"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {cat}
          </span>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <Card className="flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-accent">
              <div className="h-40 bg-gradient-to-br from-[#FFD93B] to-[#FFC400]" />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.date).toLocaleDateString("en-MT", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <h2 className="mt-3 line-clamp-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between pt-1">
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
