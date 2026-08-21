import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "C" (uppercase), 3 wobble variants. */
export const letterCUpper: GlyphEntry = {
  width: 12,
  variants: [
    "M10.5 8 C 8.5 5 3.5 5 1.5 8.5 C 0 11.5 0 15.5 1.5 18.5 C 3.5 21.2 8.5 21 10.5 18",
    "M10.3 8.1 C 8.3 4.8 3.7 4.9 1.4 8.6 C -0.1 11.7 0.0 15.4 1.6 18.4 C 3.3 21.1 8.5 21.2 10.4 18.0",
    "M10.5 8.0 C 8.7 4.9 3.4 4.9 1.7 8.3 C 0.1 11.4 -0.2 15.7 1.5 18.5 C 3.4 21.2 8.6 21.2 10.7 18.0",
  ],
};
