# Figma Design Spec — TCDynamics Frontend

**Source of truth:** This repo — `apps/frontend/src/index.css`, `apps/frontend/tailwind.config.ts`, and components.  
**Purpose:** Use this doc to create or update Figma Local styles, Variables, and layout so the design matches the shipped code. Update this file whenever the design system in code changes.

---

## 1. Colors

All values are defined as HSL in CSS; hex/RGBA below are computed for Figma. Use **Light** for default frames and **Dark** for dark-mode variants.

### Semantic colors (Light)

| Semantic name        | CSS variable           | HSL (code)        | Hex (Figma) | Suggested Figma style name   |
|----------------------|------------------------|-------------------|-------------|------------------------------|
| Background            | `--background`         | 0 0% 100%         | `#FFFFFF`   | Background                  |
| Foreground            | `--foreground`         | 0 0% 3.9%         | `#0A0A0A`   | Foreground                  |
| Card                  | `--card`               | 0 0% 100%         | `#FFFFFF`   | Card                        |
| Card foreground       | `--card-foreground`    | 0 0% 3.9%         | `#0A0A0A`   | Card foreground             |
| Popover               | `--popover`            | 0 0% 100%         | `#FFFFFF`   | Popover                     |
| Popover foreground    | `--popover-foreground` | 0 0% 3.9%         | `#0A0A0A`   | Popover foreground          |
| Primary               | `--primary`            | 200° 95% 48%      | `#0EA5E9`   | Primary                     |
| Primary foreground    | `--primary-foreground` | 0 0% 100%         | `#FFFFFF`   | Primary foreground          |
| Primary glow          | `--primary-glow`       | 200° 95% 60%      | `#38BDF8`   | Primary glow                |
| Secondary             | `--secondary`         | 0 0% 96.1%        | `#F5F5F5`   | Secondary                   |
| Secondary foreground  | `--secondary-foreground` | 0 0% 9%         | `#171717`   | Secondary foreground        |
| Muted                 | `--muted`              | 0 0% 96.1%        | `#F5F5F5`   | Muted                       |
| Muted foreground      | `--muted-foreground`   | 0 0% 45.1%        | `#737373`   | Muted foreground            |
| Accent                | `--accent`             | 0 0% 96.1%        | `#F5F5F5`   | Accent                      |
| Accent foreground     | `--accent-foreground`  | 0 0% 9%           | `#171717`   | Accent foreground           |
| Destructive           | `--destructive`        | 0 84.2% 60.2%     | `#EF4444`   | Destructive                 |
| Destructive foreground| `--destructive-foreground` | 0 0% 98%   | `#FAFAFA`   | Destructive foreground      |
| Border                | `--border`             | 0 0% 89.8%        | `#E5E5E5`   | Border                      |
| Input                 | `--input`              | 0 0% 89.8%        | `#E5E5E5`   | Input                       |
| Ring                  | `--ring`               | 0 0% 3.9%         | `#0A0A0A`   | Ring (focus)                |

### Semantic colors (Dark)

| Semantic name        | CSS variable           | HSL (code)        | Hex (Figma) | Suggested Figma style name   |
|----------------------|------------------------|-------------------|-------------|------------------------------|
| Background            | `--background`         | 0 0% 3.9%         | `#0A0A0A`   | Background (dark)           |
| Foreground            | `--foreground`         | 0 0% 98%          | `#FAFAFA`   | Foreground (dark)            |
| Card                  | `--card`               | 0 0% 3.9%         | `#0A0A0A`   | Card (dark)                  |
| Card foreground       | `--card-foreground`    | 0 0% 98%          | `#FAFAFA`   | Card foreground (dark)       |
| Popover               | `--popover`            | 0 0% 3.9%         | `#0A0A0A`   | Popover (dark)               |
| Popover foreground    | `--popover-foreground` | 0 0% 98%          | `#FAFAFA`   | Popover foreground (dark)    |
| Primary               | `--primary`            | 200° 95% 48%      | `#0EA5E9`   | Primary (same)              |
| Primary foreground    | `--primary-foreground` | 0 0% 100%         | `#FFFFFF`   | Primary foreground (same)    |
| Primary glow          | `--primary-glow`       | 200° 95% 60%      | `#38BDF8`   | Primary glow (same)          |
| Secondary             | `--secondary`         | 0 0% 14.9%        | `#262626`   | Secondary (dark)             |
| Secondary foreground  | `--secondary-foreground` | 0 0% 98%       | `#FAFAFA`   | Secondary foreground (dark)  |
| Muted                 | `--muted`              | 0 0% 14.9%        | `#262626`   | Muted (dark)                 |
| Muted foreground      | `--muted-foreground`   | 0 0% 63.9%        | `#A3A3A3`   | Muted foreground (dark)      |
| Accent                | `--accent`             | 0 0% 14.9%        | `#262626`   | Accent (dark)                |
| Accent foreground     | `--accent-foreground`  | 0 0% 98%          | `#FAFAFA`   | Accent foreground (dark)     |
| Destructive           | `--destructive`        | 0 62.8% 30.6%     | `#9F1239`   | Destructive (dark)           |
| Destructive foreground| `--destructive-foreground` | 0 0% 98%   | `#FAFAFA`   | Destructive foreground (dark) |
| Border                | `--border`             | 0 0% 14.9%        | `#262626`   | Border (dark)                |
| Input                 | `--input`              | 0 0% 14.9%        | `#262626`   | Input (dark)                 |
| Ring                  | `--ring`               | 0 0% 83.1%        | `#D4D4D4`   | Ring (dark)                  |

