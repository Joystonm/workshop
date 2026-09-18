---
version: 1.0
name: Workshop Design System
description: "Premium technical design system for Workshop - a digital scientific workspace. Dark, restrained, precision-focused."
---

## Overview

Workshop's design philosophy is **technical restraint**. The interface should feel like serious engineering software, not an AI startup landing page. Every visual decision prioritizes clarity, precision, and professional credibility.

**Core Principles:**
- Precision over decoration
- Technical confidence over flashy effects
- Information density over excessive whitespace
- Restrained accent usage
- Typography-driven hierarchy

---

## Color System

### Neutral Palette (Primary Visual Identity)

Workshop uses a near-black neutral palette as its primary surface color. This creates a technical, professional atmosphere.

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#0B0D0F` | Main background |
| `--bg-secondary` | `#111417` | Elevated surfaces, headers |
| `--bg-tertiary` | `#15191D` | Cards, panels |
| `--bg-elevated` | `#1A1F24` | Hover states, tooltips |

### Text Hierarchy

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#F5F7F8` | Primary text, headings |
| `--text-secondary` | `#9AA1A8` | Body text, descriptions |
| `--text-muted` | `#606570` | Labels, captions, disabled |

### Border System

| Token | Value | Usage |
|-------|-------|-------|
| `--border-subtle` | `rgba(255,255,255,0.06)` | Subtle dividers |
| `--border-default` | `rgba(255,255,255,0.10)` | Standard borders |
| `--border-emphasis` | `rgba(255,255,255,0.16)` | Emphasized borders |

### Accent

A single restrained accent color is used sparingly for active states and key indicators:

| Token | Hex | Usage |
|-------|-----|-------|
| `--accent` | `#76B900` | Active controls, selections, key actions |
| `--accent-dim` | `rgba(118,185,0,0.15)` | Subtle accent backgrounds |

**Rule:** ~90% neutral, ~8% secondary neutral, ~2% accent. If everything is highlighted, nothing is highlighted.

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#4ADE80` | Success states |
| `--warning` | `#FBBF24` | Warning states |
| `--danger` | `#F87171` | Error states |

---

## Typography

**Font:** Geist (Google Fonts)

### Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-xs` | 11px | 400 | Labels, captions |
| `--text-sm` | 13px | 400/500 | UI text, secondary |
| `--text-base` | 15px | 400 | Body text |
| `--text-lg` | 17px | 400 | Emphasis |
| `--text-xl` | 20px | 500/600 | Section titles |
| `--text-2xl` | 24px | 600 | Page titles |
| `--text-3xl` | 30px | 600 | Hero headings |

### Principles

- Negative letter-spacing on larger text (`-0.02em` to `-0.03em`)
- Tabular numerals for data values
- Tight line-height on headings (1.1-1.2)
- Comfortable line-height on body (1.5-1.6)

---

## Spacing

Base unit: 4px

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |

---

## Border Radius

Minimal rounding for precision feel:

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small inputs, tags |
| `--radius-md` | 6px | Buttons, inputs |
| `--radius-lg` | 8px | Cards, panels |

**Rule:** No `rounded-2xl`, `rounded-3xl`, or full pill shapes. The interface should feel sharp, not soft.

---

## Shadows

**No shadows by default.** Elevation is communicated through:
- Surface color differences
- Border contrast
- Background layers

Only use borders to separate elements.

---

## Animation

Transitions should be fast and purposeful:

| Token | Duration | Usage |
|-------|----------|-------|
| `--transition-fast` | 120ms | Micro-interactions, hover |
| `--transition-base` | 200ms | Panel transitions |

**Rules:**
- No floating/bouncing animations
- No continuous ambient motion
- No parallax effects
- Animation communicates cause and effect only

---

## Components

### Buttons

**Primary:** `--accent` background, dark text
**Secondary:** `--bg-tertiary` background, light text
**Ghost:** No background, border on hover

### Navigation

- Height: 48px
- Background: `--bg-secondary`
- Bottom border: 1px `--border-subtle`
- No glassmorphism
- No backdrop blur

### Cards

- Background: `--bg-secondary`
- Border: 1px `--border-subtle`
- Border-radius: `--radius-lg`
- No shadow
- No glow effects

### Data Display

Technical data (measurements, values) should feel like instrumentation:
- Use monospace/tabular numerals
- Small labels above values
- Units in muted text

### Challenge Panels

- Positioned top-left of workspace
- Compact design with clear hierarchy
- Objectives as bullet list
- Close button (×) in header

### Status Indicators

- Small circles (6-8px) for state
- Green for active/success
- Gray for inactive
- Never use colored text for status

---

## Layout

### Page Structure

1. Fixed navigation (48px)
2. Content area fills remaining space
3. No excessive padding at top

### Workshop Structure

1. Narrow left toolbar (160-180px)
2. Main canvas/workspace fills remaining space
3. Optional floating panels (challenge, stats)
4. Status bar at bottom (optional)

### Responsive Strategy

- Desktop: Full workspace layout
- Tablet: Collapsible sidebars
- Mobile: Simplified controls, bottom sheet tools

---

## Visual Don'ts

**Never use:**
- Gradient backgrounds
- Gradient text
- Purple/blue color schemes as primary identity
- Glowing borders or shadows
- `backdrop-filter: blur()`
- `rounded-2xl` or larger
- Emoji as icons
- Decorative blobs or particles
- Floating animations
- Glassmorphism
- Card grids as primary layout

**Avoid:**
- Excessive whitespace
- Marketing language ("Super AI", "Magic", "Try Now")
- AI-specific iconography
- Gradient buttons

---

## Comparison: Before vs After

### Before (AI-Generated Look)
- Purple/blue gradient hero
- Floating glow effects
- Colorful workshop cards
- Emoji icons
- Glassmorphism navigation
- Excessive rounded corners
- Generic dashboard layout

### After (Premium Technical)
- Single dark neutral surface
- Restrained green accent
- Structured list navigation
- Clean SVG icons
- Solid borders
- Minimal radius
- Professional workspace layout

---

## Technical Notes

- All colors via CSS custom properties
- No hardcoded color values in components
- Design tokens centralized in `index.css`
- Components use utility classes for common patterns
- Typography uses responsive scale
