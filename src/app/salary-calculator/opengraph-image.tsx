import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/render";

export const runtime = "edge";

export const alt = "Malta Salary Calculator — Impjieg";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOgImage({
    eyebrow: "Free tool",
    title: "Malta Salary Calculator",
    footer: "Estimate take-home pay after tax · impjieg.work",
  });
}
