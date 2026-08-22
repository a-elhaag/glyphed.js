import type { IconEntry } from "./types.js";

/** Real hand-drawn glyph: "trash", 3 wobble variants. */
export const iconTrash: IconEntry = {
  width: 32,
  height: 32,
  variants: [
    "M9 11 L23 11 M13 8 L19 8 M11 11 L12 26 L20 26 L21 11",
    "M8.8 11.2 L23.2 10.8 M13.2 7.8 L18.8 8.2 M11.2 10.8 L12.2 26.2 L19.8 25.8 L20.8 11.2",
    "M9.2 10.8 L22.8 11.2 M12.8 8.2 L19.2 7.8 M10.8 11.2 L11.8 25.8 L20.2 26.2 L21.2 10.8",
  ],
};
