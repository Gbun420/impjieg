# Component Usage Guide

All UI components live in `src/components/ui/`. Always prefer these over custom-styled elements.

## Core Components

### Button (`src/components/ui/button.tsx`)
Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`  
Sizes: `sm`, `default`, `lg`  
States: `disabled`, `isLoading` (shows spinner)

```tsx
<Button variant="primary" size="lg">Post a Job</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="danger" size="sm">Delete</Button>
```

Rules:
- Always use `asChild` with `<Link>`: `<Button asChild><Link href="/jobs">Browse</Link></Button>`
- Destructive actions use `variant="danger"` (NOT "destructive")
- Icon-only buttons must have `aria-label`

### Badge (`src/components/ui/badge.tsx`)
Variants: `default`, `secondary`, `outline`, `success`, `warning`, `error`, `info`, `accent`

```tsx
<Badge variant="success">Salary shown</Badge>
<Badge variant="secondary">Salary not disclosed</Badge>
<Badge variant="error">Failed</Badge>
```

### Card (`src/components/ui/card.tsx`)
Use with the `.marketplace-panel` class for the standard card style:
```tsx
<Card className="marketplace-panel p-6">...</Card>
```

### Input (`src/components/ui/input.tsx`)
```tsx
<Input label="Email" name="email" type="email" required />
<Input label="Salary" name="salary" type="number" placeholder="30000" />
```

Style: `rounded-xl border border-border bg-surface/90`  
Focus: `focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30`

### Textarea (`src/components/ui/textarea.tsx`)
Same styling pattern as Input.

### Select (`src/components/ui/select.tsx`)
```tsx
<Select 
  label="Sector"
  options={[{ value: "tech", label: "Technology" }]}
  placeholder="Select..."
/>
```

### Checkbox (`src/components/ui/checkbox.tsx`)
```tsx
<Checkbox id="terms" name="terms" checked={accepted} onCheckedChange={setAccepted} />
```
Always include `name` attribute for FormData submission.

### Switch (`src/components/ui/switch.tsx`)
Toggle alternative to checkbox.
```tsx
<Switch checked={enabled} onCheckedChange={setEnabled} />
```

## Compound Patterns

### Legal Acknowledgement (`src/components/legal/legal-acknowledgement-checkboxes.tsx`)
```tsx
<LegalAcknowledgementCheckboxes
  audience="candidate"
  requireTerms
  requirePrivacyNotice
  allowMarketingConsent
  onTermsChange={setTerms}
  onPrivacyChange={setPrivacy}
/>
```

### Job Card (`src/components/jobs/job-card.tsx`)
Renders salary with states:
- Salary present: amount + "Salary shown" badge
- Salary missing: "Salary not disclosed"
- Featured job: "Priority role" badge

### Layout classes
```
Page container:     mx-auto max-w-6xl px-4 sm:px-6 lg:px-8
Section spacing:    py-12 sm:py-16
Section bordered:   border-t border-border bg-muted/30
Card grid:          grid gap-4 sm:grid-cols-2 lg:grid-cols-3
```

## Status Colours

| Status | Badge | Meaning |
|---|---|---|
| Active/Live | `success` | Job active, verified, sent |
| Pending | `warning` | Awaiting action, payment pending |
| Failed | `error` | Delivery failed, validation error |
| Draft | `secondary` | Not published |
| Info | `info` | Neutral information |
