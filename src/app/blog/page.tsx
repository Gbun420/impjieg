import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { getAllPosts, getCategories } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Malta Career Guides & Job-Market Insights",
  description:
    "Salary guides, visa and work-permit advice, sector deep-dives, and interview tips for finding and hiring talent in Malta.",
  alternates: { canonical: "/blog" },
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-MT", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categories = getCategories();
  const activeCategory = category && categories.includes(category) ? category : "All";

  const allPosts = getAllPosts();
  const posts =
    activeCategory === "All"
      ? allPosts
      : allPosts.filter((post) => post.category === activeCategory);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Malta Career Guides &amp; Job-Market Insights
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Salary guides, work-permit advice, and sector insights for Malta&apos;s job market.
        </p>
      </header>

      <nav aria-label="Blog categories" className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          const href = cat === "All" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`;
          return (
            <Link key={cat} href={href} scroll={false}>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className="px-3 py-1.5 text-sm transition-colors"
                aria-current={isActive ? "page" : undefined}
              >
                {cat}
              </Badge>
            </Link>
          );
        })}
      </nav>

      {posts.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">No articles in this category yet. Check back soon.</p>
          <Link
            href="/blog"
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            View all articles
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="group h-full overflow-hidden transition-all hover:border-primary/20 hover:shadow-md">
                <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10" />
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                  <h2 className="mt-3 line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {post.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {post.readingTimeMinutes} min read
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
