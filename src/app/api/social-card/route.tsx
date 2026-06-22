import { renderOgImage } from "@/lib/og/render";

export const runtime = "edge";

/**
 * Standalone branded social-share card (yellow / Sunlight) for posting on
 * LinkedIn, Facebook, etc. Served as a stable 1200x630 PNG at /api/social-card.
 */
export async function GET() {
  return renderOgImage({
    eyebrow: "Malta Jobs",
    title: "Find your next opportunity in Malta.",
    footer: "Real salaries · clear work-mode · verified employers",
    variant: "light",
  });
}
