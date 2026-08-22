import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: "{", 3 wobble variants. */
export const punctBraceOpen: GlyphEntry = {
  width: 10,
  variants: [
    "M7 3 C 4 3 5 7 5 9 C 5 11 3 11.5 2 12 C 3 12.5 5 13 5 15 C 5 17 4 21 7 21",
    "M7.1 2.9 C 3.9 3.1 5.1 6.9 5.0 9.1 C 4.9 11.1 3.1 11.4 1.9 12.1 C 3.1 12.6 4.9 12.9 5.1 15.1 C 4.9 17.1 3.9 20.9 7.1 21.1",
    "M6.9 3.1 C 4.1 2.9 4.9 7.1 5.0 8.9 C 5.1 10.9 2.9 11.6 2.1 11.9 C 2.9 12.4 5.1 13.1 4.9 14.9 C 5.1 16.9 4.1 21.1 6.9 20.9",
  ],
};
