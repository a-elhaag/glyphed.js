import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "R" (uppercase), 3 wobble variants. */
export const letterRUpper: GlyphEntry = {
  width: 11,
  variants: [
    "M2 20 L2 4 M2 4 C 7.5 4 9.5 6.3 9.5 8.6 C 9.5 11 7.5 12.8 2 12.8 M5 12.8 L10 20",
    "M2.0 19.9 L2.0 4.1 M2.0 4.2 C 7.5 3.9 9.3 6.2 9.7 8.6 C 9.3 10.8 7.4 12.8 2.1 13.0 M5.2 12.8 L10.1 20.1",
    "M1.9 19.9 L2.0 3.9 M1.9 3.9 C 7.4 3.9 9.6 6.2 9.4 8.8 C 9.7 10.8 7.4 12.9 1.9 13.0 M4.9 12.9 L10.1 20.0",
  ],
};
