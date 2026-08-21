import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: "?", 3 wobble variants. */
export const punctQuestion: GlyphEntry = {
  width: 9,
  variants: [
    "M2 7.5 C 2 4.5 4.5 3.5 6.5 4.5 C 8.5 5.5 8.3 8 6.5 9.5 C 5.3 10.5 5 11.5 5 13.5 M5 17.5 L5.2 17.7",
    "M2.0 7.4 C 2.0 4.6 4.6 3.5 6.4 4.4 C 8.5 5.5 8.3 8.1 6.4 9.6 C 5.4 10.5 5.1 11.4 4.9 13.6 M4.9 17.5 L5.3 17.8",
    "M1.9 7.5 C 2.0 4.5 4.4 3.5 6.4 4.6 C 8.5 5.4 8.3 7.9 6.5 9.5 C 5.2 10.5 5.1 11.5 4.9 13.4 M5.0 17.4 L5.1 17.7",
  ],
};