### Chart colors (Light)

| Name     | CSS variable | HSL (code)   | Hex (Figma) | Suggested Figma style name |
|----------|--------------|--------------|-------------|----------------------------|
| Chart 1  | `--chart-1`  | 12 76% 61%   | `#E08B5C`   | Chart 1                    |
| Chart 2  | `--chart-2`  | 173 58% 39%  | `#2D9D8A`   | Chart 2                    |
| Chart 3  | `--chart-3`  | 197 37% 24%  | `#234A5C`   | Chart 3                    |
| Chart 4  | `--chart-4`  | 43 74% 66%   | `#E5C65C`   | Chart 4                    |
| Chart 5  | `--chart-5`  | 27 87% 67%   | `#F0A055`   | Chart 5                    |

### Chart colors (Dark)

| Name     | CSS variable | HSL (code)   | Hex (Figma) | Suggested Figma style name |
|----------|--------------|--------------|-------------|----------------------------|
| Chart 1  | `--chart-1`  | 220 70% 50%  | `#2563EB`   | Chart 1 (dark)             |
| Chart 2  | `--chart-2`  | 160 60% 45%  | `#2D9D7A`   | Chart 2 (dark)             |
| Chart 3  | `--chart-3`  | 30 80% 55%   | `#E89B4D`   | Chart 3 (dark)             |
| Chart 4  | `--chart-4`  | 280 65% 60%  | `#A855F7`   | Chart 4 (dark)             |
| Chart 5  | `--chart-5`  | 340 75% 55%  | `#EC4899`   | Chart 5 (dark)             |

### Gradients (reference; create as gradient fills in Figma)

- **Gradient primary:** 135° linear, Primary → Primary glow (`#0EA5E9` → `#38BDF8`).
- **Gradient hero (light):** 135° linear, 3 stops: `hsl(50 30% 92%)` → `hsl(50 20% 95%)` (50%) → `hsl(50 50% 97%)` (100%). Approx hex: `#EDE9E0` → `#F2F0EB` → `#F9F8F3`.
- **Gradient card:** 135° linear, Card → Muted (same as code).

**Note:** Sidebar colors (`--sidebar-background`, etc.) are referenced in `tailwind.config.ts` but not defined in `index.css`. For Figma you can duplicate Card/Popover styles or add a “Sidebar” set when those tokens are added to the codebase.

---

## 2. Typography

| Role / usage        | Font family (code)              | Tailwind key | Size (code)     | Weight | Line height | Suggested Figma text style |
|---------------------|---------------------------------|--------------|------------------|--------|-------------|----------------------------|
| Body / UI            | DM Sans, system-ui, sans-serif  | `font-sans`  | 16px (base)      | 400    | default     | Body / Sans                |
| Headings (h1–h3)     | Outfit, DM Sans, system-ui      | `font-display`| —                | —      | —           | Display                    |
| Monospace / badges   | ui-monospace, monospace         | `font-mono`  | 12–14px in use   | 400    | default     | Mono                       |

**Base (index.css):** `html` base 16px; mobile `@media (max-width: 768px)`: `html` 16px, `h1` 2rem (32px) / 1.2, `h2` 1.75rem (28px) / 1.3, `h3` 1.5rem (24px) / 1.4.

**Suggested Figma text styles:** Create “Display / H1”, “Display / H2”, “Display / H3” (Outfit), “Sans / Body”, “Sans / Small”, “Mono / Caption” (sizes/weights as in components). Default body: DM Sans 16px, weight 400.

---

## 3. Spacing & layout

### Container

- **Max width:** 1400px (Tailwind `screens.2xl`).
- **Padding:** 2rem (32px) — Tailwind `container.padding: '2rem'`.
- **Usage:** `container mx-auto px-4` or `px-6`; horizontal padding overrides common (16px / 24px).

### Recurring spacing (convert to pixels for Figma)

