import { ImageResponse } from "next/og";

/**
 * Shared branded Open Graph / social-preview image renderer (Sunlight brand).
 * Used by the file-based `opengraph-image.tsx` routes and the social-card route
 * so every shared link / post gets a specific, on-brand 1200x630 card with the
 * real Impjieg logo. Pure code-generated — runs on the edge.
 *
 *  - variant "dark"  (default): warm-black gradient, white logo — used for the
 *    per-page link previews (legible on light social feeds).
 *  - variant "light": sunny-yellow gradient, dark logo on a white chip, black
 *    text — the brand / social-share card.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 600 | 700; style: "normal" };

let fontsPromise: Promise<OgFont[]> | null = null;
let logosPromise: Promise<{ white: string; dark: string }> | null = null;

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

function toDataUri(buf: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  // btoa is available on the edge runtime
  return `data:image/png;base64,${btoa(binary)}`;
}

function loadLogos(): Promise<{ white: string; dark: string }> {
  if (!logosPromise) {
    logosPromise = Promise.all([
      fetch(new URL("./logo-white.png", import.meta.url)).then((r) => r.arrayBuffer()),
      fetch(new URL("./logo-dark.png", import.meta.url)).then((r) => r.arrayBuffer()),
    ]).then(([white, dark]) => ({ white: toDataUri(white), dark: toDataUri(dark) }));
  }
  return logosPromise;
}

/** Scale the headline down as it gets longer so it always fits ~3 lines. */
function titleSize(title: string): number {
  const len = title.length;
  if (len <= 24) return 74;
  if (len <= 40) return 64;
  if (len <= 58) return 54;
  return 46;
}

const LOGO_W = 300;
const LOGO_H = Math.round((300 * 306) / 960); // preserve the 960x306 aspect ratio

export async function renderOgImage({
  eyebrow,
  title,
  footer = "Real salaries · verified employers · Malta",
  variant = "dark",
}: {
  eyebrow: string;
  title: string;
  footer?: string;
  variant?: "dark" | "light";
}) {
  const [fonts, logos] = await Promise.all([loadFonts(), loadLogos()]);
  const light = variant === "light";

  const theme = light
    ? {
        background: "linear-gradient(135deg, #FFD93B 0%, #FFC400 100%)",
        glow: "radial-gradient(circle, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 70%)",
        title: "#141210",
        eyebrowBg: "#1A1613",
        eyebrowText: "#FFFFFF",
        footer: "rgba(20,18,16,0.72)",
        footerBar: "#1A1613",
      }
    : {
        background: "linear-gradient(135deg, #272019 0%, #0C0A08 100%)",
        glow: "radial-gradient(circle, rgba(255,196,0,0.20) 0%, rgba(255,196,0,0) 70%)",
        title: "#FFFFFF",
        eyebrowBg: "#FFC400",
        eyebrowText: "#1A1613",
        footer: "rgba(255,255,255,0.62)",
        footerBar: "#FFC400",
      };

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
          background: theme.background,
          fontFamily: "Barlow",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -140,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: theme.glow,
            display: "flex",
          }}
        />

        {/* brand logo (real artwork) */}
        {light ? (
          <div style={{ display: "flex", background: "#FFFFFF", borderRadius: 18, padding: "16px 22px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logos.dark} width={260} height={Math.round((260 * 306) / 960)} alt="" />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logos.white} width={LOGO_W} height={LOGO_H} alt="" />
        )}

        {/* eyebrow + headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                background: theme.eyebrowBg,
                color: theme.eyebrowText,
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
              color: theme.title,
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
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: theme.footer, fontSize: 25, fontWeight: 600 }}>
          <div style={{ display: "flex", width: 44, height: 5, borderRadius: 3, background: theme.footerBar }} />
          <span>{footer}</span>
        </div>
      </div>
    ),
    { width: OG_SIZE.width, height: OG_SIZE.height, fonts },
  );
}
