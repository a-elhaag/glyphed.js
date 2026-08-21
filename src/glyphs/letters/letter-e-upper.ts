import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "E" (uppercase), 3 wobble variants. */
export const letterEUpper: GlyphEntry = {
  width: 10,
  variants: [
    "M9 4 L2 4 L2 20 L9 20 M2 12 L7.5 12",
    "M9.2 4.0 L2.2 4.1 L2.0 20.0 L9.0 20.2 M2.2 12.0 L7.6 11.8",
    "M8.8 4.1 L2.0 4.0 L2.1 19.9 L9.1 20.2 M1.9 11.9 L7.6 12.0",
  ],
};
