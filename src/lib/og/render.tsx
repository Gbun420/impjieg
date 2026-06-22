import { ImageResponse } from "next/og";

/**
 * Shared branded Open Graph / social-preview image renderer (Sunlight brand:
 * warm-black background, sunny-yellow accent, Barlow display type). Used by the
 * file-based `opengraph-image.tsx` routes so every shared link gets a specific,
 * on-brand 1200x630 card. Pure code-generated — no DB, works at the edge/build.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 600 | 700; style: "normal" };

let fontsPromise: Promise<OgFont[]> | null = null;

function loadFonts(): Promise<OgFont[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetch(new URL("./fonts/Barlow-Bold.ttf", import.meta.url)).then((r) => r.arrayBuffer()),
      fetch(new URL("./fonts/Barlow-SemiBold.ttf", import.meta.url)).then((r) => r.arrayBuffer()),
    ]).then(([bold, semibold]) => [
      { name: "Barlow", data: bold, weight: 700, style: "normal" },
      { name: "Barlow", data: semibold, weight: 600, style: "normal" },
    ]);
  }
  return fontsPromise;
}

/** Scale the headline down as it gets longer so it always fits ~3 lines. */
function titleSize(title: string): number {
  const len = title.length;
  if (len <= 24) return 74;
  if (len <= 40) return 64;
  if (len <= 58) return 54;
  return 46;
}

/** The Impjieg mark: dark rounded square + white bar + yellow sun dot. */
function Mark() {
  return (
    <div style={{ display: "flex", position: "relative", width: 56, height: 56, borderRadius: 15, background: "#14110D" }}>
      <div style={{ position: "absolute", left: 23, top: 25, width: 10, height: 19, borderRadius: 5, background: "#FFFFFF" }} />
      <div style={{ position: "absolute", left: 22, top: 11, width: 12, height: 12, borderRadius: 6, background: "#FFC400" }} />
    </div>
  );
}

export async function renderOgImage({
  eyebrow,
  title,
  footer = "Real salaries · verified employers · Malta",
}: {
  eyebrow: string;
  title: string;
  footer?: string;
}) {
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #272019 0%, #0C0A08 100%)",
          fontFamily: "Barlow",
          position: "relative",
        }}
      >
        {/* sunny-yellow glow, top-right (echoes the homepage hero) */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -140,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,196,0,0.20) 0%, rgba(255,196,0,0) 70%)",
            display: "flex",
          }}
        />

        {/* brand lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Mark />
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 32, fontWeight: 700 }}>
            <span style={{ color: "#FFFFFF" }}>impjieg</span>
            <span style={{ color: "#FFC400" }}>.work</span>
          </div>
        </div>

        {/* eyebrow + headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                background: "#FFC400",
                color: "#1A1613",
                fontSize: 22,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "9px 20px",
                borderRadius: 999,
              }}
            >
              {eyebrow}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              color: "#FFFFFF",
              fontSize: titleSize(title),
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: -1.5,
              maxWidth: 1010,
            }}
          >
            {title}
          </div>
        </div>

        {/* footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "rgba(255,255,255,0.62)", fontSize: 25, fontWeight: 600 }}>
          <div style={{ display: "flex", width: 44, height: 5, borderRadius: 3, background: "#FFC400" }} />
          <span>{footer}</span>
        </div>
      </div>
    ),
    { width: OG_SIZE.width, height: OG_SIZE.height, fonts },
  );
}
