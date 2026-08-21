import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "s", 3 wobble variants. */
export const letterS: GlyphEntry = {
  width: 11,
  variants: [
    "M8.5 10 C 7.5 8 3.5 8 3 10.5 C 2.5 13 6.5 13.5 7 16 C 7.5 18.5 3.5 19.5 1.5 17.5",
    "M8.5 10.0 C 7.4 8.1 3.5 8.1 2.8 10.6 C 2.5 13.1 6.6 13.5 7.0 16.0 C 7.7 18.3 3.6 19.7 1.4 17.3",
    "M8.7 10.0 C 7.6 8.2 3.6 7.8 3.2 10.4 C 2.4 13.0 6.4 13.6 6.8 16.0 C 7.5 18.7 3.7 19.4 1.7 17.4",
  ],
};
