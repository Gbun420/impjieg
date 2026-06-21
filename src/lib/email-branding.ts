import { escapeHtml, safeUrlHref } from "@/lib/email-security";
import { SITE } from "@/lib/constants";

type BrandedEmailShellOptions = {
  eyebrow?: string;
  title: string;
  intro?: string;
  bodyHtml: string;
  cta?: {
    label: string;
    href: string;
  };
  footerHtml?: string;
};

export function buildBrandedEmailShell({
  eyebrow = "Impjieg",
  title,
  intro,
  bodyHtml,
  cta,
  footerHtml,
}: BrandedEmailShellOptions) {
  const safeTitle = escapeHtml(title);
  const safeIntro = intro ? escapeHtml(intro) : null;
  const safeEyebrow = escapeHtml(eyebrow);
  const safeCtaHref = cta ? safeUrlHref(cta.href, SITE.url) : null;
  const safeCtaLabel = cta ? escapeHtml(cta.label) : null;

  return `
    <div style="margin:0;padding:0;background:#FFFBED;color:#1A1613;font-family:Inter,Arial,sans-serif;">
      <div style="margin:0 auto;max-width:640px;padding:28px 16px;">
        <div style="overflow:hidden;border-radius:24px;border:1px solid #ECE5D6;background:#FFFFFF;box-shadow:0 18px 48px rgba(26,22,19,0.08);">
          <div style="background:#14110D;padding:26px 28px;color:#F8FAFC;">
            <div style="font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#FFC400;">${safeEyebrow}</div>
            <h1 style="margin:10px 0 0;font-size:26px;line-height:1.15;font-weight:800;letter-spacing:-0.03em;">${safeTitle}</h1>
            ${safeIntro ? `<p style="margin:12px 0 0;color:#C9D4E5;font-size:15px;line-height:1.6;">${safeIntro}</p>` : ""}
          </div>
          <div style="padding:28px;">
            ${bodyHtml}
            ${
              safeCtaHref && safeCtaLabel
                ? `<p style="margin:24px 0 0;"><a href="${safeCtaHref}" style="display:inline-block;border-radius:999px;background:#FFC400;color:#1A1613;font-size:14px;font-weight:700;text-decoration:none;padding:12px 18px;">${safeCtaLabel}</a></p>`
                : ""
            }
          </div>
        </div>
        <div style="padding:16px 4px 0;color:#6B5E49;font-size:12px;line-height:1.6;">
          ${footerHtml ?? `Impjieg · ${escapeHtml(SITE.tagline)}`}
        </div>
      </div>
    </div>
  `;
}
