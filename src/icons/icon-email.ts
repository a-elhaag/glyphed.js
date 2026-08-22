import type { IconEntry } from "./types.js";

/** Real hand-drawn glyph: "email", 3 wobble variants. */
export const iconEmail: IconEntry = {
  width: 32,
  height: 32,
  variants: [
    "M6 9 L26 9 L26 23 L6 23 L6 9 M6 9 L16 17 L26 9",
    "M6.2 8.8 L26.2 9.2 L25.8 23.2 L5.8 22.8 L6.2 8.8 M6.2 9.2 L16.2 16.8 L25.8 8.8",
    "M5.8 9.2 L25.8 8.8 L26.2 22.8 L6.2 23.2 L5.8 9.2 M5.8 8.8 L15.8 17.2 L26.2 9.2",
  ],
};
