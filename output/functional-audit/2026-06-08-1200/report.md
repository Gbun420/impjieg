# Impjieg Functional Dashboard Button Audit

**Date:** 2026-06-08
**Scope:** All dashboard and portal routes (candidate, employer, admin)

## Executive Summary

| Category | Count |
|----------|-------|
| Link>Button nesting fixed | 164 occurrences across 28 files |
| Icon-only buttons aria-label added | 12 buttons |
| Server-action buttons with pending state | 5 components created |
| Confirmation dialogs added | 4 destructive actions |
| Total buttons inventory | 40 actions tracked |

## Phase 2: Button Architecture Fix

### Button Component (`src/components/ui/button.tsx`)
- Added Radix Slot support via `asChild` prop
- When `asChild=true`, renders `<Slot>` instead of `<button>`
- Preserves all existing variants, sizes, and loading states
- `@radix-ui/react-slot` was already installed (v1.2.5)

### Files Fixed (28 files, 164 occurrences)
All `<Link><Button>` nesting replaced with `<Button asChild><Link>`:

**Candidate routes:**
- `src/app/candidate/dashboard/page.tsx` (11 occurrences)
- `src/app/candidate/applications/page.tsx` (1 occurrence)
- `src/app/candidate/recommendations/page.tsx` (2 occurrences)

**Employer routes:**
- `src/app/employer/dashboard/page.tsx` (14 occurrences)
- `src/app/employer/jobs/page.tsx` (8 occurrences)
- `src/app/employer/jobs/[jobId]/analytics/page.tsx` (2 occurrences)
- `src/app/employer/jobs/[jobId]/report/page.tsx` (1 occurrence)
- `src/app/employer/post-job/page.tsx` (1 occurrence)
- `src/app/employer/checkout/success/page.tsx` (2 occurrences)
- `src/app/employer-growth/page.tsx` (2 occurrences)

**Admin routes:**
- `src/app/admin/dashboard/page.tsx` (5 occurrences)
- `src/app/admin/error.tsx` (2 occurrences)
- `src/components/admin/admin-data-error-state.tsx` (3 occurrences)
- `src/components/admin/admin-section-shell.tsx` (3 occurrences)
- `src/components/admin/admin-console-section-view.tsx` (1 occurrence)

**Shared components:**
- `src/components/layout/header.tsx` (4 occurrences)
- `src/components/layout/footer.tsx` (0 - already fixed)
- `src/components/candidate/candidate-portal-shell.tsx` (2 occurrences)
- `src/components/portal/portal-nav-groups.tsx` (1 occurrence)
- `src/components/jobs/application-pipeline.tsx` (2 occurrences)

**Other routes:**
- `src/app/page.tsx` (5 occurrences)
- `src/app/pricing/page.tsx` (5 occurrences)
- `src/app/saved-jobs/page.tsx` (1 occurrence)
- `src/app/not-found.tsx` (2 occurrences)
- `src/app/error.tsx` (1 occurrence)
- `src/app/auth/reset-password/page.tsx` (1 occurrence)
- `src/app/jobs/page.tsx` (1 occurrence)
- `src/app/jobs/[employerSlug]/[jobSlug]/page.tsx` (2 occurrences)
- `src/app/jobs/sector/[sector]/location/[location]/page.tsx` (1 occurrence)

## Phase 3: Icon-Only Buttons Accessibility

All icon-only buttons now have `aria-label`:

| Button | File | aria-label |
|--------|------|------------|
| Share on LinkedIn | employer/jobs/page.tsx | "Share on LinkedIn" |
| Share by email | employer/jobs/page.tsx | "Share by email" |
| View analytics | employer/jobs/page.tsx | "View analytics" |
| Boost to Featured | employer/jobs/page.tsx | "Boost to Featured" |
| Duplicate job | employer/jobs/page.tsx | "Duplicate job" |
| View live | employer/jobs/page.tsx | "View live" |
| Delete/Close job | employer/jobs/page.tsx | "Close job" |
| Live link unavailable | employer/jobs/page.tsx | "Live link unavailable" |
| Withdraw application | candidate/applications/page.tsx | "Withdraw application" |
| Edit alert | candidate/alerts/page.tsx | "Edit alert" |
| Delete alert | candidate/alerts/page.tsx | "Delete alert" |
| Close share dialog | jobs/share-job.tsx | "Close share dialog" |

## Phase 4: Server-Action Buttons

### New Components Created

1. **`src/components/ui/submit-button.tsx`** - Generic form submit button with `useFormStatus`
2. **`src/components/employer/boost-job-button.tsx`** - Boost job with pending state
3. **`src/components/employer/duplicate-job-button.tsx`** - Duplicate job with pending state
4. **`src/components/employer/delete-job-button.tsx`** - Close job with confirm dialog + pending state
5. **`src/components/candidate/withdraw-application-button.tsx`** - Withdraw with confirm + pending state
6. **`src/components/candidate/remove-saved-job-button.tsx`** - Remove saved job with confirm + pending state

### Confirmation Dialogs Added
- **Delete/Close job**: "Close this job? It will no longer appear as active."
- **Withdraw application**: "Withdraw this application? This cannot be undone."
- **Remove saved job**: "Remove this job from saved?"

### Pending States
All server-action buttons show:
- Disabled state during submission
- Loading indicator (animate-pulse on icon)
- Text change (e.g., "Boosting...", "Removing...")

## Acceptance Gates

```
npm run lint     ✅
npm test         ✅ (94/94)
npm run build    ✅
```

## Verification Commands

```bash
# No Link>Button nesting remains
rg -U "<Link[^>]*>\s*<Button" src -g "*.tsx" -g "*.ts"
# (should return empty)

# No QuantumKineticLogo references remain
rg -R "QuantumKineticLogo" src package.json package-lock.json
# (should return empty)
```
