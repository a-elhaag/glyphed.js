import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "n", 3 wobble variants. */
export const letterN: GlyphEntry = {
  width: 8,
  variants: [
    "M1 20 L1 9 C 1 9 4.5 7.5 5.5 11.5 L5.5 20",
    "M1.0 20.2 L0.9 9.2 C 1.2 8.8 4.3 7.4 5.3 11.5 L5.4 19.9",
    "M0.9 20.2 L1.1 9.2 C 1.1 9.1 4.4 7.5 5.3 11.6 L5.5 19.9",
  ],
};
