import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/blog/markdown";
import { getAllPosts, getPostBySlug } from "@/lib/blog/posts";
import { SITE } from "@/lib/constants";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  const url = `${SITE.url}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getAllPosts().filter((p) => p.slug !== slug).slice(0, 3);
  const url = `${SITE.url}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "Impjieg", url: SITE.url },
    publisher: {
      "@type": "Organization",
      name: "Impjieg",
      logo: { "@type": "ImageObject", url: `${SITE.url}/logo.png` },
    },
    mainEntityOfPage: url,
    url,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link
        href="/blog"
        className="group mb-8 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Blog
      </Link>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-[2.5rem] sm:leading-[1.1]">
          {post.title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>
      </header>

      <article>
        <Markdown content={post.content} />
      </article>

      <div className="mt-12 overflow-hidden rounded-2xl bg-gradient-to-b from-[#FFD93B] to-[#FFC400] p-6 text-center">
        <h2 className="text-xl font-bold text-[#141210]">Ready to find your next role in Malta?</h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm font-medium text-[#3f3414]">
          Browse live, salary-transparent roles across Malta&apos;s top sectors.
        </p>
        <Button asChild size="lg" className="mt-4 bg-[#141210] text-white hover:bg-black">
          <Link href="/jobs">Browse jobs</Link>
        </Button>
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-foreground">Related reading</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
                <Card className="h-full p-4 transition-all duration-200 hover:-translate-y-1 hover:border-accent">
                  <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                  <h3 className="mt-2 line-clamp-3 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {p.title}
                  </h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
