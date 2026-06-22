import { getPostBySlug } from "@/lib/blog/posts";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/render";

export const runtime = "edge";

export const alt = "Impjieg — Malta job-market guides";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return renderOgImage({
    eyebrow: post?.category ?? "Malta Guides",
    title: post?.title ?? "Malta job-market guides",
    footer: post?.readTime ? `${post.readTime} · impjieg.work` : "Career guides · impjieg.work",
  });
}
