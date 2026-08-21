import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline digit "1", 3 wobble variants. */
export const digit1: GlyphEntry = {
  width: 10,
  variants: [
    "M2 7 L5.5 4 L5.5 20 M2.5 20 L8.5 20",
    "M1.8 6.9 L5.3 4.0 L5.5 19.9 M2.5 20.1 L8.6 20.0",
    "M2.1 6.9 L5.6 4.1 L5.3 20.0 M2.6 19.9 L8.3 19.9",
  ],
};
