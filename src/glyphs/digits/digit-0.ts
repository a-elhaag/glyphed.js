import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline digit "0", 3 wobble variants. */
export const digit0: GlyphEntry = {
  width: 11,
  variants: [
    "M9.5 12 C 9.5 6.5 7.3 4 5 4 C 2.5 4 0.5 6.5 0.5 12 C 0.5 17.5 2.5 20.5 5 20.5 C 7.3 20.5 9.5 17.5 9.5 12",
    "M9.6 11.8 C 9.5 6.6 7.1 3.8 5.0 3.8 C 2.7 3.8 0.6 6.4 0.7 11.8 C 0.5 17.6 2.4 20.3 4.9 20.4 C 7.1 20.3 9.6 17.6 9.5 12.1",
    "M9.4 11.9 C 9.5 6.4 7.4 4.0 4.9 3.9 C 2.4 4.1 0.5 6.4 0.6 12.1 C 0.5 17.4 2.7 20.4 5.2 20.5 C 7.1 20.3 9.4 17.6 9.5 11.8",
  ],
};
