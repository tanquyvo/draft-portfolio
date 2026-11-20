# Tan Quy Illustrated Portfolio — v1.2.10

## What's updated
- Enlarged all app logos in Tools while keeping one row per tool category.
- Right-aligned the MAKE IT HAPPEN sticker with comfortable frame spacing.
- Replaced diagonal-up arrows (↗) with horizontal arrows (→) across the site.
- Replaced BigCamp campaign carousel placeholders with the supplied 16:9 outcome slides:
  - MILO Sandwich and OREO adaptation work (9 slides total).
  - Swiss Camp — Nestlé NAN (6 slides).
- Justified all bulleted list copy.
- Added a "See my works on sheets" button to CMO Think And Action 2025, KHAM PHA SU NANG DONG 2025 and CMO Think And Action 2026.

## Google Sheets links
Buttons open the user-provided Google Sheets links in a new browser tab.

## Run locally
```bash
npm install
npm run dev
```


## Version 1.2.7 — Google Sheets CTA refinement

- Moved the three event worksheet links out of the intro copy and into a dedicated resource row immediately after each event impact-stat block.
- Restyled the links as compact, stable buttons with no hover lift, tilt, scale, margin shift or animated shadow.
- On mobile, the resource row stacks cleanly with the action aligned to the left.


## Version 1.2.8 — scroll-driven motion & centered worksheet CTA

- Added scroll-linked editorial heading wipes across the main chapters.
- Added scroll-driven parallax for the Experience chapter's graphic orbits and moving blue-to-yellow background.
- Added scroll-linked story-card masks and project-title reveals, while respecting reduced-motion preferences.
- Replaced the worksheet helper copy with a single centered “See my works on sheets” button in each event frame.
- Kept the worksheet button hover stable: no lift, tilt, scale, shadow jump or layout shift.
- Updated the Experience chapter background to a fresher sky-blue / soft-yellow gradient.

Run locally with `npm install` and `npm run dev`.


## Version 1.2.10 — Cinematic Scroll Story

This version keeps the existing visual layout and applies a stronger scroll-motion language inspired by the supplied Leo Burnett reference clip: pinned cover/toolkit/directory/closing chapters on desktop, scroll-linked oversized typography, parallax layers, perspective card transitions, and a CSS 3D cube with six planning-related faces. Tablet and mobile use lighter non-pinned scroll transitions. Reduced-motion preferences are respected.

No new runtime dependencies were added. Existing GSAP, ScrollTrigger and Lenis packages are used.


## Motion rollback — v1.2.10

This version restores the original GSAP/ScrollTrigger animation behavior from v1.2.7. It removes the additional pinned scenes, cinematic scroll choreography, 3D directory cube and scroll-linked heading masks introduced in v1.2.8–v1.2.9. The updated page content, campaign slides, Google Sheets links, current Experience background color and centered worksheet buttons are retained.
