# GrantGPT: Design Guidelines

This document provides comprehensive design guidelines for the GrantGPT platform, establishing consistency across all product touchpoints and ensuring a cohesive user experience.

## Color System

### Main Brand Colors
- **Primary (Deep Navy Blue):** `#0A2463`
- **Secondary (Honey Gold):** `#FFD166`
- **Background:** `#F8F9FA` (Off-White)
- **Text Primary:** `#133075` (Deep Navy Text)

### Additional Brand Colors
- **Lavender Purple:** `#7B68EE`
- **Teal:** `#3CAEA3`
- **Text Secondary:** `#5D5B8D` (Muted Lavender)
- **Text Subtitle:** `#3D56A6` (Royal Blue)
- **Text Highlight:** `#6A5ACD` (Bright Purple)

### Color Usage Guidelines
- **Primary Deep Navy Blue (`#0A2463`):** Used for primary buttons, main navigation elements, and section headers
- **Honey Gold (`#FFD166`):** Used for accents, highlights, visual indicators, and secondary buttons
- **Lavender Purple (`#7B68EE`):** Used for tertiary elements, hover states, and decorative elements
- **Teal (`#3CAEA3`):** Used sparingly for highlighting specific information or for badges

### Background & Gradient Usage
- **Primary background:** `#F8F9FA` (Off-White)
- **Card backgrounds:** Linear gradient from `#FFFFFF` to `#F8F9FA`
- **Feature backgrounds:** Gradient from `#0A2463` to `#7B68EE` at 8-15% opacity
- Honeycomb patterns should be used at 10-20% opacity in background elements

## Typography

### Font Families
- **Proxima Nova Bold:** For headings and titles
- **Proxima Nova Medium:** For subheadings
- **Inter Regular:** For body text
- **Inter Semibold:** For calls-to-action and highlights

### Text Sizes
- **Base text size:** `text-sm` to `text-base` with responsive adjustments
- **Headings:** `text-xl` for page titles, `text-lg` for section headers
- **Subheadings:** `text-base` to `text-lg`

### Font Weight Guidelines
- **Headings:** `font-bold` (700)
- **Subheadings:** `font-medium` (500)
- **Body:** `font-normal` (400)
- **CTAs/Highlights:** `font-semibold` (600)

### Line Heights
- **Headings:** 1.2
- **Body text:** 1.5
- **Form elements:** 1.5

### Buttons
- **Primary:** Deep Navy (`#0A2463`) with Off-White text (`#F8F9FA`)
  - This color relationship is enforced: any button with `#0A2463` background MUST use `#F8F9FA` text
- **Secondary:** Honey Gold (`#FFD166`) with Deep Navy text
- **Tertiary:** Lavender Purple (`#7B68EE`) with white text
- **Outline:** Transparent with Deep Navy border and text
- **Size variants:**
  - Default: `h-10 px-4 py-2`
  - Small: `h-8 px-3 py-1`
  - Large: `h-12 px-6 py-3`
- **Border radius:** `rounded-md` (6px)
- **Icon spacing:** `gap-2` with icons sized at 18px

### Navigation
- **Main nav:** `bg-white` with Deep Navy text and Honey Gold accents
- **Active states:** Deep Navy background with white text
- **Hover states:** 10% lighter than active state
- **Mobile nav:** Full-screen overlay with large touch targets

## Animations & Transitions

- **Button transitions:** `transition-colors`, `transition-all`
- **Duration:** `duration-200` (faster), `duration-300` (standard)
- **Hover effects:** `hover:-translate-y-1`, `hover:shadow-md`
- **Loading states:** Subtle pulse animation using opacity
- **Accordions:** `animate-accordion-down`, `animate-accordion-up`

## Shadows & Depth

- **Default card shadow:** `shadow-md`
- **Hover state shadow:** `hover:shadow-lg`
- **Popover/Dialog shadows:** `shadow-xl`
- **Focus shadows:** `ring-2 ring-offset-2` in primary color

## Responsive Design

### Mobile-first approach with Tailwind's responsive modifiers

### Breakpoints
- **sm:** 640px
- **md:** 768px
- **lg:** 1024px
- **xl:** 1280px

- **Container:** `max-width-7xl` with auto margins
- **Column layouts:** 1 column (mobile), 2 columns (tablet), 3-4 columns (desktop)
- **Font size adjustments:** `text-sm` (mobile), `text-base` (desktop)

## Iconography

- **Style:** Flat icons with 2px stroke
- **Size:** 18px default, 24px for emphasis
- **Colors:** Primarily Deep Navy, with Honey Gold for accent icons
- **Alignment:** Center-aligned with text, 2px margin
- **Hover effects:** Subtle scaling and color transitions

## Special Elements

### Honeycomb Pattern
- Used as subtle background elements
- 10-20% opacity
- Scale varies based on context
- Always use brand colors

### Badges
- **Status badges:** `rounded-full px-2 py-0.5 text-xs`
- **Match indicators:** Honey Gold background with Deep Navy text
- **Notification badges:** Small circles with accent colors

### Tooltips & Popovers
- **Background:** White
- **Border:** 1px solid rgba(10, 36, 99, 0.1)
- **Shadow:** `shadow-lg`
- **Animation:** Fade in/out with 200ms duration

## Dark Mode Support

Dark mode variables are defined with these color mappings:

- **Background:** `#121212`
- **Card background:** `#1E1E1E`
- **Primary:** `#3D56A6` (lighter version of Deep Navy)
- **Text:** `#F8F9FA` (Off-White)
- **Borders:** rgba(255, 255, 255, 0.1)

Dark mode should maintain the same visual hierarchy and component styles, with adjusted colors for better contrast and readability.

## Accessibility Guidelines

- Maintain WCAG 2.1 AA compliance throughout the interface
- Minimum contrast ratio of 4.5:1 for all text content
- Focus states must be clearly visible
- All interactive elements must be keyboard accessible
- Touch targets should be at least 44px × 44px on mobile
- All form elements must have proper labels
- Use aria attributes appropriately

## Brand Voice in UI Text

- **Clear & Direct:** Avoid jargon, use plain language
- **Encouraging:** Use active voice and positive framing
- **Solution-oriented:** Focus on outcomes and benefits
- **Professional but warm:** Approachable without being casual
