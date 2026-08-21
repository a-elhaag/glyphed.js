import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "k", 3 wobble variants. */
export const letterK: GlyphEntry = {
  width: 12,
  variants: [
    "M2 3 L2 20 M9 9 L3 14 L9.5 20",
    "M2.0 2.8 L2.2 19.8 M8.9 9.0 L3.1 14.0 L9.5 20.0",
    "M2.0 2.9 L2.0 20.2 M9.1 9.1 L3.2 14.0 L9.7 20.2",
  ],
};
