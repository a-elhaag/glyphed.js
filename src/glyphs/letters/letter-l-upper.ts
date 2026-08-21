import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "L" (uppercase), 3 wobble variants. */
export const letterLUpper: GlyphEntry = {
  width: 10,
  variants: [
    "M2 4 L2 20 L9 20",
    "M1.9 4.0 L2.2 19.8 L8.9 19.9",
    "M1.9 4.2 L2.0 19.9 L8.9 20.1",
  ],
};
