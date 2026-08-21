import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "q", 3 wobble variants. */
export const letterQ: GlyphEntry = {
  width: 12,
  variants: [
    "M9 8 L9 23 M9 8 C 5 6.5 1 9.5 1 13 C 1 16.5 5 18.5 9 17",
    "M9.1 7.8 L9.2 23.0 M9.1 8.1 C 5.2 6.5 0.8 9.5 1.0 12.8 C 1.2 16.6 4.9 18.4 8.8 17.0",
    "M8.9 8.0 L9.0 23.2 M8.9 7.8 C 5.1 6.4 0.8 9.4 1.0 13.1 C 0.9 16.6 4.8 18.6 8.8 17.1",
  ],
};
