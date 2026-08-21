import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "Q" (uppercase), 3 wobble variants. */
export const letterQUpper: GlyphEntry = {
  width: 13,
  variants: [
    "M11 12 C 11 6.5 8.5 4 6 4 C 3 4 0.5 6.5 0.5 12 C 0.5 17.5 3 20.5 6 20.5 C 8.5 20.5 11 17.5 11 12 M7.5 16.5 L11.5 21",
    "M11.2 12.0 C 11.1 6.6 8.3 4.2 6.2 4.2 C 2.9 3.9 0.4 6.4 0.6 12.1 C 0.3 17.5 3.2 20.3 6.1 20.6 C 8.4 20.4 11.2 17.3 10.9 12.0 M7.7 16.5 L11.4 21.1",
    "M10.8 11.9 C 11.2 6.6 8.6 3.9 6.1 4.2 C 2.9 4.1 0.7 6.6 0.5 11.8 C 0.6 17.4 2.9 20.4 6.1 20.6 C 8.4 20.3 11.1 17.5 11.2 12.1 M7.6 16.6 L11.7 20.8",
  ],
};
