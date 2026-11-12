---
name: Voidwallz
description: Curated 8K, 4K & OLED minimalist wallpapers and packs engineered to elevate your digital workspace.
colors:
  primary: "#c8ff00"
  neutral-bg: "#f4f4ef"
  neutral-surface: "#e7e7e2"
  neutral-ink: "#10110e"
  neutral-muted: "#5d6056"
  neutral-line: "#10110e2b"
  void-black: "#080908"
  stage-dark: "#181a15"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(64px, 7.1vw, 112px)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "-0.065em"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(32px, 3.4vw, 52px)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Archivo, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Archivo, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0em"
  label:
    fontFamily: "Space Mono, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.04em"
rounded:
  none: "0px"
  sm: "3px"
  md: "8px"
  phone: "38px"
  monitor: "10px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.none}"
    padding: "14px 20px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.neutral-ink}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.none}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.none}"
    padding: "14px 20px"
    height: "52px"
  button-outline-hover:
    backgroundColor: "{colors.neutral-ink}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.none}"
---

# Design System: Voidwallz

## Overview

**Creative North Star: "The Monolithic Gallery"**

Voidwallz is built as an architectural digital gallery where precision-cut typography, strict structural hairline grids, and deep void blacks create an austere, museum-grade framing for digital art. The atmosphere is confident, technical, and deliberate: interface controls recede into quiet boundaries, letting high-resolution 4K, 8K, and OLED wallpapers command full visual authority.

The system relies on high contrast between physical Warm Editorial Paper (`#f4f4ef`) and Deep Carbon Ink (`#10110e`), interrupted only by flashes of electric Neon Acid Lime (`#c8ff00`). Everything feels machined and intentional—there is zero fluff, no synthetic pastel gradients, no 3D skeuomorphism, and no decorative bubbles. Across four selectable visual atmospheres (Paper, OLED Pure, CRT Scan, and Noir Grain), the design maintains consistent structural proportions, razor-sharp edges, and instant feedback.

**Key Characteristics:**
- **Zero-Radius Architecture**: Structural UI elements (buttons, inputs, cards, dialogs, tags) use `0px` border-radius to preserve sharp, technical silhouettes.
- **Electric Accent Calibration**: Neon Acid Lime (`#c8ff00`) is treated as a high-voltage current—used sparingly on primary actions, active indicators, and brand stamps.
- **Hardware-Accurate Staging**: Device previews use physically proportioned monitor and smartphone silhouettes with authentic bezel geometry.
- **Dual-Voice Typography**: Hyper-condensed heavyweight sans-serif display headers paired with technical monospaced indices and metadata.

## Colors

The palette balances warm tactile paper against obsidian void blacks, punctuated by high-potency acid lime.

### Primary
- **Neon Acid Lime** (`#c8ff00`): The electric primary accent. Reserved for decisive interactive actions (primary download buttons), active segment indicators, and focused brand marks. Never used for long-form text or large background fills except in signature statement banners.

### Neutral
- **Warm Editorial Paper** (`#f4f4ef`): Default light-mode body canvas. Imparts a tactile, archival paper feel that prevents clinical digital sterility.
- **Deep Carbon Ink** (`#10110e`): The primary structural ink. Used for dark mode backdrops, hairline dividing rules, high-contrast borders, and primary typography.
- **Muted Paper Surface** (`#e7e7e2`): Tonal secondary surface used for subtle callout containers, table headers, and backdrop variations.
- **Graphite Olive Muted** (`#5d6056`): Secondary metadata, category labels, technical captions, and inactive link text.
- **Hairline Wire** (`rgba(16, 17, 14, 0.17)` / `#10110e2b`): Structural grid division lines, card separators, and navigation underlines.
- **OLED Pure Black** (`#080908`): True-black canvas for OLED Atmosphere and dark mode surfaces, maximizing contrast and energy efficiency on OLED panels.
- **Stage Dark** (`#181a15`): Darkened preview stage backdrop simulating an exhibition spotlight.

### Named Rules
**The Rarity of Lime Rule.** Neon Acid Lime (`#c8ff00`) must never exceed 10% of any viewport's surface area. Its rarity is what gives it electric punch and navigational clarity. When everything screams for attention, nothing is seen.

## Typography

**Display Font:** Archivo (Variable Width `62..125`, Weight `400..900`, fallback: `system-ui, sans-serif`)
**Body Font:** Archivo (Regular & Medium, `400..600`, fallback: `system-ui, sans-serif`)
**Label/Mono Font:** Space Mono (`400, 700`, fallback: `ui-monospace, monospace`)

**Character:** Technical, hyper-condensed display headlines create bold architectural statements, grounded by clean sans-serif body text and precise monospaced indices.

### Hierarchy
- **Display** (`Weight 900`, `clamp(64px, 7.1vw, 112px)`, `Line Height 0.88`, `Letter Spacing -0.065em`, `Font Stretch Condensed / wdth 88`): Hero title lines and major section banners.
- **Headline** (`Weight 800`, `clamp(32px, 3.4vw, 52px)`, `Line Height 0.98`, `Letter Spacing -0.03em`): Section headings, modal titles, and collection introductions.
- **Title** (`Weight 600`, `18px`, `Line Height 1.35`, `Letter Spacing -0.035em`): Wallpaper names, pack titles, and card headers.
- **Body** (`Weight 400-500`, `15px-16px`, `Line Height 1.7-1.85`, `Max length 65-75ch`): Legal copy, descriptive summaries, and informational paragraphs.
- **Label / Micro** (`Space Mono`, `Weight 400`, `11px-12px`, `Line Height 1.5`, `Letter Spacing 0.04em`, `Uppercase`): Metadata, serial numbers, dimensions, filter counts, and category stamps.

