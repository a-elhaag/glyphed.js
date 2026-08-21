import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "D" (uppercase), 3 wobble variants. */
export const letterDUpper: GlyphEntry = {
  width: 13,
  variants: [
    "M2 4 L2 20 M2 4 C 8 4 11 8 11 12 C 11 16 8 20 2 20",
    "M2.1 3.9 L2.0 19.9 M2.1 4.1 C 7.9 4.2 11.0 8.0 11.0 12.2 C 10.9 15.9 8.1 20.2 2.0 19.9",
    "M1.9 4.1 L1.9 19.9 M1.9 4.1 C 7.9 4.1 11.0 8.1 11.2 11.8 C 10.9 16.0 8.2 19.9 2.0 20.1",
  ],
};
