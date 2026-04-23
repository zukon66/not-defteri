---
name: Academic Tactility
colors:
  surface: '#fbf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#414847'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#727877'
  outline-variant: '#c1c8c6'
  surface-tint: '#496360'
  primary: '#47615d'
  on-primary: '#ffffff'
  primary-container: '#5f7a76'
  on-primary-container: '#f5fffc'
  inverse-primary: '#b0ccc8'
  secondary: '#4f616d'
  on-secondary: '#ffffff'
  secondary-container: '#d0e2f1'
  on-secondary-container: '#536571'
  tertiary: '#7b542b'
  on-tertiary: '#ffffff'
  tertiary-container: '#966c41'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cbe8e3'
  primary-fixed-dim: '#b0ccc8'
  on-primary-fixed: '#04201d'
  on-primary-fixed-variant: '#314c48'
  secondary-fixed: '#d2e5f3'
  secondary-fixed-dim: '#b6c9d7'
  on-secondary-fixed: '#0b1d28'
  on-secondary-fixed-variant: '#384955'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#f0bd8b'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#623f18'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  h1:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
  h3:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1140px
  gutter: 24px
---

## Brand & Style

The design system is rooted in the "Modern Analog" aesthetic—a fusion of traditional academic stationery and contemporary minimalist software. It is designed to evoke the quiet focus of a library and the tactile satisfaction of opening a fresh notebook. The style centers on **Tactile Minimalism**, utilizing paper-like surfaces, physical layering metaphors, and intentional whitespace to reduce cognitive load for students and researchers.

Visuals prioritize "quiet" interfaces. Rather than high-energy gradients or aggressive prompts, the design system uses thin ruled lines and soft shadows to guide the eye. This creates a focused, scholarly environment that values deep work over quick dopamine hits.

## Colors

The palette is anchored by a warm, off-white base (#F9F9F7) that mimics premium paper stock, reducing the harsh blue-light glare of pure white backgrounds. 

- **Primary (Muted Sage):** Used for primary actions and "active" study states. It is calming and organic.
- **Secondary (Dusty Blue):** Used for secondary categories, tags, or focus-timer elements.
- **Text (Deep Charcoal):** A high-contrast but slightly softened black for long-form reading comfort.
- **Rules & Grids:** A consistent light gray (#E0E0E0) used to create structural dividers that feel like printed lines on a page.

## Typography

This design system utilizes a high-contrast typographic pairing to reinforce the academic narrative. 

- **Newsreader** (Serif) is used for all headlines and major titles. It provides a literary, authoritative feel that signals a space for thought and reflection.
- **Inter** (Sans-serif) handles all functional UI elements, labels, and data entry. It ensures maximum legibility for study logs, timers, and navigation.

Body text should maintain generous line-heights (1.6) to ensure the interface remains airy and readable, echoing the margins found in well-designed textbooks.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** system centered on the screen, mimicking the bounds of a physical notebook or open binder. Content is organized within a 12-column grid with generous margins to prevent the UI from feeling cramped.

A vertical rhythm of 24px (the `md` spacing unit) should be maintained to align with the visual "ruled lines" used in the background of cards. Elements should feel intentionally placed on these lines, creating a sense of structured order.

## Elevation & Depth

Depth in this design system is achieved through **Tonal Layering** and physical metaphors rather than intense drop shadows. 

1.  **Level 0 (The Desk):** The main background of the application (#F4F4F1, slightly darker than paper).
2.  **Level 1 (The Sheet):** Rounded cards using the off-white paper tone (#F9F9F7). These use a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.03)) to appear as if resting on a surface.
3.  **Level 2 (The Sticky Note/Overlay):** Modals and popovers use a slightly more pronounced shadow and a thin 1px border (#E0E0E0) to indicate they are stacked on top of the "sheets."

Subtle grain textures should be applied to the background of Level 1 surfaces to enhance the tactile paper feel.

## Shapes

The shape language is "Softly Geometric." While the grid is rigid, the corners are rounded to feel friendly and approachable. 

- **Cards:** Use `rounded-xl` (1.5rem) to mimic the look of premium notebook corners.
- **Input Fields & Buttons:** Use `rounded-lg` (1rem) for a comfortable, modern feel.
- **Small Elements (Chips/Checkboxes):** Use `rounded` (0.5rem) to maintain consistency without becoming too circular.

## Components

- **Cards:** The core container. Must feature a 1px border at the bottom or a full ruled-line background to guide the eye.
- **Buttons:** Primary buttons use the Sage green with white text; secondary buttons use a ghost style with a thin #E0E0E0 border. No heavy gradients.
- **Inputs:** Simple underline inputs are preferred over boxed inputs to maintain the "ruled paper" look. When focused, the underline thickens and changes to the primary accent color.
- **Study Timers:** Presented in a clean, large serif font (Newsreader) centered within a "sheet" card.
- **Checkboxes:** Styled as small hand-drawn squares. When checked, use a subtle "strike-through" effect on the text and a muted secondary color for the icon.
- **Progress Bars:** Thin, 4px tall bars using the Muted Sage. The track should be the same color as the ruled lines (#E0E0E0).
- **Notebook Tabs:** Vertical navigation elements on the left or right that mimic physical binder tabs for switching between subjects.