### Named Rules
**The Monospaced Index Rule.** Any text conveying system metadata, dimensions, serial IDs, or status counts must be rendered in `Space Mono` in uppercase.

## Layout

- **Page Shell**: Centered container with a maximum width of `1600px` and responsive horizontal clamp padding (`clamp(24px, 4vw, 80px)`).
- **Grid Systems**:
  - **Desktop Wallpapers**: 3-column responsive CSS grid (`gap: 24px`), collapsing to 2 columns on tablets and 1 column on mobile.
  - **Phone Wallpapers**: 4-column responsive CSS grid on wide viewports, collapsing to 3 and 2 columns.
  - **Hero Grid**: Asymmetric split (7-column text and CTA zone, 5-column specimen preview stage).
- **Rhythm**: Standard vertical section spacing of `96px` (collapsing to `64px` on mobile screens).

## Elevation & Depth

Voidwallz uses a strictly architectural, flat-by-default spatial model. Surfaces define their boundaries through 1px structural hairline ink lines (`border: 1px solid var(--ink)`) rather than floating drop shadows. Shadows, when present, act as ambient ground contact rather than volumetric lighting.

### Shadow Vocabulary
- **Resting Specimen Ambient** (`box-shadow: 0 18px 48px rgba(16, 17, 14, 0.07), 0 2px 6px rgba(16, 17, 14, 0.03)`): Grounds the main hero showcase specimen and standalone modal containers against the paper surface.
- **Card Interactive Lift** (`transform: translateY(-4px); box-shadow: 0 16px 32px rgba(16, 17, 14, 0.10)`): Subtle kinetic response upon hovering or focusing a wallpaper card.
- **Popover Drop** (`box-shadow: 0 12px 36px rgba(16, 17, 14, 0.10)`): Used for context menus, dropdowns, and download feedback toasts.

### Named Rules
**The Structural Line Rule.** Depth is created through crisp 1px ink dividing lines and tonal planar contrast, never through fuzzy blurred halos or heavy 3D bevels.

## Shapes

- **Sharp UI Furniture**: Buttons, inputs, chips, segmented control tabs, modals, and card perimeters use `border-radius: 0`.
- **Authentic Device Silhouettes**: Where real hardware is simulated, authentic curvature is embraced:
  - Phone frame: `border-radius: 38px` outer bezel with `25px-30px` inner clipped screen radius.
  - Monitor frame: `border-radius: 10px` outer chassis with subtle chin branding.
- **Corner Accents & Framing**: Registration marks (`vw-register-tl`, `vw-register-br`) and diagonal preview badges (`vw-preview-corner`) punctuate exhibition cards.

## Components

### Buttons
- **Shape**: Razor-sharp rectangular (`border-radius: 0`), `1px solid var(--ink)`.
- **Primary Button (`.vw-button`)**: Min-height `52px`, padding `14px 20px`, background `#c8ff00`, text `#10110e`, uppercase typography, icon aligned right. On hover: background shifts to `#10110e` and text to `#f4f4ef`.
- **Outline Button (`.outline-button`)**: Min-height `52px`, background `transparent`, text `#10110e`, border `1px solid var(--ink)`. On hover: background fills with `#10110e`, text flips to `#f4f4ef`.
- **Icon Button (`.icon-button`)**: Square hit-target (`44px x 44px`), `border-radius: 0`. On hover/focus: tinted with `color-mix(in srgb, var(--ink) 8%, transparent)`.

### Segmented Controls
- **Style**: Enclosed within a `1px solid var(--line)` container with `0px` radius.
- **State**: Inactive tabs render in muted ink; active tab fills with solid `#10110e` with `#f4f4ef` text.

### Wallpaper Cards (`.art-card`)
- **Structure**: Flat container with `1px solid var(--ink)`, padded with `12px 12px 0`.
- **Image Canvas**: Exact `4:3` (desktop) or `9:16` (phone) aspect ratio with deep `#191c16` backing.
- **Controls**: Persistent, clearly visible action bar (device tag, favorite toggle, and instant direct download button) with zero hidden-hover traps.

### Inputs & Search Bars
- **Style**: Clean underline or bordered box with `0px` radius, uppercase monospaced label above.
- **Focus**: Distinct `2px solid var(--ink)` outline with `4px` outline offset.

### Navigation Header
- **Style**: Fixed `76px` height (collapsing to `68px` on mobile), solid paper background, 1px bottom border.
- **Links**: Centered monospaced and sans-serif uppercase navigation with active underline marks.
- **Controls**: Persistent atmosphere selector (Paper, OLED, CRT, Noir) and audio/motion toggles.

## Do's and Don'ts

### Do:
- **Do** maintain strict `0px` border-radius on all interactive buttons, inputs, tabs, and content cards.
- **Do** restrict Neon Acid Lime (`#c8ff00`) to high-priority interactive calls to action and active status markers.
- **Do** preserve dual-font discipline: Archivo for bold display and body reading, Space Mono for all technical metadata and telemetry.
- **Do** ensure all master downloads are delivered as authentic, byte-verified lossless PNG files.
- **Do** honor `prefers-reduced-motion` and provide immediate manual toggle switches for motion and audio effects.

### Don't:
- **Don't** add heavy drop shadows, rounded bubble corners, or multi-colored gradient fills to UI cards.
- **Don't** introduce account gates, email collection popups, or download countdown timers.
- **Don't** use generic icon libraries when a precise geometric glyph or monospace text label communicates more clearly.
- **Don't** overlay decorative simulated phone UI (clocks, battery bars, islands) directly over wallpaper artwork previews.
- **Don't** split the color palette into arbitrary primary/secondary brand tints; maintain the purity of the paper, ink, and lime trinity.

