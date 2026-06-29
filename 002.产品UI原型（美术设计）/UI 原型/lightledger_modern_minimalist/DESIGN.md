---
name: LightLedger Modern Minimalist
colors:
  surface: '#FFFFFF'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#EF4444'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  text-primary: '#111827'
  text-secondary: '#6B7280'
  border: '#E5E7EB'
  primary-hover: '#1D4ED8'
typography:
  display-title:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-card:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-main:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-secondary:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-helper:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  display-title-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  layout-margin: 24px
  layout-gutter: 16px
---

## Brand & Style

The design system is built upon the philosophy of **"Efficiency through Clarity."** It targets users who seek a frictionless, professional-grade financial tracking tool that feels dependable yet lightweight. The aesthetic direction is **Modern Minimalism**, characterized by high-quality typography, generous whitespace, and a disciplined "flat-plus" approach to depth.

The UI should evoke a sense of **quiet confidence and order**. By stripping away decorative elements and focusing on a systematic 4px grid, the design system ensures that the user's financial data remains the primary focus. Interaction patterns are designed to be "invisible," supporting the goal of a 30-second-or-less entry workflow while maintaining the sophisticated feel of a premium SaaS product.

## Colors

This design system utilizes a high-clarity functional palette. **Primary Blue** is the anchor for all interactive elements and brand identifiers. **Success Green**, **Warning Amber**, and **Error Red** are reserved strictly for semantic feedback and financial trend indicators (e.g., income vs. expense).

The background strategy employs a "Cool Gray" neutral to reduce eye strain, while pure white surfaces are used for content containers (cards) to create a distinct visual stack. Text contrast adheres to high accessibility standards, using a near-black for primary information and a medium gray for supporting metadata.

## Typography

The typography system prioritizes legibility and vertical rhythm. **Inter** is the primary typeface, paired with **PingFang SC** for Chinese character rendering to ensure a clean, modern look across all platforms.

- **Scale:** Headlines use a tighter letter-spacing to appear more grounded and authoritative. 
- **Hierarchy:** Use `display-title` for page-level headers. For mobile views, downscale large headings to `display-title-mobile` to maintain balanced density.
- **Data Display:** Numerical financial data should ideally use tabular figures (where available) to ensure vertical alignment in lists and tables.

## Layout & Spacing

The layout is governed by a **4px base grid**, ensuring all components align to a consistent mathematical rhythm. 

### Grid System
- **Desktop:** A 12-column fluid grid is used for the main dashboard, with a maximum content width of 1280px.
- **Mobile:** A single-column layout with 16px side margins.
- **Reflow:** On tablet devices, cards should transition from a 3-column to a 2-column grid.

### Spacing Principles
Internal component padding should typically follow the `md` (16px) or `lg` (24px) units to maintain an airy, minimalist feel. Use `sm` (12px) for tighter associations, such as the gap between a label and its input field.

## Elevation & Depth

This system avoids heavy shadows in favor of **Tonal Layers** and **Subtle Outlines**. 

1.  **Level 0 (Floor):** The background (`#F9FAFB`).
2.  **Level 1 (Cards/Surfaces):** Pure white containers with a 1px solid border (`#E5E7EB`). No shadow is applied in the default state to maintain a flat, clean aesthetic.
3.  **Level 2 (Active/Floating):** Modals and dropdowns use a very soft, diffused ambient shadow (Color: `Primary-Blue`, Opacity: 4%, Blur: 12px) to suggest elevation without cluttering the interface.

**Interactive States:**
- **Hover:** Buttons and interactive cards should transition to a slightly darker background or show a subtle 2px border highlight.
- **Active (Click):** Use a `scale(0.98)` transform to provide tactile feedback, simulating a physical press.

## Shapes

The shape language uses varying degrees of roundedness to signify the "container" hierarchy. Larger containers are softer to appear more approachable, while interactive elements are slightly sharper to feel more "precise" and "tool-like."

- **Cards:** 12px (`rounded-lg`) - Creates a soft, distinct frame for content.
- **Buttons:** 8px (`rounded-md`) - The standard interactive unit.
- **Inputs:** 6px (`rounded-sm`) - A sharper radius that suggests technical precision and data entry focus.

## Components

### Buttons
- **Primary:** Background `#2563EB`, Text `#FFFFFF`, 8px radius.
- **Secondary:** Background `#FFFFFF`, Border 1px `#E5E7EB`, Text `#111827`.
- **Loading State:** Replace label with a centered spinner; disable pointer events.

### Input Fields
- **Default:** 6px radius, 1px border `#E5E7EB`.
- **Focus:** Border color changes to `#2563EB` with a 2px outer glow (Primary Blue at 10% opacity).
- **Amount Input:** Use a larger font size for the "Amount" field in the record view to emphasize it as the primary action.

### Cards
- **Style:** White background, 12px radius, 1px border. 
- **Usage:** Used for "Account Overview," "Recent Transactions," and "Budget Progress."

### Chips/Tags
- **Categories:** Use a light gray background with the semantic Emoji on the left.
- **Status:** Use tinted backgrounds (e.g., 10% opacity of Success Green) for status indicators.

### Lists
- **Consumption Details:** Use a 1px divider between items. Each item should have a clear 16px horizontal padding. The amount should be bold and right-aligned.

### Feedback
- **Toasts:** Floating at the top center. Success toasts persist for 2s; Error toasts require manual dismissal.