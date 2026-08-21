import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "Z" (uppercase), 3 wobble variants. */
export const letterZUpper: GlyphEntry = {
  width: 13,
  variants: [
    "M1 4 L11 4 L1 20 L11 20",
    "M1.1 4.1 L10.9 4.0 L0.9 20.1 L11.0 19.8",
    "M1.1 4.0 L11.0 4.0 L0.9 20.0 L11.0 20.0",
  ],
};
