import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const WORDS_PER_MINUTE = 200;

export type BlogFrontmatter = {
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  keywords?: string[];
  image?: string;
  featured?: boolean;
  draft?: boolean;
};

export type BlogPostMeta = BlogFrontmatter & {
  slug: string;
  readingTimeMinutes: number;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function readPostFile(slug: string): BlogPost | null {
  const fullPath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = data as BlogFrontmatter;

  return {
    ...frontmatter,
    slug,
    content,
    readingTimeMinutes: estimateReadingTime(content),
  };
}

function toMeta(post: BlogPost): BlogPostMeta {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: post.category,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    author: post.author,
    keywords: post.keywords,
    image: post.image,
    featured: post.featured,
    draft: post.draft,
    readingTimeMinutes: post.readingTimeMinutes,
  };
}

/** All publishable post slugs (drafts excluded). */
export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""))
    .filter((slug) => {
      const post = readPostFile(slug);
      return Boolean(post) && !post?.draft;
    });
}

/** A single publishable post with its raw MDX content, or null if missing/draft. */
export function getPostBySlug(slug: string): BlogPost | null {
  const post = readPostFile(slug);
  if (!post || post.draft) {
    return null;
  }
  return post;
}

/** All publishable posts (metadata only), newest first. */
export function getAllPosts(): BlogPostMeta[] {
  return getAllSlugs()
    .map((slug) => readPostFile(slug))
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .map(toMeta);
}

/** Distinct categories present across publishable posts, prefixed with "All". */
export function getCategories(): string[] {
  const categories = new Set<string>();
  for (const post of getAllPosts()) {
    if (post.category) {
      categories.add(post.category);
    }
  }
  return ["All", ...Array.from(categories)];
}
