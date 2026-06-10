import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/constants";
import { getAllPosts, getAllSlugs, getPostBySlug } from "@/lib/blog/posts";
import { mdxComponents } from "@/components/blog/mdx";

// Blog posts are static content; pre-render at build time and 404 unknown slugs.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const url = `${SITE.url}/blog/${post.slug}`;
  const ogImages = post.image
    ? [{ url: post.image, width: 1200, height: 630, alt: post.title }]
    : undefined;

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      siteName: "Impjieg",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author ?? "Impjieg"],
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : undefined,
    },
  };
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-MT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const url = `${SITE.url}/blog/${post.slug}`;
  const allPosts = getAllPosts();
  const sameCategory = allPosts.filter(
    (p) => p.slug !== post.slug && p.category === post.category
  );
  const fallback = allPosts.filter((p) => p.slug !== post.slug);
  const relatedPosts = (sameCategory.length > 0 ? sameCategory : fallback).slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { "@type": "Organization", name: post.author ?? "Impjieg", url: SITE.url },
    publisher: {
      "@type": "Organization",
      name: "Impjieg",
      logo: { "@type": "ImageObject", url: `${SITE.url}/logo-icon.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(post.image ? { image: `${SITE.url}${post.image}` } : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

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
            {formatDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTimeMinutes} min read
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{post.description}</p>
      </header>

      <article className="prose prose-slate mt-8 max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-a:font-medium prose-a:text-primary prose-strong:text-foreground prose-th:text-foreground">
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </article>

      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-foreground">Related Articles</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {relatedPosts.map((related) => (
              <Link key={related.slug} href={`/blog/${related.slug}`}>
                <Card className="h-full p-4 transition-all hover:shadow-sm">
                  <Badge variant="secondary" className="text-xs">
                    {related.category}
                  </Badge>
                  <h3 className="mt-2 line-clamp-2 text-sm font-medium text-foreground">
                    {related.title}
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
