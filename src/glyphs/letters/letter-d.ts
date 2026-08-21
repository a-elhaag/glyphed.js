import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "d", 3 wobble variants. */
export const letterD: GlyphEntry = {
  width: 12,
  variants: [
    "M9.5 3 L9.5 20 M9.5 12 C 5.5 10 1 12.5 1 16 C 1 19.5 5.5 21 9.5 19",
    "M9.3 3.2 L9.4 20.2 M9.6 11.8 C 5.5 10.0 0.9 12.5 1.2 15.9 C 1.0 19.5 5.7 21.2 9.4 19.2",
    "M9.4 3.0 L9.3 20.0 M9.6 12.1 C 5.5 9.8 0.8 12.3 1.1 16.1 C 1.1 19.3 5.4 20.8 9.6 19.2",
  ],
};
