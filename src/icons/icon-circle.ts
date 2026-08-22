import type { IconEntry } from "./types.js";

/** Real hand-drawn glyph: "circle", 3 wobble variants. */
export const iconCircle: IconEntry = {
  width: 32,
  height: 32,
  variants: [
    "M23 16 C 23 11.5 19.5 8 15.5 8 C 11 8 8 11.5 8 16 C 8 20.5 11 24 15.5 24 C 19.5 24 23 20 23 16",
    "M23.2 15.8 C 23.1 11.3 19.6 7.7 15.7 7.6 C 11.6 7.9 7.8 11.6 8.2 16.3 C 7.9 20.6 11.6 23.8 15.6 23.7 C 19.2 23.4 23.2 20.2 22.8 15.7",
    "M22.8 16.2 C 22.9 11.7 19.4 8.3 15.3 8.4 C 11.4 8.1 8.2 11.4 7.8 15.7 C 8.1 20.4 11.4 24.3 15.4 24.3 C 19.8 24.6 22.8 19.8 23.2 16.3",
  ],
};
