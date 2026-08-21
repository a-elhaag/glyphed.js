import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "y", 3 wobble variants. */
export const letterY: GlyphEntry = {
  width: 11,
  variants: [
    "M1 9 L5 15 L9 9 M5 15 L4.2 21.5 C 4 22.8 2.6 23.2 1.5 22.6",
    "M0.9 8.8 L4.9 15.0 L9.0 9.1 M5.1 14.9 L4.0 21.4 C 3.8 22.8 2.5 23.0 1.7 22.6",
    "M1.0 9.1 L5.1 14.9 L9.1 9.2 M5.2 15.1 L4.4 21.7 C 3.9 22.7 2.7 23.2 1.3 22.7",
  ],
};
