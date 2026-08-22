import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: "+", 3 wobble variants. */
export const punctPlus: GlyphEntry = {
  width: 10,
  variants: [
    "M5 7 L5 15 M1 11 L9 11",
    "M4.9 6.9 L5.1 15.1 M0.9 11.1 L9.1 10.9",
    "M5.1 7.1 L4.9 14.9 M1.1 10.9 L8.9 11.1",
  ],
};
