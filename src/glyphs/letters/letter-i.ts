import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "i", 3 wobble variants. */
export const letterI: GlyphEntry = {
  width: 8,
  variants: [
    "M5 9 L5 20 M5 4.5 L5.2 4.7",
    "M5.0 8.9 L4.9 19.9 M5.1 4.4 L5.2 4.6",
    "M4.8 8.9 L5.2 20.0 M4.8 4.5 L5.1 4.9",
  ],
};
