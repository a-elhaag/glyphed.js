import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: "*", 3 wobble variants. */
export const punctAsterisk: GlyphEntry = {
  width: 10,
  variants: [
    "M5 5 L5 13 M1.5 7 L8.5 11 M8.5 7 L1.5 11",
    "M4.9 4.9 L5.1 13.1 M1.4 6.9 L8.6 11.1 M8.6 6.9 L1.4 11.1",
    "M5.1 5.1 L4.9 12.9 M1.6 7.1 L8.4 10.9 M8.4 7.1 L1.6 10.9",
  ],
};
