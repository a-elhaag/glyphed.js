import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "u", 3 wobble variants. */
export const letterU: GlyphEntry = {
  width: 8,
  variants: [
    "M1 9 L1 16 C 1 19.5 4.5 20.5 5.5 18 L5.5 9",
    "M1.2 9.1 L1.1 15.8 C 1.0 19.6 4.4 20.3 5.6 18.1 L5.6 9.0",
    "M0.9 9.1 L1.0 15.8 C 0.9 19.5 4.3 20.4 5.6 18.0 L5.7 8.9",
  ],
};
