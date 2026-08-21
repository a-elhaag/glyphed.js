import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline digit "2", 3 wobble variants. */
export const digit2: GlyphEntry = {
  width: 11,
  variants: [
    "M1.5 8 C 1.5 5 4 4 6 4 C 8.5 4 10 6 10 8.5 C 10 12.5 5.5 15 1.5 19.5 L10 19.5",
    "M1.7 7.9 C 1.6 5.1 3.8 3.9 5.9 4.2 C 8.6 4.1 10.1 6.1 9.9 8.6 C 10.1 12.6 5.4 15.0 1.6 19.5 L10.1 19.4",
    "M1.3 7.9 C 1.7 4.9 3.9 3.9 6.2 3.9 C 8.5 4.1 9.9 6.0 9.9 8.6 C 9.8 12.5 5.6 14.9 1.3 19.4 L10.0 19.7",
  ],
};
