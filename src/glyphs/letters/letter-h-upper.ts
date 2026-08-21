import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "H" (uppercase), 3 wobble variants. */
export const letterHUpper: GlyphEntry = {
  width: 12,
  variants: [
    "M2 4 L2 20 M10 4 L10 20 M2 12 L10 12",
    "M1.9 3.8 L2.1 20.0 M10.2 4.0 L10.1 20.1 M2.0 12.1 L10.0 12.0",
    "M2.0 4.0 L1.8 20.1 M10.1 4.0 L10.1 20.1 M1.9 12.1 L10.1 12.1",
  ],
};
