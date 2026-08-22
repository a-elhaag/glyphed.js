import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: "}", 3 wobble variants. */
export const punctBraceClose: GlyphEntry = {
  width: 10,
  variants: [
    "M3 3 C 6 3 5 7 5 9 C 5 11 7 11.5 8 12 C 7 12.5 5 13 5 15 C 5 17 6 21 3 21",
    "M2.9 2.9 C 6.1 3.1 4.9 6.9 5.0 9.1 C 5.1 11.1 6.9 11.4 8.1 12.1 C 6.9 12.6 5.1 12.9 4.9 15.1 C 5.1 17.1 6.1 20.9 2.9 21.1",
    "M3.1 3.1 C 5.9 2.9 5.1 7.1 5.0 8.9 C 4.9 10.9 7.1 11.6 7.9 11.9 C 7.1 12.4 4.9 13.1 5.1 14.9 C 4.9 16.9 5.9 21.1 3.1 20.9",
  ],
};
