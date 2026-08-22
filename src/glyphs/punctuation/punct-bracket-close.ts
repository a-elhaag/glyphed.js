import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: "]", 3 wobble variants. */
export const punctBracketClose: GlyphEntry = {
  width: 8,
  variants: [
    "M2 3 L5 3 L5 21 L2 21",
    "M1.9 2.9 L5.1 3.1 L4.9 20.9 L1.9 21.1",
    "M2.1 3.1 L4.9 2.9 L5.1 21.1 L2.1 20.9",
  ],
};
