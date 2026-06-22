import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog/posts";

/**
 * Homepage widget: the latest cornerstone articles. Surfaces the blog from the
 * homepage for SEO (internal links to /blog/* guides) and discovery. Mirrors the
 * card style on the /blog index for visual consistency.
 */
export function LatestArticles() {
  const posts = getAllPosts().slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">From the blog</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Salary guides, sector deep-dives, and visa help for working in Malta
          </p>
        </div>
        <Link
          href="/blog"
          className="shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          All articles <ArrowRight className="ml-0.5 inline h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <Card className="flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-accent">
              <div className="h-28 bg-gradient-to-br from-[#FFD93B] to-[#FFC400]" />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.date).toLocaleDateString("en-MT", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <h3 className="mt-3 line-clamp-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
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
