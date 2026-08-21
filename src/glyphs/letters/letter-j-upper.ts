import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "J" (uppercase), 3 wobble variants. */
export const letterJUpper: GlyphEntry = {
  width: 10,
  variants: [
    "M9 4 L9 16.5 C 9 19.5 6.5 21 3.5 19.5",
    "M8.9 4.0 L8.8 16.5 C 9.0 19.4 6.4 21.0 3.3 19.7",
    "M9.1 3.8 L8.9 16.3 C 9.0 19.6 6.3 21.0 3.5 19.3",
  ],
};
