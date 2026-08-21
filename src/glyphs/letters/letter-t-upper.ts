import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "T" (uppercase), 3 wobble variants. */
export const letterTUpper: GlyphEntry = {
  width: 12,
  variants: [
    "M0.5 4 L10.5 4 M5.5 4 L5.5 20",
    "M0.5 3.8 L10.4 3.8 M5.6 3.8 L5.7 20.0",
    "M0.6 3.8 L10.4 3.9 M5.5 4.1 L5.3 20.0",
  ],
};
