import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: "—" (em dash), 3 wobble variants. */
export const punctEmDash: GlyphEntry = {
  width: 12,
  variants: [
    "M1 12 L11 12",
    "M0.9 12.1 L11.1 11.9",
    "M1.1 11.9 L10.9 12.1",
  ],
};
