import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "j", 3 wobble variants. */
export const letterJ: GlyphEntry = {
  width: 9,
  variants: [
    "M6 9 L6 20.5 C 6 22 4.3 22.4 3 21.8 M6 4.5 L6.2 4.7",
    "M5.9 8.8 L6.2 20.4 C 5.9 22.0 4.3 22.2 2.9 22.0 M6.2 4.7 L6.3 4.5",
    "M6.2 9.2 L5.8 20.3 C 5.8 22.1 4.1 22.5 2.8 21.7 M5.8 4.6 L6.1 4.9",
  ],
};
