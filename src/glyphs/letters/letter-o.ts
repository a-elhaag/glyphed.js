import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "o", 3 wobble variants. */
export const letterO: GlyphEntry = {
  width: 11,
  variants: [
    "M9 14.5 C 9 10 6.5 8 5 8 C 2.5 8 1 11 1 14.5 C 1 18 2.5 21 5 21 C 7.5 21 9 18 9 14.5",
    "M9.2 14.4 C 8.9 10.1 6.4 8.2 4.8 8.0 C 2.3 8.1 0.8 11.1 1.1 14.7 C 1.2 18.0 2.5 21.0 5.1 20.8 C 7.7 21.0 9.2 18.1 9.0 14.6",
    "M8.8 14.4 C 8.9 10.1 6.6 7.9 5.0 8.1 C 2.5 7.8 1.2 10.9 0.9 14.4 C 0.9 18.1 2.7 21.2 5.1 21.0 C 7.7 20.8 9.2 18.1 9.2 14.5",
  ],
};
