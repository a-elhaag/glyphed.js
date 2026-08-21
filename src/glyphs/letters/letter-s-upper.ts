import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "S" (uppercase), 3 wobble variants. */
export const letterSUpper: GlyphEntry = {
  width: 11,
  variants: [
    "M9.5 8 C 8.5 5 3 5 2 8 C 1 11 6 12 8 13.5 C 10 15 9.5 19 5.5 20 C 2.5 20.7 0.5 19.5 0 17.5",
    "M9.4 7.9 C 8.6 5.2 3.2 4.9 2.0 7.8 C 1.0 11.1 5.9 12.1 8.2 13.6 C 10.1 14.8 9.4 18.8 5.6 20.0 C 2.4 20.7 0.6 19.4 0.0 17.6",
    "M9.7 8.0 C 8.4 4.9 2.8 4.9 1.9 8.2 C 1.1 10.9 6.2 12.2 7.9 13.4 C 9.8 14.8 9.3 19.0 5.4 19.8 C 2.3 20.8 0.3 19.5 0.0 17.7",
  ],
};
