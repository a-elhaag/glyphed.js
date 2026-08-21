# Design System

## Direction

An ink workshop: bright paper, registration marks, lively ink colors, and a precise working-table grid. The rendered SVG lettering is the primary visual asset.

## Color

- Paper: `oklch(0.97 0.018 88)`
- Ink: `oklch(0.19 0.025 255)`
- Vermilion: `oklch(0.61 0.2 30)`
- Cobalt: `oklch(0.48 0.18 255)`
- Mint: `oklch(0.84 0.09 165)`
- Rule: `oklch(0.82 0.025 88)`

## Typography

Use Spline Sans for interface and editorial text. Use Martian Mono sparingly for code, package commands, and compact technical labels. Handwritten SVG output carries the display voice.

## Layout

Use a visible twelve-column workshop grid on wide screens and a single-column flow on small screens. Prefer ruled sections and open composition over floating cards. Keep body text below 70 characters per line.

## Components

- Buttons are compact, square-cornered commands with clear hover and focus states.
- Inputs use strong labels and visible borders.
- Code samples resemble pinned workshop notes without decorative browser chrome.
- Navigation stays quiet and gives equal access to the showcase, docs, npm, and GitHub.

## Motion

The package's stroke animation is the signature motion. Other movement is limited to a short page-load reveal and direct control feedback. Reduced-motion mode renders lettering immediately and removes transitions.
