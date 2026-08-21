import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "r", 3 wobble variants. */
export const letterR: GlyphEntry = {
  width: 10,
  variants: [
    "M2 20 L2 9 M2 12 C 3.5 9 6.5 8.5 8 10",
    "M2.1 19.9 L1.8 9.0 M1.9 11.9 C 3.4 8.9 6.3 8.3 7.9 9.8",
    "M1.8 20.0 L2.0 9.0 M1.9 11.9 C 3.5 8.8 6.4 8.5 8.2 10.0",
  ],
};
