import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "M" (uppercase), 3 wobble variants. */
export const letterMUpper: GlyphEntry = {
  width: 13,
  variants: [
    "M1 20 L1 4 L6 14 L11 4 L11 20",
    "M0.8 20.1 L0.9 3.8 L6.1 13.8 L10.9 3.9 L11.0 19.9",
    "M0.9 20.2 L1.1 4.2 L6.1 14.1 L11.2 4.1 L11.1 20.0",
  ],
};
