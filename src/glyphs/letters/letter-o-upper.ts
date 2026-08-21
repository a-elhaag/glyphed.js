import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "O" (uppercase), 3 wobble variants. */
export const letterOUpper: GlyphEntry = {
  width: 13,
  variants: [
    "M11 12 C 11 6.5 8.5 4 6 4 C 3 4 0.5 6.5 0.5 12 C 0.5 17.5 3 20.5 6 20.5 C 8.5 20.5 11 17.5 11 12",
    "M10.9 11.9 C 10.9 6.4 8.4 4.0 6.1 3.9 C 2.9 4.0 0.6 6.7 0.5 12.0 C 0.3 17.7 3.1 20.4 5.8 20.6 C 8.5 20.4 11.1 17.3 11.1 12.1",
    "M10.9 12.1 C 11.2 6.5 8.3 4.1 6.1 3.8 C 3.2 3.8 0.5 6.4 0.3 12.0 C 0.6 17.3 3.1 20.6 5.8 20.5 C 8.7 20.4 10.9 17.5 11.1 12.1",
  ],
};
