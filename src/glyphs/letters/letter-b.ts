import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "b", 3 wobble variants. */
export const letterB: GlyphEntry = {
  width: 12,
  variants: [
    "M2 3 L2 20 M2 12 C 6 10 10.5 12.5 10.5 16 C 10.5 19.5 6 21 2 19",
    "M1.8 2.8 L2.2 19.9 M1.9 11.8 C 6.1 10.2 10.7 12.3 10.4 15.8 C 10.6 19.5 5.8 21.2 2.1 19.2",
    "M2.0 3.2 L2.2 20.0 M1.9 11.8 C 6.2 10.0 10.6 12.6 10.3 15.9 C 10.7 19.3 5.9 20.9 1.9 19.1",
  ],
};
