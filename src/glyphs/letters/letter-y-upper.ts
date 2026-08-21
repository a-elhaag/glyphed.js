import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "Y" (uppercase), 3 wobble variants. */
export const letterYUpper: GlyphEntry = {
  width: 14,
  variants: [
    "M1 4 L6.5 12.5 L12 4 M6.5 12.5 L6.5 20",
    "M1.0 4.0 L6.4 12.6 L12.1 4.0 M6.6 12.6 L6.7 20.2",
    "M1.0 4.2 L6.7 12.6 L11.8 4.1 M6.7 12.7 L6.4 20.0",
  ],
};
