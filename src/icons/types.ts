/** A hand-drawn icon: named clean strokes on a 24×24 grid (same grid and pen as the letters). The engine wobbles them on every render. */
export interface Icon {
  name: string;
  /** One path `d` per pen stroke, in drawing order. Absolute M / L / C / Z only. */
  strokes: string[];
}

export function icon(name: string, strokes: string[]): Icon {
  return { name, strokes };
}
