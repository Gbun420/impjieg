# Employer Growth Sprint Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Productize Impjieg's SEO and marketing advantage into a paid employer growth offer that captures qualified leads and surfaces a clear upsell for employers.

**Architecture:** Add a public employer growth landing page that explains the offer, packages the service into tangible outcomes, and captures leads through the existing contact email pipeline. Then surface the offer from pricing, the employer dashboard, and sitemap so it is discoverable and monetizable without changing billing or core job logic.

**Tech Stack:** Next.js App Router, React client form, existing contact API, shared UI primitives, sitemap metadata.

---

### Task 1: Add the employer growth landing page and lead capture form

**Files:**
- Create: `src/app/employer-growth/page.tsx`
- Create: `src/components/employer-growth/employer-growth-form.tsx`

**Step 1: Write the page**
- Add a public landing page that explains the SEO growth offer in plain business language.
- Include a hero, service cards, proof points, and a clear lead CTA.

**Step 2: Write the form**
- Build a client-side form that collects name, email, company, hiring focus, and notes.
- Submit to `/api/contact` with a subject and message that summarize the growth request.

**Step 3: Verify**
- Ensure the page renders on desktop and mobile without layout overlap.
- Ensure the form has labels, errors, and a success state.

### Task 2: Expose the offer from pricing and the employer dashboard

**Files:**
- Modify: `src/app/pricing/page.tsx`
- Modify: `src/app/employer/dashboard/page.tsx`

**Step 1: Add pricing visibility**
- Add a growth-services card or section that links to the employer growth page.

**Step 2: Add dashboard visibility**
- Add a small growth CTA card so signed-in employers can request help without searching.

**Step 3: Verify**
- Confirm the new offer is visible in the right conversion surfaces.

### Task 3: Add discovery metadata

**Files:**
- Modify: `src/app/sitemap.ts`

**Step 1: Add the new route**
- Include the employer growth page in the static sitemap list.

**Step 2: Verify**
- Confirm the route is discoverable without changing any job or auth logic.

### Task 4: Verification

**Files:**
- No new files unless lint or build exposes a required fix

**Step 1: Run gates**
- `git diff --check`
- `npm run lint`
- `npm test`
- `npm run build`

**Step 2: Deploy if green**
- `vercel deploy --prod -y`

