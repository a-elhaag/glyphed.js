import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "p", 3 wobble variants. */
export const letterP: GlyphEntry = {
  width: 12,
  variants: [
    "M2 8 L2 23 M2 8 C 6 6.5 10 9.5 10 13 C 10 16.5 6 18.5 2 17",
    "M1.8 8.2 L2.1 23.1 M2.1 8.2 C 6.0 6.5 10.2 9.3 9.9 13.1 C 9.8 16.6 6.0 18.7 1.9 16.9",
    "M2.1 8.2 L1.8 23.2 M2.0 7.9 C 6.1 6.5 10.0 9.5 10.1 13.1 C 10.0 16.6 6.1 18.3 1.8 17.0",
  ],
};
