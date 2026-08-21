import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "G" (uppercase), 3 wobble variants. */
export const letterGUpper: GlyphEntry = {
  width: 12,
  variants: [
    "M10.5 8 C 8.5 5 3.5 5 1.5 8.5 C 0 11.5 0 15.5 1.5 18.5 C 3.5 21.2 8.5 21 10.5 18 L10.5 11 L6.5 11",
    "M10.5 8.0 C 8.7 4.8 3.3 4.9 1.3 8.5 C -0.1 11.5 -0.0 15.5 1.5 18.5 C 3.4 21.1 8.5 20.8 10.4 18.1 L10.4 10.9 L6.6 11.2",
    "M10.4 8.1 C 8.6 4.9 3.5 5.0 1.4 8.6 C 0.2 11.7 0.1 15.7 1.6 18.7 C 3.4 21.0 8.4 21.1 10.6 17.9 L10.5 10.8 L6.7 10.8",
  ],
};
