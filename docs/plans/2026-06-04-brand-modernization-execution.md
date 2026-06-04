# Impjieg Brand Modernization Execution Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reposition Impjieg as Malta's modern jobs marketplace for tech, digital, and iGaming talent, with a dark-ink Mediterranean-tech brand system that is consistent across public UI, metadata, and lifecycle surfaces.

**Architecture:** Start with a single source of truth for tokens, typography, and brand copy in the global layer, then roll the system into public acquisition surfaces, job detail hierarchy, email shells, and asset consistency. Preserve all security, application, email unsubscribe, AI protection, pagination, and RPC behavior; this is a brand systemization pass, not a backend rewrite.

**Tech Stack:** Next.js App Router, Tailwind CSS, shared UI primitives, Supabase, existing email helpers, SVG/public assets.

---

## Todo

- [ ] Phase 1: Brand token foundation and copy realignment
- [ ] Phase 2: Homepage and jobs surface refresh
- [ ] Phase 3: Job detail visual hierarchy and SEO consistency
- [ ] Phase 4: Branded email shell refresh
- [ ] Phase 5: Logo, favicon, and OG asset audit
- [ ] Phase 6: Final verification and production deploy

### Phase 1: Brand Token Foundation and Copy Realignment

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/manifest.ts`
- Modify: `src/app/api/jobs/rss/route.ts`
- Modify: `src/lib/constants.ts`
- Modify: `src/components/layout/header.tsx`
- Modify: `src/components/layout/footer.tsx`
- Modify: `src/app/auth/layout.tsx`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/badge.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/ui/tabs.tsx`

**Step 1: Audit current tokens and copy**
- Confirm the active palette, font wiring, metadata strings, and brand sublines.
- Identify any remaining "transparent job board" or "Malta jobs" phrasing.

**Step 2: Implement the token layer**
- Add the dark-ink Mediterranean-tech palette to `src/styles/globals.css`.
- Map semantic tokens to the new system.
- Keep accessibility contrast intact.

**Step 3: Wire typography**
- Replace Fraunces as the active display font.
- Use Sora or Manrope for display/headings and Inter for body/UI.
- Keep JetBrains Mono only where useful for data or code.

**Step 4: Realign product framing**
- Update layout metadata, manifest copy, and RSS title/description.
- Update `SITE.tagline` to the marketplace positioning.
- Remove weak or generic brand sublines in header/footer/auth surfaces.

**Step 5: Tighten shared UI primitives**
- Tune button, badge, card, input, select, and tabs styles to the new token system.
- Keep variants consistent and accessible.

**Step 6: Verify**
- Run `npm run lint`
- Run `npm test`
- Run `npm run build`
- Include accessibility contrast, focus-visible, keyboard navigation, and mobile readability checks for the public surfaces touched in the phase.

