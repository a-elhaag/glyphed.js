import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "U" (uppercase), 3 wobble variants. */
export const letterUUpper: GlyphEntry = {
  width: 13,
  variants: [
    "M1.5 4 L1.5 15 C 1.5 19 4.5 21 7.5 20 C 9.8 19.2 10.5 17 10.5 15 L10.5 4",
    "M1.6 4.1 L1.7 14.9 C 1.3 19.1 4.7 20.9 7.6 20.0 C 9.7 19.3 10.5 16.9 10.7 14.8 L10.5 4.1",
    "M1.7 4.0 L1.5 15.2 C 1.3 18.9 4.5 20.9 7.5 19.9 C 10.0 19.1 10.7 17.0 10.4 15.1 L10.3 4.0",
  ],
};
