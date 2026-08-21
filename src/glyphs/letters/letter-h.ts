import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "h", 3 wobble variants. */
export const letterH: GlyphEntry = {
  width: 12,
  variants: [
    "M2 3 L2 20 M2 11 C 4 8.5 8.5 8.5 9.5 11.5 L9.5 20",
    "M1.9 3.2 L1.8 20.1 M1.8 10.8 C 4.2 8.4 8.4 8.7 9.6 11.3 L9.3 19.8",
    "M1.8 2.8 L2.2 20.2 M2.0 10.8 C 4.1 8.3 8.7 8.6 9.5 11.5 L9.3 20.0",
  ],
};
