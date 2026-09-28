// Scores the showcase from its own timeline: a soft chord bed, a felt-piano pluck on every scene,
// a pencil scratch for every pen stroke (panned to where it lands on screen), and an airy whoosh
// under each marker wipe. Pure PCM math — no samples, no dependencies.
const RATE = 48000;

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

/** Deterministic noise so the soundtrack is identical on every render. */
function noiseSource(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return (((r ^ (r >>> 14)) >>> 0) / 4294967296) * 2 - 1;
  };
}

function addStereo(L, R, start, samples, pan, gain) {
  // Equal-power pan, pan in [0, 1].
  const gl = Math.cos((pan * Math.PI) / 2) * gain;
  const gr = Math.sin((pan * Math.PI) / 2) * gain;
  for (let i = 0; i < samples.length; i++) {
    const idx = start + i;
    if (idx < 0 || idx >= L.length) continue;
    L[idx] += samples[i] * gl;
    R[idx] += samples[i] * gr;
  }
}

/** Slow chord bed: Cmaj9 → Am9 → Fmaj9 → G6/9, long crossfades, a touch of stereo detune. */
function pad(L, R, total) {
  const chords = [
    [48, 52, 55, 59, 62],
    [45, 48, 52, 55, 59],
    [41, 45, 48, 52, 55],
    [43, 47, 50, 52, 57],
  ];
  const len = 6.2;
  const count = Math.ceil(total / len) + 1;
  for (let c = 0; c < count; c++) {
    const notes = chords[c % chords.length];
    const t0 = c * len - 0.6;
    const t1 = t0 + len + 1.8;
    const a = Math.max(0, Math.floor(t0 * RATE));
    const b = Math.min(L.length, Math.floor(t1 * RATE));
    for (let i = a; i < b; i++) {
      const t = i / RATE;
      const local = t - t0;
      const env = Math.min(1, local / 1.4) * Math.min(1, (t1 - t) / 1.8);
      const e = env * env * (3 - 2 * env);
      let l = 0;
      let r = 0;
      notes.forEach((n, k) => {
        const f = midi(n);
        const w = 0.5 + 0.5 * Math.sin(2 * Math.PI * (0.07 + k * 0.013) * t + k);
        l += (Math.sin(2 * Math.PI * f * 0.9985 * t) + 0.18 * Math.sin(4 * Math.PI * f * t)) * (0.6 + 0.4 * w);
        r += (Math.sin(2 * Math.PI * f * 1.0015 * t) + 0.18 * Math.sin(4 * Math.PI * f * 1.001 * t)) * (0.6 + 0.4 * (1 - w));
      });
      const root = Math.sin(2 * Math.PI * midi(notes[0] - 12) * t) * 0.5;
      L[i] += (l * 0.011 + root * 0.02) * e;
      R[i] += (r * 0.011 + root * 0.02) * e;
    }
  }
}

/** Felt-piano-ish pluck: a few decaying partials with a soft attack. */
function pluck(freq, seconds = 2.2) {
  const n = Math.floor(seconds * RATE);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const env = Math.min(1, t / 0.006) * Math.exp(-t * 2.6);
    out[i] =
      env *
      (Math.sin(2 * Math.PI * freq * t) +
        0.35 * Math.exp(-t * 3) * Math.sin(2 * Math.PI * freq * 2.001 * t) +
        0.12 * Math.exp(-t * 6) * Math.sin(2 * Math.PI * freq * 3.003 * t));
  }
  return out;
}

/** Pencil on paper: band-limited noise with grain, length follows the stroke. */
function scratch(noise, seconds, bright) {
  const n = Math.max(1, Math.floor(seconds * RATE));
  const out = new Float32Array(n);
  let lp = 0;
  let prev = 0;
  let grain = 1;
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    if (i % 90 === 0) grain = 0.55 + 0.45 * Math.abs(noise());
    const x = noise();
    lp += (x - lp) * (0.35 + 0.25 * bright);
    const hp = lp - prev;
    prev = lp;
    const env = Math.min(1, t / 0.004) * Math.min(1, (seconds - t) / 0.03) * (0.7 + 0.3 * Math.sin((Math.PI * t) / seconds));
    out[i] = hp * env * grain * 2.2;
  }
  return out;
}

