import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline digit "5", 3 wobble variants. */
export const digit5: GlyphEntry = {
  width: 11,
  variants: [
    "M9 4 L2 4 L1.5 10.5 C 3 9 8.5 9.3 9.3 13.3 C 10 17 6.5 20.5 2 18.5",
    "M9.1 3.9 L1.9 4.0 L1.5 10.5 C 3.0 8.8 8.5 9.2 9.3 13.2 C 9.8 16.9 6.3 20.5 1.8 18.5",
    "M9.0 4.2 L2.2 4.0 L1.3 10.3 C 3.0 9.0 8.6 9.2 9.5 13.3 C 10.0 17.0 6.4 20.7 1.9 18.4",
  ],
};
