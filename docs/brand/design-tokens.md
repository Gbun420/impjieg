# Impjieg Design Tokens

Source of truth: `src/styles/globals.css`

## Quick Reference

### Colours
```
primary     → --signal-blue   #2563EB → cta, links, focus
secondary   → --lagoon        #14C7B7 → accents, badges (NOT text on white)
accent      → --saffron       #FFB020 → warnings, highlights
success     → --emerald       #12B76A → salary shown, verified
warning     → --saffron       #FFB020 → pending, needs attention
error       → --rose          #E5484D → destructive, failed
muted       → #EAF0F6 / #142235 → secondary bg
surface     → #FFFFFF / #121A2B → card bg
border      → #DBE4F0 / #22334A → borders
```

### Typography
```
Headings → Sora (display), tracking -0.03em
Body     → Inter (sans), default
Mono     → JetBrains Mono (mono)
```

### Radius
```
Buttons/Inputs  → rounded-xl  (12px)
Cards/Panels    → rounded-2xl (24px) or rounded-[1.5rem]
Badges/Pills    → rounded-full (9999px)
```

### Shadows (Tailwind v4)
```
Card:     shadow-[0_8px_24px_rgba(11,18,32,0.06)]
Elevated: shadow-[0_18px_60px_rgba(11,18,32,0.08)]
CTA:      shadow-[0_12px_28px_rgba(30,99,255,0.22)]
```

### Common utility classes
```
.text-gradient     → gradient blue→teal text
.brand-eyebrow     → uppercase section label pill
.marketplace-panel → glass card with soft shadow
.glow-hover        → subtle blue glow on hover
.animate-fade-in   → fade + slight Y shift
.animate-scale-in  → scale 0.95→1 appear
.stagger-1..8      → staggered fade delays
```

### Tailwind class names for semantic tokens
```
bg-primary, text-primary, border-primary
bg-surface, bg-muted, bg-card
text-muted-foreground
border-border, border-border-hover
bg-success, text-success
bg-error, text-error
bg-warning
```

### Dark mode
All semantic tokens have dark variants. Toggle via `.dark` class.