/** Air moving past: noise through a band-pass that sweeps up then settles. */
function whoosh(noise, seconds) {
  const n = Math.floor(seconds * RATE);
  const out = new Float32Array(n);
  let low = 0;
  let band = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const f = 250 + 2600 * Math.sin(Math.PI * Math.min(1, p * 1.1));
    const fc = 2 * Math.sin((Math.PI * f) / RATE);
    const q = 0.55;
    const x = noise();
    low += fc * band;
    const high = x - low - q * band;
    band += fc * high;
    const env = Math.pow(Math.sin(Math.PI * p), 1.6);
    out[i] = band * env * 0.9;
  }
  return out;
}

export function scoreShowcase({ total, events, scenes }) {
  const length = Math.ceil((total + 1) * RATE);
  const L = new Float32Array(length);
  const R = new Float32Array(length);
  const noise = noiseSource(7);

  pad(L, R, total);

  // A three-note pluck figure on every scene entrance, climbing through the chord of the moment.
  const figures = [[72, 76, 79], [69, 72, 76], [65, 69, 72], [67, 71, 74], [72, 76, 79], [69, 72, 76], [72, 79, 84]];
  scenes.forEach((s, i) => {
    const notes = figures[i % figures.length];
    notes.forEach((n, k) => {
      addStereo(L, R, Math.floor((s.from + 0.25 + k * 0.12) * RATE), pluck(midi(n)), 0.35 + 0.15 * k, 0.055);
    });
  });

  // Pen strokes. Busy moments (icon grids, chart hatching) get thinned so they read as texture, not noise.
  const lastByBucket = new Map();
  const level = { pen: 0.05, icon: 0.035, chart: 0.03, marker: 0.07, soft: 0.025 };
  for (const e of events) {
    if (e.type === "whoosh") continue;
    const bucket = Math.round(e.t * 40);
    if (lastByBucket.get(bucket)) continue;
    lastByBucket.set(bucket, true);
    const seconds = Math.min(0.16, Math.max(0.05, e.dur * 0.35));
    const bright = e.type === "marker" ? 0.2 : 0.8;
    const pan = 0.15 + 0.7 * Math.min(1, Math.max(0, e.x ?? 0.5));
    addStereo(L, R, Math.floor(e.t * RATE), scratch(noise, e.type === "marker" ? e.dur * 0.8 : seconds, bright), pan, level[e.type] ?? 0.04);
  }

  // Wipes: a whoosh that travels left to right with the marker.
  for (const e of events) {
    if (e.type !== "whoosh") continue;
    const w = whoosh(noise, e.dur);
    const start = Math.floor(e.t * RATE);
    for (let i = 0; i < w.length; i++) {
      const p = i / w.length;
      const idx = start + i;
      if (idx < 0 || idx >= length) continue;
      L[idx] += w[i] * 0.11 * Math.cos((p * Math.PI) / 2);
      R[idx] += w[i] * 0.11 * Math.sin((p * Math.PI) / 2);
    }
  }

  // Master: gentle fade in/out, soft saturation, normalise to -1 dBFS.
  const fadeIn = 0.4 * RATE;
  const fadeOut = 1.2 * RATE;
  const end = Math.floor(total * RATE);
  let peak = 0;
  for (let i = 0; i < length; i++) {
    let g = Math.min(1, i / fadeIn);
    if (i > end - fadeOut) g *= Math.max(0, (end - i) / fadeOut);
    L[i] = Math.tanh(L[i] * g * 1.4);
    R[i] = Math.tanh(R[i] * g * 1.4);
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  const norm = peak > 0 ? 0.89 / peak : 1;
  return wav(L, R, norm);
}

function wav(L, R, norm) {
  const frames = L.length;
  const data = Buffer.alloc(frames * 4);
  for (let i = 0; i < frames; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), i * 4 + 2);
  }
  const head = Buffer.alloc(44);
  head.write("RIFF", 0);
  head.writeUInt32LE(36 + data.length, 4);
  head.write("WAVE", 8);
  head.write("fmt ", 12);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(2, 22);
  head.writeUInt32LE(RATE, 24);
  head.writeUInt32LE(RATE * 4, 28);
  head.writeUInt16LE(4, 32);
  head.writeUInt16LE(16, 34);
  head.write("data", 36);
  head.writeUInt32LE(data.length, 40);
  return Buffer.concat([head, data]);
}
