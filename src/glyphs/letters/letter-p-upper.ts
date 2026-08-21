import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "P" (uppercase), 3 wobble variants. */
export const letterPUpper: GlyphEntry = {
  width: 11,
  variants: [
    "M2 20 L2 4 M2 4 C 7.5 4 9.5 6.5 9.5 9 C 9.5 11.5 7.5 13.5 2 13.5",
    "M2.2 19.9 L1.8 3.9 M1.8 3.9 C 7.7 4.0 9.3 6.6 9.6 8.8 C 9.4 11.3 7.5 13.3 2.1 13.7",
    "M1.9 20.1 L1.9 3.9 M2.1 4.1 C 7.7 4.1 9.7 6.6 9.4 8.9 C 9.5 11.6 7.4 13.4 1.8 13.6",
  ],
};
