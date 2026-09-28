/** A source of uniform numbers in [0, 1). `Math.random` by default; pass a seed for repeatable marks. */
export type Rng = () => number;

/** mulberry32 — tiny, fast, good enough for wobble. Same seed, same drawing (useful for SSR hydration). */
export function seeded(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngFor(seed: number | undefined): Rng {
  return seed === undefined ? Math.random : seeded(seed);
}

/** Uniform value in [-amount, amount]. */
export function signed(rng: Rng, amount: number): number {
  return (rng() * 2 - 1) * amount;
}
