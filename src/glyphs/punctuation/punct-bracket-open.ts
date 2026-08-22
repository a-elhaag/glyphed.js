import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: "[", 3 wobble variants. */
export const punctBracketOpen: GlyphEntry = {
  width: 8,
  variants: [
    "M6 3 L3 3 L3 21 L6 21",
    "M6.1 2.9 L2.9 3.1 L3.1 20.9 L6.1 21.1",
    "M5.9 3.1 L3.1 2.9 L2.9 21.1 L5.9 20.9",
  ],
};
