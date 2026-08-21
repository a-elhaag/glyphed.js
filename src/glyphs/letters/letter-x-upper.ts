import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "X" (uppercase), 3 wobble variants. */
export const letterXUpper: GlyphEntry = {
  width: 13,
  variants: [
    "M1 4 L11 20 M11 4 L1 20",
    "M0.9 3.9 L11.1 19.8 M11.2 4.0 L1.2 20.2",
    "M0.9 3.8 L11.2 20.1 M11.1 4.1 L1.0 19.9",
  ],
};
