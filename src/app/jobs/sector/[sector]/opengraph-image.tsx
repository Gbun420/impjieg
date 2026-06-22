import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/render";

export const runtime = "edge";

export const alt = "Sector jobs in Malta — Impjieg";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function Image({ params }: { params: Promise<{ sector: string }> }) {
  const { sector } = await params;
  const label = slugToLabel(sector);

  return renderOgImage({
    eyebrow: "Malta Jobs",
    title: `${label} Jobs in Malta`,
    footer: "Browse live roles · impjieg.work",
  });
}
