/**
 * Clean geometry builders. Each returns an SVG path `d` using only absolute M / L / C / Z,
 * the subset `sketch()` knows how to wobble. Angles are in degrees, clockwise from +x (SVG's y-down).
 */
import { fmt } from "./stroke.js";

export type Point = [number, number];

const p = (x: number, y: number) => `${fmt(x)} ${fmt(y)}`;
const rad = (deg: number) => (deg * Math.PI) / 180;

export function line(x1: number, y1: number, x2: number, y2: number): string {
  return `M${p(x1, y1)} L${p(x2, y2)}`;
}

/** A dot, drawn the way the glyphs draw a period: a tiny tick that the round cap turns into a blob. */
export function dot(x: number, y: number): string {
  return `M${p(x, y)} L${p(x + 0.2, y + 0.2)}`;
}

export function poly(points: Point[], closed = false): string {
  const [first, ...rest] = points;
  return `M${p(...first)}${rest.map((pt) => ` L${p(...pt)}`).join("")}${closed ? " Z" : ""}`;
}

/** Smooth Catmull-Rom curve through every point. Lower `tension` hugs the points tighter (less overshoot). */
export function curve(points: Point[], closed = false, tension = 1): string {
  if (points.length < 3) return poly(points, closed);
  const n = points.length;
  const at = (i: number): Point =>
    closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))];
  const segments = closed ? n : n - 1;
  const k = tension / 6;
  let d = `M${p(...points[0])}`;
  for (let i = 0; i < segments; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    d +=
      ` C${p(p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k)}` +
      ` ${p(p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k)} ${p(...p2)}`;
  }
  return closed ? `${d} Z` : d;
}

/** Point on an ellipse at `deg`. */
export function polar(cx: number, cy: number, rx: number, ry: number, deg: number): Point {
  return [cx + rx * Math.cos(rad(deg)), cy + ry * Math.sin(rad(deg))];
}

/** Cubic segments (no leading M) tracing an elliptical arc from a0 to a1. Chain onto an existing path. */
export function arcTo(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): string {
  const count = Math.max(1, Math.ceil(Math.abs(a1 - a0) / 90));
  const step = (a1 - a0) / count;
  const k = (4 / 3) * Math.tan(rad(step) / 4);
  let d = "";
  for (let i = 0; i < count; i++) {
    const s = rad(a0 + step * i);
    const e = rad(a0 + step * (i + 1));
    d +=
      ` C${p(cx + rx * (Math.cos(s) - k * Math.sin(s)), cy + ry * (Math.sin(s) + k * Math.cos(s)))}` +
      ` ${p(cx + rx * (Math.cos(e) + k * Math.sin(e)), cy + ry * (Math.sin(e) - k * Math.cos(e)))}` +
      ` ${p(cx + rx * Math.cos(e), cy + ry * Math.sin(e))}`;
  }
  return d;
}

export function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): string {
  return `M${p(...polar(cx, cy, rx, ry, a0))}${arcTo(cx, cy, rx, ry, a0, a1)}`;
}

/** Full ellipse. Starts upper-left, where a right-handed pen usually starts a loop. */
export function ellipse(cx: number, cy: number, rx: number, ry: number, start = -150): string {
  return `${arc(cx, cy, rx, ry, start, start + 360)} Z`;
}

export function circle(cx: number, cy: number, r: number, start?: number): string {
  return ellipse(cx, cy, r, r, start);
}

export function rect(x: number, y: number, w: number, h: number, r = 0): string {
  if (r <= 0) return poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true);
  r = Math.min(r, w / 2, h / 2);
  return (
    `M${p(x + r, y)} L${p(x + w - r, y)}${arcTo(x + w - r, y + r, r, r, -90, 0)}` +
    ` L${p(x + w, y + h - r)}${arcTo(x + w - r, y + h - r, r, r, 0, 90)}` +
    ` L${p(x + r, y + h)}${arcTo(x + r, y + h - r, r, r, 90, 180)}` +
    ` L${p(x, y + r)}${arcTo(x + r, y + r, r, r, 180, 270)} Z`
  );
}

/** Two barbs meeting at a tip. `deg` is the direction the arrow travels. */
export function head(x: number, y: number, deg: number, size = 4.5): string {
  return poly([polar(x, y, size, size, deg + 145), [x, y], polar(x, y, size, size, deg - 145)]);
}

/** Closed n-pointed star. */
export function star(cx: number, cy: number, outer: number, inner: number, points = 5): string {
  const pts: Point[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    pts.push(polar(cx, cy, r, r, -90 + (180 / points) * i));
  }
  return poly(pts, true);
}

/** `count` short radial strokes between r1 and r2 — sun rays, sparkles, tick marks. */
export function rays(cx: number, cy: number, r1: number, r2: number, count: number, start = 0): string[] {
  return Array.from({ length: count }, (_, i) => {
    const a = start + (360 / count) * i;
    return line(...polar(cx, cy, r1, r1, a), ...polar(cx, cy, r2, r2, a));
  });
}

/** Parallel lines at `deg` spaced `gap` apart, covering the box. Clip them to a shape for a hatched fill. */
export function hatch(x: number, y: number, w: number, h: number, gap = 5, deg = 45): string {
  const dx = Math.cos(rad(deg));
  const dy = Math.sin(rad(deg));
  const cx = x + w / 2;
  const cy = y + h / 2;
  const half = Math.hypot(w, h) / 2;
  const parts: string[] = [];
  for (let o = -half; o <= half; o += gap) {
    // Offset along the normal, alternate direction so the pen zig-zags like real shading.
    const ox = cx - dy * o;
    const oy = cy + dx * o;
    const sign = parts.length % 2 === 0 ? 1 : -1;
    parts.push(line(ox - dx * half * sign, oy - dy * half * sign, ox + dx * half * sign, oy + dy * half * sign));
  }
  return parts.join(" ");
}