| Tailwind class | Pixels | Usage / note           |
|----------------|--------|------------------------|
| `p-4`          | 16px   | Nav, mobile padding    |
| `px-4`         | 16px horizontal | Section inner padding |
| `px-6`         | 24px horizontal | Hero, Demo, Checkout  |
| `py-12`        | 48px vertical  | Footer section        |
| `py-16`        | 64px vertical  | Demo sections         |
| `py-20`        | 80px vertical  | Hero (base)           |
| `py-24`        | 96px vertical  | SocialProof, Contact, FAQ, HowItWorks, LocalAdvantages |
| `py-32`        | 128px vertical | Hero large (lg)       |
| `pb-28`        | 112px bottom   | Hero (base)           |
| `pb-40`        | 160px bottom   | Hero large (lg)       |
| `gap-2`        | 8px    | Inline icon + text     |
| `gap-3`        | 12px   | Buttons, list items    |
| `gap-4`        | 16px   | Form rows, grids       |
| `gap-6`        | 24px   | Footer trust row       |
| `gap-8`        | 32px   | Section content grids  |
| `gap-16`       | 64px   | Hero two-column gap    |
| `gap-20`       | 80px   | Hero two-column (lg)   |
| `mb-12`        | 48px   | Footer top block       |
| `pb-12`        | 48px   | Footer border block    |

**Grid:** 4px base grid recommended; major sections use 16px / 24px / 32px multiples.

---

## 4. Radii and shadows

### Border radius

| Token / Tailwind | Value (code)              | Pixels | Suggested Figma name |
|------------------|----------------------------|--------|----------------------|
| `--radius`       | 0.5rem                     | 8px    | Radius / lg          |
| `borderRadius.md`| calc(var(--radius) - 2px)  | 6px    | Radius / md          |
| `borderRadius.sm`| calc(var(--radius) - 4px)  | 4px    | Radius / sm          |

### Shadows (Figma: effect with blur + offset; use Primary hex where needed)

| Name (code)       | Value (resolved for light) | Suggested Figma style name |
|-------------------|----------------------------|----------------------------|
| `--shadow-primary`| 0 10px 30px -10px rgba(14, 165, 233, 0.2) | Shadow primary   |
| `--shadow-glow`   | 0 0 40px rgba(56, 189, 248, 0.15)         | Shadow glow      |
| `--shadow-button` | 0 4px 20px rgba(14, 165, 233, 0.25)       | Shadow button    |
| `--shadow-elegant`| 0 20px 60px -10px rgba(0, 0, 0, 0.15)     | Shadow elegant   |

Use the same structure in dark mode; only the underlying primary/glow hex stays the same.

---

## 5. Layout notes (page structure)

Use these to align Figma frame structure and padding with the live site.

### Hero

- **Section:** Full-width; background uses `hero-gradient` (see Gradient hero above).
- **Content:** `container mx-auto px-6 py-20 pb-28 lg:py-32 lg:pb-40`.
- **Layout:** Two columns: `grid items-center gap-16 lg:grid-cols-2 lg:gap-20`.
- **Spacing:** More bottom padding (pb-28 / pb-40) so the video card can overlap the next section.

### Footer

- **Section:** `border-t border-border/40 bg-background py-12`.
- **Inner:** `container mx-auto px-4`.
- **Top block:** Trust row — `mb-12 border-b border-border/40 pb-12`, `gap-6`, `font-mono text-sm text-muted-foreground`.
- **Bottom block:** Nav grid — `grid grid-cols-1 gap-8 md:grid-cols-4`.

### Recurring section pattern

- **Wrapper:** `relative overflow-hidden bg-gradient-to-b from-background/50 to-background py-24` (or `py-16`, `py-20`).
- **Content:** `container relative z-10 mx-auto px-4` (or `px-6`).
- **Grids:** Often `gap-8`, `lg:grid-cols-2` or `lg:grid-cols-3`, sometimes `max-w-7xl` or `max-w-5xl` for inner width.

### Navigation (SimpleNavigation)

- **Bar:** `container mx-auto p-4`; on lg: `grid grid-cols-[1fr_auto_1fr]` with `gap-4`.
- **CTA:** `rounded-full bg-primary px-4 py-2 text-primary-foreground` (min touch target 44px).

### Demo page

- Sections alternate `py-20`, `py-16`; inner `container mx-auto px-6`; grids `gap-8`, `gap-12`, `max-w-5xl` / `max-w-7xl` where used.

---

## 6. Figma-side checklist

- [ ] Create **Color styles** (or Variables in a “tcdynamics” / “Code” set) for every semantic and chart color above; duplicate for dark where values differ.
- [ ] Optionally create **Text styles** for Display (Outfit), Sans (DM Sans), Mono.
- [ ] Create **Effect styles** for the four shadows.
- [ ] Set **border radius** tokens (8px, 6px, 4px).
- [ ] Apply these styles to the imported tcdynamics frames (replace fills/strokes with the new color styles).
- [ ] Set frame or content width to **1400px** and apply container padding (e.g. 32px) and section spacing from §3 and §5.

When the codebase design tokens or layout change, update this spec and then refresh Figma styles/layout from it.
