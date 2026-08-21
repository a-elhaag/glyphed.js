import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "B" (uppercase), 3 wobble variants. */
export const letterBUpper: GlyphEntry = {
  width: 12,
  variants: [
    "M2 4 L2 20 M2 4 C 7 4 8.5 6.3 8.5 8.3 C 8.5 10.3 7 12 2 12 M2 12 C 8.3 12 10 14.8 10 16.8 C 10 18.8 8.3 20 2 20",
    "M2.1 3.9 L1.9 19.9 M1.8 3.9 C 7.1 4.1 8.3 6.1 8.5 8.4 C 8.3 10.1 7.0 12.0 2.0 12.1 M2.0 12.1 C 8.1 12.2 10.0 14.8 10.1 16.6 C 10.0 18.7 8.1 19.9 2.0 20.1",
    "M1.9 4.2 L1.8 20.0 M2.1 4.1 C 7.2 4.0 8.6 6.3 8.6 8.4 C 8.5 10.3 7.2 12.0 2.1 12.0 M1.8 12.2 C 8.1 12.0 10.2 15.0 10.2 16.9 C 10.2 18.8 8.5 20.0 2.1 19.8",
  ],
};