### Phase 2: Homepage and Jobs Surface Refresh

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/jobs/page.tsx`
- Modify: `src/components/jobs/job-card.tsx`
- Modify: `src/components/jobs/search-filters.tsx`
- Modify: `src/components/layout/header.tsx` if needed for consistency
- Modify: `src/components/layout/footer.tsx` if needed for consistency

**Step 1: Reframe the homepage hero**
- Replace transparency-board messaging with the modern marketplace positioning.
- Use a dark-ink hero and a dual CTA.
- Add proof, quick categories, and conversion-led messaging.

**Step 2: Rework the jobs list hierarchy**
- Make job cards premium, scannable, and marketplace-led.
- Surface salary, work mode, location, employer, sector, recency, and featured state clearly.

**Step 3: Align filter surfaces**
- Keep filters product-led and lightweight.
- Reduce form-heavy or generic job-board styling.

**Step 4: Verify**
- Run `npm run lint`
- Run `npm test`
- Run `npm run build`
- Include mobile smoke checks for homepage, jobs list, header/menu, and CTA visibility.

### Phase 3: Job Detail Visual Hierarchy and SEO Consistency

**Files:**
- Modify: `src/app/jobs/[employerSlug]/[jobSlug]/page.tsx`
- Modify: any helper used for structured data on job detail pages
- Modify: any related jobs or apply CTA components if required

**Step 1: Rebuild the summary-first header**
- Present title, employer, location, remote mode, salary, job type, sector, and apply CTA clearly.

**Step 2: Improve the apply area**
- Make the apply CTA prominent on mobile and sticky on desktop if safe.
- Keep the page visually premium without changing route or logic behavior.

**Step 3: Verify structured data**
- Ensure JobPosting JSON-LD is only on individual job pages.
- Ensure structured data matches visible page content.

**Step 4: Verify**
- Run `npm run lint`
- Run `npm test`
- Run `npm run build`
- Include mobile smoke checks for the job detail page and CTA visibility.

### Phase 4: Branded Email Shell Refresh

**Files:**
- Modify: `src/lib/actions/apply-helpers.ts`
- Modify: `src/lib/job-alerts.ts`
- Modify only shared email presentation helpers if they already exist and are used only for email markup/presentation

**Step 1: Audit current templates**
- Confirm safe HTML escaping and unsubscribe token flow are intact.

**Step 2: Add branded email shells**
- Use a dark-ink header, clean card layout, and consistent CTA treatment.
- Preserve token-only unsubscribe links.

**Step 3: Keep safety intact**
- Do not change delivery logic, unsubscribe logic, or token generation.
- Avoid logging raw secrets or tokens.
- Do not change Resend integration.
- Do not change send logic.
- Do not change token generation or verification.
- Do not change unsubscribe route behavior.

**Step 4: Verify**
- Run `npm run lint`
- Run `npm test`
- Run `node --import tsx --test src/lib/email-security.test.ts`
- Run `node --import tsx --test src/lib/job-alerts.test.ts`
- Run `npm run build`

### Phase 5: Logo, Favicon, and OG Asset Audit

**Files:**
- Inspect: `public/*`
- Modify if required: `src/app/layout.tsx`
- Modify if required: `src/app/manifest.ts`
- Modify if required: `src/app/favicon.ico`
- Modify if required: `src/app/apple-icon.png`
- Modify if required: `src/app/icon.svg`
- Modify if required: `public/logo-icon.svg`
- Modify if required: `public/logo.svg`
- Modify if required: `public/og-image.png`

**Step 1: Inventory current assets**
- Confirm which logo, favicon, icon, and OG assets actually exist.
- Verify each referenced asset exists before editing.

**Step 2: Fix or create missing assets**
- Keep the mark clean, modern, and Malta-native without registry, government, or casino clichés.
- Ensure the logo reads well in small sizes.
- Use only repo-native assets, self-created SVG/CSS/text assets, or clearly licensed assets.
- Do not introduce unlicensed fonts, stock logos, stock icons, or third-party marks.
- Do not share or commit font files.
- Avoid crests, seals, government symbols, flags-as-logo, casino clichés, dice, cards, roulette, or cheap neon.
- If an asset is missing, create only lightweight repo-native SVG/PNG assets needed by metadata.

**Step 3: Update metadata references**
- Make sure layout metadata and manifest point at the correct assets.
- Confirm metadata references match actual files.

**Step 4: Verify**
- Run `npm run lint`
- Run `npm test`
- Run `npm run build`

### Phase 6: Final Verification and Production Deploy

**Files:**
- No new files unless verification exposes a required fix

**Step 1: Verify the full brand system**
- Confirm public pages, job detail, metadata, emails, and assets all align to the new brand direction.

**Step 2: Run gates**
- Run `git status --short`
- Run `npm run lint`
- Run `npm test`
- Run `npm run build`

**Step 3: Deploy**
- Run `vercel deploy --prod -y`

**Step 4: Smoke test**
- Verify homepage, `/jobs`, one job detail page, favicon/metadata/OG basics, and at least one email build path if available.
- Include desktop and mobile smoke checks for public surfaces.
- If production is broken, rollback to the previous known-good Vercel deployment.
- If only a non-critical visual issue remains, log it as a watch item and forward-fix it.

---

## Guardrails

- Do not touch admin UI.
- Do not touch aggregation logic.
- Do not touch database schema.
- Do not touch auth/security logic.
- Do not touch AI endpoint logic.
- Do not touch email delivery logic.
- Do not touch unsubscribe token logic.
- Do not touch application count RPC logic.
- Do not touch candidate alert partial-update safety.
- Preserve job description XSS protection.
- Do not change sanitizer behavior.
- Do not reintroduce `dangerouslySetInnerHTML` for job descriptions.
- Do not introduce unrelated refactors.
- Stop if any verification gate fails.
- If lint, test, or build fails, stop and do not deploy.
- If deployment fails, do not retry blindly; capture the error and stop.
- If production smoke checks fail after deploy, classify severity and rollback if broken.
- If the issue is cosmetic only, log it as a watch item and forward-fix it.
