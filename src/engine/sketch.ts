/**
 * Turns clean geometry into a hand-drawn stroke: vertices drift a little, straight lines bow,
 * curve handles loosen, and closed shapes don't meet — the pen runs past its start like a real loop.
 */
import { signed, type Rng } from "./random.js";
import { fmt } from "./stroke.js";
import type { Point } from "./shapes.js";

interface Segment {
  c1?: Point;
  c2?: Point;
  to: Point;
}

interface Subpath {
  start: Point;
  segments: Segment[];
  closed: boolean;
}

export interface SketchOptions {
  /** 0 = clean geometry, 1 = default hand, 2 = in a hurry. In path units, tuned for a 24-unit grid. */
  roughness?: number;
  /** Let closed shapes overshoot their start (default true). */
  overshoot?: boolean;
}

const TOKEN = /[MLCZ]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;

function parse(d: string): Subpath[] {
  const tokens = d.match(TOKEN) ?? [];
  const subpaths: Subpath[] = [];
  let current: Subpath | undefined;
  let command = "";
  let i = 0;
  const num = () => Number(tokens[i++]);
  const pt = (): Point => [num(), num()];

  while (i < tokens.length) {
    if (/^[MLCZ]$/i.test(tokens[i])) command = tokens[i++].toUpperCase();
    if (command === "M") {
      current = { start: pt(), segments: [], closed: false };
      subpaths.push(current);
      command = "L"; // implicit lineto after the first moveto pair
    } else if (command === "L" && current) {
      current.segments.push({ to: pt() });
    } else if (command === "C" && current) {
      current.segments.push({ c1: pt(), c2: pt(), to: pt() });
    } else if (command === "Z" && current) {
      const last = current.segments[current.segments.length - 1]?.to ?? current.start;
      if (Math.hypot(last[0] - current.start[0], last[1] - current.start[1]) > 0.01) {
        current.segments.push({ to: [...current.start] });
      }
      current.closed = true;
      command = "";
    } else {
      i++; // unsupported token; skip rather than throw on user-supplied paths
    }
  }
  return subpaths;
}

const add = (a: Point, b: Point): Point => [a[0] + b[0], a[1] + b[1]];
const len = (a: Point, b: Point) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** Wobbles a path built from M / L / C / Z. Fresh randomness per call unless `rng` is seeded. */
export function sketch(d: string, rng: Rng = Math.random, options: SketchOptions = {}): string {
  const { roughness = 1, overshoot = true } = options;
  if (roughness <= 0) return d;
  const out: string[] = [];

  for (const sub of parse(d)) {
    const { segments } = sub;
    if (segments.length === 0) continue;

    // Drift each vertex once, so segments that share it stay joined. Short segments drift less.
    const vertices = [sub.start, ...segments.map((seg) => seg.to)];
    const chords = segments.map((_, i) => len(vertices[i], vertices[i + 1]));
    const offsets = vertices.map((_, i): Point => {
      const shortest = Math.min(chords[i - 1] ?? Infinity, chords[i] ?? Infinity);
      const amount = roughness * 0.45 * Math.min(1, shortest / 4);
      return [signed(rng, amount), signed(rng, amount)];
    });
    if (sub.closed) offsets[segments.length] = [signed(rng, roughness * 0.35), signed(rng, roughness * 0.35)];

    const start = add(sub.start, offsets[0]);
    let d2 = `M${fmt(start[0])} ${fmt(start[1])}`;
    let from = start;
    let firstHandle: Point | undefined;

    segments.forEach((seg, i) => {
      const to = add(seg.to, offsets[i + 1]);
      let c1: Point;
      let c2: Point;
      if (seg.c1 && seg.c2) {
        const loose = roughness * 0.25;
        c1 = add(add(seg.c1, offsets[i]), [signed(rng, loose), signed(rng, loose)]);
        c2 = add(add(seg.c2, offsets[i + 1]), [signed(rng, loose), signed(rng, loose)]);
      } else {
        // Bow straight lines: both handles pushed to the same side, by an amount that grows with length.
        const l = len(from, to) || 1;
        const nx = -(to[1] - from[1]) / l;
        const ny = (to[0] - from[0]) / l;
        const bow = signed(rng, roughness * Math.min(l * 0.035, 1.2 + l * 0.008));
        const bow2 = bow * (0.6 + rng() * 0.4);
        c1 = [from[0] + (to[0] - from[0]) / 3 + nx * bow, from[1] + (to[1] - from[1]) / 3 + ny * bow];
        c2 = [from[0] + ((to[0] - from[0]) * 2) / 3 + nx * bow2, from[1] + ((to[1] - from[1]) * 2) / 3 + ny * bow2];
      }
      if (i === 0) firstHandle = c1;
      d2 += ` C${fmt(c1[0])} ${fmt(c1[1])} ${fmt(c2[0])} ${fmt(c2[1])} ${fmt(to[0])} ${fmt(to[1])}`;
      from = to;
    });

    if (sub.closed && overshoot && firstHandle) {
      // Run the pen a little past where the loop started, heading the way the first stroke went.
      const dir: Point = [firstHandle[0] - start[0], firstHandle[1] - start[1]];
      const l = Math.hypot(dir[0], dir[1]) || 1;
      const reach = Math.min(roughness * (1 + rng() * 1.2), l * 1.5);
      const end: Point = [
        from[0] + (dir[0] / l) * reach + signed(rng, roughness * 0.3),
        from[1] + (dir[1] / l) * reach + signed(rng, roughness * 0.3),
      ];
      const mid: Point = [(from[0] + end[0]) / 2, (from[1] + end[1]) / 2];
      d2 += ` C${fmt(mid[0])} ${fmt(mid[1])} ${fmt(mid[0])} ${fmt(mid[1])} ${fmt(end[0])} ${fmt(end[1])}`;
    }

    out.push(d2);
  }

  return out.join(" ");
}
