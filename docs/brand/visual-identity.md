# Impjieg Visual Identity System

## Design Tokens

Impjieg uses a semantic token system built on CSS custom properties and Tailwind v4 `@theme inline`.

Source of truth: `src/styles/globals.css`

### Colour System

#### Brand Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-ink` | `#0B1220` | Primary text, dark backgrounds |
| `--color-ink-light` | `#121A2B` | Dark surfaces, cards |
| `--color-harbor` | `#08111F` | Deep hero sections |
| `--color-signal-blue` | `#2563EB` | Primary brand colour |
| `--color-lagoon` | `#14C7B7` | Secondary accent, used sparingly as accent ONLY (not text on white) |
| `--color-deep-lagoon` | `#0F766E` | Lagoon-safe text variant for white backgrounds |
| `--color-saffron` | `#FFB020` | Warning, accent highlights |
| `--color-limestone` | `#F7F4EC` | Warm background tint |
| `--color-mist` | `#F5F8FC` | Default light background |
| `--color-surface` | `#FFFFFF` | Card surfaces |
| `--color-deep-slate` | `#334155` | Secondary text |
| `--color-slate` | `#64748B` | Muted text |
| `--color-emerald` | `#12B76A` | Success, salary shown |
| `--color-rose` | `#E5484D` | Error, destructive states |
| `--color-border` | `#DBE4F0` | Default borders |

#### Semantic Tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| `--primary` | `#2563EB` | `#7AA8FF` | CTAs, links, focus rings |
| `--secondary` | `#14C7B7` | `#46D1BE` | Accent elements, badges |
| `--accent` | `#FFB020` | `#FFBF66` | Warnings, highlights |
| `--success` | `#12B76A` | `#3CCF95` | Salary shown, completed |
| `--warning` | `#FFB020` | `#FFCA66` | Needs attention |
| `--error` | `#E5484D` | `#FF7A6C` | Destructive, failed |
| `--muted` | `#EAF0F6` | `#142235` | Secondary backgrounds |
| `--surface` | `#FFFFFF` | `#121A2B` | Card backgrounds |
| `--border` | `#DBE4F0` | `#22334A` | Borders, dividers |

#### Usage Rules

1. **Primary (#2563EB)** on white text → use `text-primary` (Tailwind handles contrast)
2. **Lagoon (#14C7B7)** MUST NOT be used as text on white backgrounds. Use `--deep-lagoon` (#0F766E) for text. Lagoon is for decorative accents, badges, and icons only.
3. **Success (#12B76A)** for salary shown badges, complete states, verification.
4. **Error (#E5484D)** for destructive actions, failed receipts, validation errors.
5. **Warning (#FFB020)** for pending states, needs-attention badges.

### Typography

| Role | Font | Weight | Usage |
|---|---|---|---|
| Headings | Sora | 600-800 | h1-h4, hero headlines |
| Body | Inter | 400-600 | Paragraphs, labels, inputs |
| Mono | JetBrains Mono | 400-600 | Salary amounts, receipt IDs, code |

Heading scale (Sora, tracking -0.03em):
- h1: text-4xl sm:text-5xl lg:text-6xl font-bold
- h2: text-xl sm:text-2xl font-bold
- h3: text-lg font-semibold
- h4: text-base font-semibold

Body scale (Inter):
- Body: text-sm sm:text-base
- Small: text-xs
- Caption: text-[0.65rem]
- Eyebrow: text-xs uppercase tracking-[0.18em] font-semibold

### Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 8px | Small elements |
| `--radius-md` | 12px | Buttons, inputs |
| `--radius-lg` | 16px | Cards, dialogs |
| `--radius-xl` | 20px | Large cards |
| `--radius-2xl` | 24px | Hero cards, feature panels |
| `--radius-full` | 9999px | Badges, pills |

**Warning**: Some legacy components use `rounded-md` (6px). These should be migrated to `rounded-xl` for consistency.

### Shadows

Use the built-in Tailwind shadow scale or subtle manual shadows:
- Standard card: `shadow-[0_8px_24px_rgba(11,18,32,0.06)]`
- Elevated: `shadow-[0_18px_60px_rgba(11,18,32,0.08)]`
- Primary CTA hover: `shadow-[0_12px_28px_rgba(30,99,255,0.22)]`

Never use:
- Heavy cheap box shadows (e.g., `0 4px 6px rgba(0,0,0,0.3)`)
- Neon glow shadows
- Rainbow gradients

### Motion

Use subtle, meaningful animations:
- Page enter: `animate-fade-in-up` (opacity + slight Y shift)
- Element appear: `animate-fade-in` or `animate-scale-in`
- Respect `prefers-reduced-motion` (Tailwind handles via `motion-reduce:` variants)

Never use:
- Constant spinning/bouncing elements
- Heavy parallax
- Scroll-jacking
- Auto-playing video backgrounds

### Logo System

Keep current `ImpjiegMark` SVG component.  
The animated 3D logo (`QuantumKineticLogo`) is NOT in use and should not be reactivated.

Logo variants needed:
1. Primary horizontal: `ImpjiegMark` + "Impjieg" text
2. Compact mark: `ImpjiegMark` icon only (favicon, small spaces)
3. Monochrome: Both light and dark versions

### Utility Classes

| Class | Purpose |
|---|---|
| `.text-gradient` | Gradient text (primary → secondary) |
| `.brand-eyebrow` | Small uppercase badge for section labels |
| `.marketplace-panel` | Glass-morphism card with soft shadow |
| `.glow-hover` | Subtle border glow on hover |
| `.animate-*` | Fade, scale, shimmer, float, pulse-glow |
| `.stagger-1` through `.stagger-8` | Staggered animation delays |
