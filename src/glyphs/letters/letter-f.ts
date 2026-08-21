import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "f", 3 wobble variants. */
export const letterF: GlyphEntry = {
  width: 9,
  variants: [
    "M7 3 C 7 3 3 3 3 7 L3 20 M0.5 10 L6 10",
    "M7.2 3.0 C 7.0 3.2 3.0 3.0 3.0 7.0 L2.9 20.2 M0.3 10.0 L6.1 9.9",
    "M7.1 3.2 C 7.0 3.2 3.1 2.9 3.2 6.9 L3.0 19.8 M0.6 9.8 L6.1 10.2",
  ],
};
