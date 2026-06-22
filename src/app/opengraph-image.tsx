import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/render";

export const runtime = "edge";

export const alt = "Impjieg — Malta's hiring signal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOgImage({
    eyebrow: "Malta Jobs",
    title: "Find your next opportunity in Malta.",
    footer: "Real salaries · clear work-mode · verified employers",
  });
}
