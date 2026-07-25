# GenFlow Design System

Version 1.0 | Date: 2024

## Philosophy

- Professional and engineering-focused
- Minimal but precise
- Geometric and structured
- Trustworthy and modern

## Colors

| Name | Hex | Usage |
|------|-----|-------|
| Navy | `#181c34` | Primary |
| Teal | `#298581` | Accent |
| Gold | `#ecb856` | Emphasis |
| Dark BG | `#0A0F2E` | Dark Mode |
| Light BG | `#F8F9FB` | Light Mode |

## Typography

- **Font:** IRANSansX / Vazirmatn
- **H1:** 24px, Bold
- **Body:** 15px, Regular
- **Caption:** 13px

## Components

### GenCard
Card with teal accent line on the right side.

```tsx
<GenCard>
  <GenBadge>Title</GenBadge>
  <h1>Content</h1>
</GenCard>
```

### GenBadge
Small badges for labels.

```tsx
<GenBadge>Approved</GenBadge>
<GenBadge variant="gold">Special</GenBadge>
```

### GenButton
Primary buttons.

```tsx
<GenButton>Continue</GenButton>
<GenButton variant="secondary">Back</GenButton>
```

### GenInput
Text inputs.

```tsx
<GenInput placeholder="Your name" />
```

## Rules

- **Spacing:** 8px base unit
- **Border Radius:** Card 24px, Button 8px
- **Shadow:** `0 8px 22px rgba(0,0,0,0.045)`

## Dark Mode

```css
[data-theme="dark"] {
  --color-bg-primary: #0A0F2E;
  --color-bg-card: #10183c;
  --color-text-primary: #F8FAFC;
}
```
