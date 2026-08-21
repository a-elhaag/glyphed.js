import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "z", 3 wobble variants. */
export const letterZ: GlyphEntry = {
  width: 11,
  variants: [
    "M1 9 L9 9 L1 20 L9 20",
    "M1.2 9.2 L8.8 8.8 L1.2 20.1 L9.0 19.9",
    "M0.8 8.9 L9.0 8.9 L0.9 19.8 L9.2 19.9",
  ],
};
