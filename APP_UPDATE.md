AdCraft AI — Full Visual & UX Upgrade Requirements

This document defines the full set of upgrades needed to improve the look, feel, usability, and long-term scalability of the AdCraft AI application. These changes apply to UI/UX, styling, layout structure, component refactoring, theming, animation, and mobile-readiness. The IDE agent should use this as the authoritative update plan.

---

1. Global Theme & Visual Language Upgrade

1.1 Updated Color System

Replace the existing HSL theme with a modern palette using layered dark surfaces and bright accent colors.

Base Theme

- Background: "#0C0F1A" (Deep navy-black)
- Surface 1: "#111626"
- Surface 2: "#131A2F"
- Primary: "#4F7BFF" (Vibrant blue)
- Secondary: "#9A6BFF" (Violet accent)
- Success: "#4ADE80"
- Warning: "#FACC15"
- Error: "#F87171"
- Text Primary: "#FFFFFF"
- Text Secondary: "#A8B2D1"

Action: Update all Tailwind color variables, CSS variables, and ShadCN configuration to match this palette.

1.2 Typography Upgrade

Keep current fonts but refine spacing and consistency.

- Headings: "Space Grotesk"
- Body: "Inter"
- Increase letter-spacing on H1–H3
- Increase line-height on all paragraph text (1.6–1.75)
- Add consistent vertical rhythm (32px baseline grid)

---

2. Layout & Spacing Improvements

2.1 Section Rhythm

Increase padding between all major sections to create a premium, breathable flow.

- Hero section: 96px top / 72px bottom
- Feature sections: 64px top & bottom
- Cards: 24–32px padding inside

2.2 Container Width

Use "max-w-screen-xl mx-auto px-4 md:px-8" on all high-level containers.

2.3 Button Hierarchy

Redesign buttons for clear differentiation.

Primary Button

- Solid blue ("primary")
- Slight gradient allowed
- Font weight: 600
- Padding: "py-3 px-6"
- Subtle shadow

Secondary Button

- Surface background
- Border: 1px with low-opacity primary
- Text: primary

---

3. Animation & Motion System

Add animation globally using Framer Motion and Tailwind Motion utilities.

3.1 Install Libraries

npm install framer-motion
npm install @tailwindcss/typography

3.2 Global Motion Guidelines

- Fade-in + slide-up for all sections on page load
- Smooth hover transitions on cards (scale 1.02, shadow increase)
- Button hover animation (slight scale, glow)
- Image reveal animation in the hero and editor views

3.3 Example for Sections

import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  {/* content */}
</motion.div>

---

4. Component & UI Enhancements

4.1 Hero Section

- Add a soft radial gradient behind the headline
- Increase headline size by 1–2 levels
- Add a subtle animated background pattern (CSS grain or SVG noise)
- Add a drop shadow under the car image + rounded corners
- Ensure the car image has a contained aspect ratio on mobile

4.2 Feature Cards

Upgrade all feature cards to a modern glowing “glass panel” style:

Card Specs

- Background: "rgba(255, 255, 255, 0.03)"
- Backdrop blur: "10px"
- Border: 1px solid "rgba(255,255,255,0.08)"
- Hover: scale up + intensify border
- Rounded corners: "xl"

4.3 Saved Ads Page

- Convert card grid to a masonry-like adaptive layout
- Add hover elevation for cards
- Add click ripple animations
- Add a “quick actions” floating menu for each card (edit, copy, delete)

---

5. Image Handling & Editor Improvements

5.1 Image Carousel

Implement a more modern carousel using libraries like Embla Carousel.

npm install embla-carousel-react

Enhancements

- Smooth snap-scrolling
- Swipe support (essential for mobile)
- Zoom-on-tap (mobile)
- Animated transitions between images

5.2 Editor Area

- Add side-by-side split animation when switching tabs
- Use multi-line character count with a soft fade
- Add AI-processing loader animation (circular waveform)

---

6. Navigation Improvements

- Replace the hamburger icon with a ShadCN navigation drawer
- Add subtle slide-in animation
- Add an avatar or brand mark in the upper-left corner
- Sticky nav with slight transparency and blur ("backdrop-blur-xl")

---

7. Dark Mode Enhancements

Even though the app is currently dark-mode only, prepare for a variable-driven dual-mode theme.

Include CSS variables at the root:

:root {
  --bg: #0C0F1A;
  --surface: #111626;
  --text: #ffffff;
}
.light {
  --bg: #f8f9fe;
  --surface: #ffffff;
  --text: #111827;
}

---

8. Mobile App Future-Proofing

8.1 Navigation

Use bottom navigation for mobile screens:

- Home
- Create
- Saved
- Profile

8.2 Mobile Gesture Support

- Swipe-to-delete
- Press-and-hold context menu
- Image pinch-to-zoom
- Card drag animations

8.3 Component Resizing

Ensure all components collapse gracefully to single-column flow on small devices.

---

9. Codebase Refactoring

9.1 Componentization

Refactor large layout blocks into reusable components:

- "<Hero />"
- "<FeatureSection />"
- "<AppCard />"
- "<ImageCarousel />"
- "<EditorTabs />"
- "<AIActionButtons />"

9.2 Layout File Cleanup

- Move all padding/margin logic into layout wrappers
- Remove repeated Tailwind class clusters; create utility classes
- Use Tailwind "@apply" for repeated patterns

9.3 Accessibility Upgrades

- Add ARIA labels to all buttons
- Ensure color contrast ratio ≥ 4.5:1
- Add focus states with visible outlines

---

10. Micro-Interactions & Polish

Implement the following enhancements:

- Button glow on hover
- Success animation when saving
- Pulse animation for active AI generation
- Smooth scroll-to-top buttons
- Subtle 120ms transitions on all UI elements
- Progressive image loading (blur-up technique)

---

11. Optional Premium Enhancements (Future Tier)

- Animated onboarding walkthrough
- Drag-and-drop image sorting
- Purpose-built mobile app layout support using React Native Web
- Dedicated AI “Tone Styles” for ad rewriting
- Premium theme variations (gold, neon, cyber-blue)

---

Summary

This document provides a full visual, structural, and interactive redesign plan for AdCraft AI. The IDE agent should implement all relevant theme updates, animations, component refactors, spacing improvements, modern UI library integrations, and mobile-readiness enhancements.