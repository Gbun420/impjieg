import { getBenchmark } from "@/lib/salary/benchmarks";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/render";

export const runtime = "edge";

export const alt = "Salary in Malta — Impjieg";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const b = getBenchmark(role);

  const k = (n: number) => `€${Math.round(n / 1000)}k`;
  const footer = b ? `${k(b.low)}–${k(b.high)} typical range · impjieg.work` : "Malta Salary Guide · impjieg.work";

  return renderOgImage({
    eyebrow: "Salary Guide",
    title: b ? `${b.role} Salary in Malta` : "Malta Salary Guide",
    footer,
  });
}
