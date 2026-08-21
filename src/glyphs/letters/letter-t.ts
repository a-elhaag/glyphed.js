import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "t", 3 wobble variants. */
export const letterT: GlyphEntry = {
  width: 10,
  variants: [
    "M4.5 4 L4.5 17 C 4.5 19.5 6.5 20 8 19 M1.5 9 L8 9",
    "M4.3 3.9 L4.4 17.0 C 4.3 19.6 6.4 19.8 8.2 18.9 M1.4 9.0 L7.8 9.1",
    "M4.3 3.9 L4.4 16.8 C 4.4 19.3 6.5 19.8 7.8 18.8 M1.5 8.9 L7.8 8.8",
  ],
};
