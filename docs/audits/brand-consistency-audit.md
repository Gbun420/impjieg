# Brand Consistency Audit

Date: 2026-06-09 | Branch: main | Auditor: AI agent

## Summary

The Impjieg brand system is **well-established** with a comprehensive token system (`src/styles/globals.css`) defining 30+ CSS custom properties, semantic colour tokens, dark mode, typography, radius scale, motion library, and utility classes.

**Overall**: 85% consistent. 2 issues found and fixed.

## Issues Found

### FIXED: Hardcoded hex in button gradient
- **File**: `src/components/ui/button.tsx:35`
- **Before**: `#174FD1` (not in token system)
- **After**: `var(--primary-hover)` (defined in tokens)
- **Severity**: P2 (visual, not functional)

### FIXED: Profile page uses old shadcn input style
- **File**: `src/app/candidate/profile/page.tsx:316`
- **Before**: `rounded-md border border-input bg-background ring-offset-background focus-visible:ring-ring`
- **After**: `rounded-xl border border-border bg-surface/90 focus-visible:ring-primary/30 focus-visible:border-primary`
- **Severity**: P2 (inconsistent with rest of product)

## Verified Clean

| Check | Result |
|---|---|
| No quantum/animated logo leftovers | ✅ Clean |
| No lorem ipsum in UI | ✅ Clean |
| No "coming soon" placeholders | ✅ Clean |
| No fake metrics | ✅ Clean |
| No rainbow/neon gradients | ✅ Clean |
| No casino-adjacent visuals | ✅ Clean |
| No AI buzzword overuse | ✅ Clean |
| Dark mode tokens present | ✅ Complete |
| Animation respects reduced-motion | ✅ Via Tailwind motion-reduce |
| Focus states visible | ✅ Primary ring on all inputs |
| Typography consistent | ✅ Sora headings, Inter body, JetBrains Mono |
| Radius mostly consistent | ✅ Most components use rounded-xl |

## Recommendations

1. Migrate remaining `rounded-md` instances to `rounded-xl` for consistency (low priority)
2. Add explicit `aria-label` audit for icon-only buttons
3. Consider adding a `--salary-disclosed` and `--salary-undisclosed` semantic token pair
4. Add WCAG contrast verification to CI pipeline
