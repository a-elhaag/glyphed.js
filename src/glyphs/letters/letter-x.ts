import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "x", 3 wobble variants. */
export const letterX: GlyphEntry = {
  width: 11,
  variants: [
    "M1 9 L9 20 M9 9 L1 20",
    "M1.2 8.9 L9.0 20.0 M9.2 9.1 L1.1 20.0",
    "M0.8 9.1 L8.9 19.8 M9.1 9.0 L0.9 19.9",
  ],
};
